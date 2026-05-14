"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

const items = [
  { id: 1, label: "AAVE", image: "/tokens/aave.svg" },
  { id: 2, label: "GHO", image: "/tokens/gho.svg" },
  { id: 3, label: "ETH", image: "/tokens/eth.svg" },
  { id: 4, label: "USDC", image: "/tokens/usdc.svg" },
  { id: 5, label: "SOL", image: "/tokens/sol.svg" },
];

function useCoinFlip() {
  const [activeId, setActiveId] = useState(1);
  const [frontId, setFrontId] = useState(1);
  const [backId, setBackId] = useState(2);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  function handleSelect(id: number) {
    if (id === activeId || isFlipping) return;

    const isShowingFront = flipCount % 2 === 0;

    if (isShowingFront) {
      setBackId(id);
    } else {
      setFrontId(id);
    }

    const next = flipCount + 1;
    setFlipCount(next);
    setIsFlipping(true);
    setActiveId(id);
  }

  function onFlipComplete() {
    setIsFlipping(false);
  }

  return { activeId, frontId, backId, flipCount, isFlipping, handleSelect, onFlipComplete };
}

function Coin({
  frontId,
  backId,
  flipCount,
  onFlipComplete,
}: {
  frontId: number;
  backId: number;
  flipCount: number;
  onFlipComplete: () => void;
}) {
  const frontItem = items.find((i) => i.id === frontId)!;
  const backItem = items.find((i) => i.id === backId)!;

  return (
    <div className="w-16 h-16" style={{ perspective: 800 }}>
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipCount * 180 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={onFlipComplete}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden border-4 border-neutral-700 shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(6px)",
          }}
        >
          <Image
            src={frontItem.image}
            alt={frontItem.label}
            fill
            className="object-cover"
          />
        </div>

        {/* Edge */}
        {Array.from({ length: 12 }).map((_, i) => {
          const z = -5 + (10 / 11) * i;
          return (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                background: i % 2 === 0 ? "#525252" : "#404040",
                transform: `translateZ(${z}px)`,
              }}
            />
          );
        })}

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden border-4 border-neutral-700 shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(6px)",
          }}
        >
          <Image
            src={backItem.image}
            alt={backItem.label}
            fill
            className="object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}

function TokenList({
  activeId,
  onSelect,
}: {
  activeId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="flex gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex flex-col items-center gap-1.5"
        >
          <div
            className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-colors duration-200 ${
              item.id === activeId
                ? "border-white"
                : "border-neutral-700 hover:border-neutral-400 cursor-pointer"
            }`}
          >
            <Image
              src={item.image}
              alt={item.label}
              fill
              className="object-cover"
            />
          </div>
          <span
            className={`text-[10px] transition-colors ${
              item.id === activeId ? "text-white" : "text-neutral-500"
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

const canvasWidth = 400;
const canvasHeight = 400;

export default function CoinFlipPage() {
  const { activeId, frontId, backId, flipCount, handleSelect, onFlipComplete } =
    useCoinFlip();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const prevFlipCount = useRef(0);

  function drawDots(ctx: CanvasRenderingContext2D, waveFront: number) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const spacing = 12;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const waveWidth = 20;

    for (let x = 0; x < canvasWidth; x += spacing) {
      for (let y = 0; y < canvasHeight; y += spacing) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angle = Math.atan2(dy, dx);

        const distFromWave = dist - waveFront;
        const wave =
          waveFront <= 0
            ? 0
            : Math.exp(
                -(distFromWave * distFromWave) / (2 * waveWidth * waveWidth),
              );

        const offset = wave * 14;
        const px = x + Math.cos(angle) * offset;
        const py = y + Math.sin(angle) * offset;

        const dotRadius = 1 + wave * 1.5;

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
    const maxRadius = Math.sqrt((canvasWidth / 2) ** 2 + (canvasHeight / 2) ** 2);
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
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-12">
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
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
    </div>
  );
}
