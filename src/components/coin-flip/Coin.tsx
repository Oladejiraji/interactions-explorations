"use client";

import { motion } from "motion/react";
import Image from "next/image";

const items = [
  { id: 1, label: "AAVE", image: "/tokens/aave.svg" },
  { id: 2, label: "GHO", image: "/tokens/gho.svg" },
  { id: 3, label: "ETH", image: "/tokens/eth.svg" },
  { id: 4, label: "USDC", image: "/tokens/usdc.svg" },
  { id: 5, label: "SOL", image: "/tokens/sol.svg" },
];

export { items };

interface CoinProps {
  frontId: number;
  backId: number;
  flipCount: number;
  onFlipComplete: () => void;
}

export default function Coin({
  frontId,
  backId,
  flipCount,
  onFlipComplete,
}: CoinProps) {
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
