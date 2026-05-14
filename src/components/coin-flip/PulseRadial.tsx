"use client";

import { useEffect, useRef } from "react";
import Coin, { items } from "./Coin";
import useCoinFlip from "./useCoinFlip";
import TokenList from "./TokenList";

export default function PulseRadial() {
  const { activeId, frontId, backId, flipCount, handleSelect, onFlipComplete } =
    useCoinFlip();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const prevFlipCount = useRef(0);
  const width = 400;
  const height = 400;

  // Draw dot pattern with traveling wave
  function drawDots(ctx: CanvasRenderingContext2D, waveFront: number) {
    ctx.clearRect(0, 0, width, height);
    const spacing = 12;
    const cx = width / 2;
    const cy = height / 2;
    const waveWidth = 20;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angle = Math.atan2(dy, dx);

        // Wave intensity: gaussian-ish bump centered at waveFront
        const distFromWave = dist - waveFront;
        const wave =
          waveFront <= 0
            ? 0
            : Math.exp(
                -(distFromWave * distFromWave) / (2 * waveWidth * waveWidth),
              );

        // Displacement: push outward along the wave
        const offset = wave * 14;
        const px = x + Math.cos(angle) * offset;
        const py = y + Math.sin(angle) * offset;

        // Dot size pulses with the wave
        const dotRadius = 1 + wave * 1.5;

        // Opacity: decays as dots get further from center
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const edgeFade = Math.pow(1 - dist / maxDist, 3);
        const alpha = wave * edgeFade;

        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(163, 163, 163, ${alpha})`;
        ctx.fill();
      }
    }
  }


  useEffect(() => {
    if (flipCount <= prevFlipCount.current) return;
    prevFlipCount.current = flipCount;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const start = performance.now();
    const maxRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
    const totalDist = maxRadius + 120;
    const duration = 3000;

    function frame(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const waveFront = eased * totalDist;

      drawDots(ctx!, waveFront);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      }
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [flipCount]);

  return (
    <div className="flex flex-col items-center gap-12">
      <h3 className="text-sm text-neutral-500 font-mono">Canvas Radial</h3>
      <div
        className="relative flex items-center justify-center rounded-2xl overflow-hidden"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0"
        />
        <Coin
          frontId={frontId}
          backId={backId}
          flipCount={flipCount}
          onFlipComplete={onFlipComplete}
        />
      </div>
      <TokenList activeId={activeId} onSelect={handleSelect} />
    </div>
  );
}
