"use client";
import React, { Fragment, Suspense, useRef } from "react";
import { OrbitControls, shaderMaterial, Stats } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import vertexShader from "../../shaders/freestyle/vertex.glsl";
import fragmentShader from "../../shaders/freestyle/fragment.glsl";
import { Vector3 } from "three";
import { Spot, type PulseUniforms } from "@/components/freestyle/spot";

export const CardMaterial = shaderMaterial(
  {
    uTime: 0,
    uAspectRatio: 0,
    uDarkColor: 1,
    uOrigin: new Vector3(0, 0, 0),
  },
  vertexShader,
  fragmentShader,
);

extend({ CardMaterial });

function Experience() {
  const { viewport } = useThree((state) => state);
  const materialRef = useRef<any>(null);

  const pulseUniforms = useRef<PulseUniforms>({
    uTime: { value: 0 },
    uOrigin: { value: new Vector3(0, 0, 0) },
    uAspectRatio: { value: 1 },
    uDarkColor: { value: 1 },
  });

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      pulseUniforms.current.uTime.value = materialRef.current.uTime;
      pulseUniforms.current.uAspectRatio.value =
        viewport.width / viewport.height;
    }
  });

  return (
    <Fragment>
      <mesh
        position-z={0}
        onClick={(e) => {
          let uvX = e.uv?.x || 0;
          let uvY = e.uv?.y || 0;

          uvX = uvX * 2.0 - 1.0;
          uvY = uvY * 2.0 - 1.0;

          if (materialRef.current) {
            materialRef.current.uTime = 0;
            materialRef.current.uDarkColor =
              materialRef.current.uDarkColor === 1.0 ? 0.0 : 1.0;
            materialRef.current.uOrigin = new Vector3(uvX, uvY, 0);

            // Sync to model uniforms
            pulseUniforms.current.uTime.value = 0;
            pulseUniforms.current.uDarkColor.value =
              materialRef.current.uDarkColor;
            pulseUniforms.current.uOrigin.value.set(uvX, uvY, 0);
          }
        }}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        {/* @ts-ignore */}
        <cardMaterial
          ref={materialRef}
          uAspectRatio={viewport.width / viewport.height}
          uDarkColor={1.0}
        />
      </mesh>

      <Suspense fallback={null}>
        <Spot
          pulseUniforms={pulseUniforms.current}
          scale={2.2}
          position={new Vector3(0, -2.2, 0.1)}
          rotationY={Math.PI}
        />
      </Suspense>
    </Fragment>
  );
}

export default function Page() {
  return (
    <Canvas
      gl={{ localClippingEnabled: true }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Stats />
      <OrbitControls enabled={false} />
      <Experience />
    </Canvas>
  );
}
