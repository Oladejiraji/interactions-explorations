"use client";

import { motion, AnimatePresence } from "motion/react";
import Coin, { items } from "./Coin";
import useCoinFlip from "./useCoinFlip";
import Image from "next/image";

export default function TokenList({
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
