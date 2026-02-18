"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { landscape } from "@/lib/assets";

// --- WebGL depth effect setup ---

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = vec2((position.x + 1.0) / 2.0, 1.0 - (position.y + 1.0) / 2.0);
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform sampler2D uDepth;
  uniform vec2 uMouse;
  uniform float uIntensity;

  void main() {
    float depth = texture2D(uDepth, vUv).r;
    vec2 offset = uMouse * depth * uIntensity;
    gl_FragColor = texture2D(uImage, vUv + offset);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function loadTexture(
  gl: WebGLRenderingContext,
  url: string,
): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture();
    if (!texture) return reject(new Error("Failed to create texture"));
    const image = new window.Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      resolve(texture);
    };
    image.onerror = reject;
    image.src = url;
  });
}

const DEPTH_INTENSITY = 0.04;
const LERP_FACTOR = 0.06;

// --- Component ---

const Glare = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Single mousemove drives both WebGL depth + tilt/glare
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = linkProgram(gl, vs, fs);
    if (!program) return;

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      // Feed WebGL depth effect
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);

      // Feed tilt/glare from card-relative position
      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        setIsHovering(inside);
        if (inside) {
          setPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        } else {
          setPos({ x: 50, y: 50 });
        }
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    let rafId = 0;

    Promise.all([
      loadTexture(gl, "/persp1.png"),
      loadTexture(gl, "/depth.png"),
    ]).then(([imageTex, depthTex]) => {
      const uImage = gl.getUniformLocation(program, "uImage");
      const uDepth = gl.getUniformLocation(program, "uDepth");
      const uMouse = gl.getUniformLocation(program, "uMouse");
      const uIntensity = gl.getUniformLocation(program, "uIntensity");

      let prevWidth = 0;
      let prevHeight = 0;

      const render = () => {
        mouse.x += (target.x - mouse.x) * LERP_FACTOR;
        mouse.y += (target.y - mouse.y) * LERP_FACTOR;

        const w = canvas.clientWidth * devicePixelRatio;
        const h = canvas.clientHeight * devicePixelRatio;
        if (w !== prevWidth || h !== prevHeight) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
          prevWidth = w;
          prevHeight = h;
        }

        gl.useProgram(program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, imageTex);
        gl.uniform1i(uImage, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, depthTex);
        gl.uniform1i(uDepth, 1);

        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uIntensity, DEPTH_INTENSITY);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        rafId = requestAnimationFrame(render);
      };

      render();
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative flex flex-col items-center">
        <div
          ref={cardRef}
          className="relative w-[455px] h-[607px] overflow-hidden rounded-md"
        >
          <Image
            src={landscape}
            alt="Background"
            width={455}
            height={607}
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div>
              <div className="relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-[320px] h-[404px] object-cover"
                />

                {/* Metallic sweep */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity hidden duration-300"
                  style={{
                    opacity: isHovering ? 1 : 0,
                    background: `
                      linear-gradient(
                        ${100 + (pos.x - 50) * 0.8}deg,
                        transparent ${pos.x - 40}%,
                        rgba(255, 255, 255, 0.18) ${pos.x - 15}%,
                        rgba(255, 255, 255, 0.38) ${pos.x}%,
                        rgba(255, 255, 255, 0.18) ${pos.x + 15}%,
                        transparent ${pos.x + 40}%
                      )
                    `,
                    mixBlendMode: "overlay",
                  }}
                />

                {/* Cross-sheen */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity hidden duration-300"
                  style={{
                    opacity: isHovering ? 0.8 : 0,
                    background: `
                      linear-gradient(
                        ${200 + (pos.y - 50) * 0.6}deg,
                        transparent ${pos.y - 35}%,
                        rgba(220, 220, 230, 0.15) ${pos.y - 10}%,
                        rgba(255, 255, 255, 0.22) ${pos.y}%,
                        rgba(220, 220, 230, 0.15) ${pos.y + 10}%,
                        transparent ${pos.y + 35}%
                      )
                    `,
                    mixBlendMode: "soft-light",
                  }}
                />

                {/* Edge highlight */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 hidden"
                  style={{
                    opacity: isHovering ? 0.2 : 0,
                    background: `
                      linear-gradient(
                        135deg,
                        rgba(255, 255, 255, ${0.02 + (100 - pos.x) * 0.001}) 0%,
                        transparent 50%,
                        rgba(0, 0, 0, ${0.02 + pos.x * 0.001}) 100%
                      )
                    `,
                    mixBlendMode: "overlay",
                  }}
                />

                {/* Rainbow sheen */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity hidden duration-300"
                  style={{
                    opacity: isHovering ? 0.45 : 0,
                    background: `
                      radial-gradient(
                        circle at ${pos.x}% ${pos.y}%,
                        rgba(255, 0, 0, 0.25) 0%,
                        rgba(255, 180, 0, 0.22) 10%,
                        rgba(0, 255, 100, 0.2) 22%,
                        rgba(0, 200, 255, 0.17) 34%,
                        rgba(100, 0, 255, 0.13) 46%,
                        rgba(255, 0, 200, 0.08) 58%,
                        transparent 70%
                      )
                    `,
                    mixBlendMode: "color-dodge",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Glare;
