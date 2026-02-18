"use client";

import { useEffect, useRef } from "react";

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
    const image = new Image();
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

const INTENSITY = 0.02;
const LERP_FACTOR = 0.06;

const Perspective = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Full-screen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Smoothed mouse state
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1] range centered on viewport
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);
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
        // Lerp mouse for smooth easing
        mouse.x += (target.x - mouse.x) * LERP_FACTOR;
        mouse.y += (target.y - mouse.y) * LERP_FACTOR;

        // Only resize when dimensions actually change
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
        gl.uniform1f(uIntensity, INTENSITY);

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
    <main className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-[500px] h-[700px] rounded-lg" />
    </main>
  );
};

export default Perspective;
