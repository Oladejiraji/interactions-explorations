"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GRID = 30;
const GAP = 0.12;
const CUBE_SIZE: [number, number, number] = [0.008, 0.008, 0.1];
const ANIM_DURATION = 2;
const WAVE_SPREAD = 4;

function ease(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
}

// Deterministic pseudo-random per instance
function hash(i: number) {
  let x = i * 2654435761;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return (x & 0xffff) / 0xffff;
}

function VoxelGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = GRID * GRID;
  const elapsed = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const { positions, delays } = useMemo(() => {
    const offsetX = ((GRID - 1) * GAP) / 2;
    const offsetZ = ((GRID - 1) * GAP) / 2;
    const maxDist = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
    const pos: [number, number, number][] = [];
    const del: number[] = [];
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        const px = x * GAP - offsetX;
        const pz = z * GAP - offsetZ;
        pos.push([px, 0, pz]);
        // Mix distance-based ripple with random chaos
        const dist = Math.sqrt(px * px + pz * pz);
        const idx = x * GRID + z;
        const ripple = (dist / maxDist) * WAVE_SPREAD * 0.4;
        const random = hash(idx) * WAVE_SPREAD;
        del.push(ripple + random);
      }
    }
    return { positions: pos, delays: del };
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    elapsed.current += delta;
    let allDone = true;

    for (let i = 0; i < count; i++) {
      const localT = (elapsed.current - delays[i]) / ANIM_DURATION;
      const clamped = Math.max(0, Math.min(1, localT));
      if (clamped < 1) allDone = false;
      const e = ease(clamped);

      // Per-instance random rotation direction and overshoot
      const rx = hash(i * 3) > 0.5 ? 1 : -1;
      const rz = hash(i * 3 + 1) > 0.5 ? 1 : -1;
      const extra = 0.5 + hash(i * 3 + 2) * 1.5; // rotation multiplier 0.5x–2x

      const angleX = (1 - e) * (Math.PI / 2) * rx * extra;
      const angleZ = (1 - e) * (Math.PI / 2) * rz * extra;

      dummy.position.set(...positions[i]);
      dummy.rotation.set(angleX, 0, angleZ);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Per-instance color for opacity: white when visible, black (invisible on black bg) when not started
      const visible = localT > 0 ? 1 : 0;
      color.setRGB(visible, visible, visible);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Stop updating once all animations are done
    if (allDone) elapsed.current = Number.POSITIVE_INFINITY;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={CUBE_SIZE} />
      <meshStandardMaterial color="#ffffff" />
    </instancedMesh>
  );
}

const ThreeVoxel = () => {
  return (
    <div className="h-screen w-screen bg-black">
      <Canvas orthographic camera={{ position: [0, 8, 0], zoom: 200 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <VoxelGrid />
        <OrbitControls enabled={false} />
      </Canvas>
    </div>
  );
};

export default ThreeVoxel;
