"use client";

import React from "react";
import { motion } from "motion/react";

const COLS = 22;
const ROWS = 12;
const CELL_SIZE = 18;
const GAP = 4;

// Heights define how many cells are filled from the bottom for each column
const heights = [
  3, 4, 5, 4, 5, 6, 7, 8, 6, 5, 7, 8, 7, 6, 7, 9, 10, 9, 10, 11, 10, 11,
];


const Chart = () => {
  return (
    <main className="w-screen h-screen flex items-center justify-center bg-[#c4c4c4] font-sans">
      <div className="bg-[#1a1a1a] rounded-2xl px-10 py-8 flex flex-col gap-6">
        <div>
          <p className="text-[#888] text-sm tracking-wide">Increase</p>
          <p className="text-white text-4xl font-semibold mt-1">+70%</p>
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
            gap: `${GAP}px`,
          }}
        >
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: COLS }).map((_, col) => {
              const fillHeight = heights[col];
              const isFilled = row >= ROWS - fillHeight;

              // Extra grey cells: 2 rows directly above the filled area
              const topFilledRow = ROWS - fillHeight;
              const isExtra =
                !isFilled &&
                (row === topFilledRow - 1 || row === topFilledRow - 2) &&
                row >= 0;

              return isExtra ? (
                <motion.div
                  key={`${row}-${col}`}
                  className="rounded-[3px]"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: col * 0.08,
                    ease: "easeOut",
                  }}
                />
              ) : (
                <div
                  key={`${row}-${col}`}
                  className="rounded-[3px]"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: isFilled
                      ? "rgba(255, 255, 255, 1)"
                      : "transparent",
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default Chart;
