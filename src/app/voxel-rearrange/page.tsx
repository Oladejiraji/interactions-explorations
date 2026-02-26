"use client";

import React, { Fragment, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const rowNo = 16;
const colNo = 12;

const shapes = {
  robot: [
    "1,5",
    "1,10",
    "2,6",
    "2,9",
    "3,4",
    "3,5",
    "3,6",
    "3,7",
    "3,8",
    "3,9",
    "3,10",
    "3,11",
    "4,3",
    "4,4",
    "4,6",
    "4,7",
    "4,8",
    "4,9",
    "4,11",
    "4,12",
    "5,2",
    "5,3",
    "5,4",
    "5,5",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "5,10",
    "5,11",
    "5,12",
    "5,13",
    "6,2",
    "6,4",
    "6,5",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "6,10",
    "6,11",
    "6,13",
    "7,2",
    "7,4",
    "7,11",
    "7,13",
    "8,5",
    "8,6",
    "8,9",
    "8,10",
  ],
  heart: [
    "2,4",
    "2,5",
    "2,10",
    "2,11",
    "3,3",
    "3,4",
    "3,5",
    "3,6",
    "3,9",
    "3,10",
    "3,11",
    "3,12",
    "4,3",
    "4,4",
    "4,5",
    "4,6",
    "4,7",
    "4,8",
    "4,9",
    "4,10",
    "4,11",
    "4,12",
    "5,4",
    "5,5",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "5,10",
    "5,11",
    "6,5",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "6,10",
    "7,6",
    "7,7",
    "7,8",
    "7,9",
    "8,7",
    "8,8",
  ],
  star: [
    "1,7",
    "1,8",
    "2,7",
    "2,8",
    "3,5",
    "3,6",
    "3,7",
    "3,8",
    "3,9",
    "3,10",
    "4,3",
    "4,4",
    "4,5",
    "4,6",
    "4,7",
    "4,8",
    "4,9",
    "4,10",
    "4,11",
    "4,12",
    "5,5",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "5,10",
    "6,4",
    "6,5",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "6,10",
    "6,11",
    "7,3",
    "7,4",
    "7,5",
    "7,10",
    "7,11",
    "7,12",
    "8,2",
    "8,3",
    "8,12",
    "8,13",
  ],
  ghost: [
    "1,6",
    "1,7",
    "1,8",
    "1,9",
    "2,5",
    "2,6",
    "2,7",
    "2,8",
    "2,9",
    "2,10",
    "3,4",
    "3,5",
    "3,6",
    "3,7",
    "3,8",
    "3,9",
    "3,10",
    "3,11",
    "4,4",
    "4,7",
    "4,8",
    "4,11",
    "5,4",
    "5,5",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "5,10",
    "5,11",
    "6,4",
    "6,5",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "6,10",
    "6,11",
    "7,4",
    "7,5",
    "7,6",
    "7,7",
    "7,8",
    "7,9",
    "7,10",
    "7,11",
    "8,4",
    "8,5",
    "8,7",
    "8,8",
    "8,10",
    "8,11",
    "9,4",
    "9,7",
    "9,8",
    "9,11",
  ],
  alien: [
    "2,4",
    "2,5",
    "2,10",
    "2,11",
    "3,3",
    "3,4",
    "3,5",
    "3,6",
    "3,9",
    "3,10",
    "3,11",
    "3,12",
    "4,4",
    "4,5",
    "4,10",
    "4,11",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "7,5",
    "7,6",
    "7,7",
    "7,8",
    "7,9",
    "7,10",
    "8,4",
    "8,5",
    "8,6",
    "8,7",
    "8,8",
    "8,9",
    "8,10",
    "8,11",
    "9,4",
    "9,5",
    "9,10",
    "9,11",
    "10,4",
    "10,11",
  ],
};

type ShapeName = keyof typeof shapes;
const shapeNames = Object.keys(shapes) as ShapeName[];

const centerRow = (colNo - 1) / 2;
const centerCol = (rowNo - 1) / 2;

const VoxelRearrange = () => {
  const [currentShape, setCurrentShape] = useState<ShapeName>("robot");

  const shapeIndex = shapeNames.indexOf(currentShape);
  const nextShape = () =>
    setCurrentShape(shapeNames[(shapeIndex + 1) % shapeNames.length]);
  const prevShape = () =>
    setCurrentShape(
      shapeNames[(shapeIndex - 1 + shapeNames.length) % shapeNames.length],
    );

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center bg-[#f5f5f4] overflow-hidden gap-8">
      <div className="relative">
        {/* Base grid */}
        <div
          className="flex gap-0.5 flex-wrap"
          style={{ width: rowNo * 30 }}
        >
          {new Array(colNo).fill(null).map((_, rowIndex) => (
            <Fragment key={rowIndex}>
              {new Array(rowNo).fill(null).map((_, colIndex) => {
                const distFromCenter = Math.sqrt(
                  Math.pow(rowIndex - centerRow, 2) +
                    Math.pow(colIndex - centerCol, 2),
                );
                const maxDist = Math.sqrt(
                  Math.pow(centerRow, 2) + Math.pow(centerCol, 2),
                );
                const staggerDelay = (distFromCenter / maxDist) * 0.3;

                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className="size-7 rounded-sm bg-[#e7e5e4]"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      opacity: { duration: 0.3, delay: staggerDelay },
                      scale: { duration: 0.3, delay: staggerDelay },
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>

        {/* Shape cells overlay */}
        <AnimatePresence>
          {shapes[currentShape].map((cell, index) => {
            const [row, col] = cell.split(",").map(Number);
            return (
              <motion.div
                key={index}
                className="size-7 rounded-sm absolute top-0 left-0 pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  x: col * 30,
                  y: row * 30,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  x: {
                    type: "spring",
                    damping: 20,
                    stiffness: 180,
                    mass: 0.8,
                  },
                  y: {
                    type: "spring",
                    damping: 20,
                    stiffness: 180,
                    mass: 0.8,
                  },
                  opacity: { duration: 0.15 },
                  scale: { duration: 0.15 },
                }}
                style={{
                  backgroundColor: "rgb(120, 113, 108)",
                  boxShadow: "0 0 8px rgba(120, 113, 108, 0.2)",
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <motion.button
          className="text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-full p-2 transition-colors cursor-pointer"
          onClick={prevShape}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous shape"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        <span className="text-stone-600 text-sm font-mono tracking-[0.2em] uppercase w-24 text-center">
          {currentShape}
        </span>

        <motion.button
          className="text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-full p-2 transition-colors cursor-pointer"
          onClick={nextShape}
          whileTap={{ scale: 0.9 }}
          aria-label="Next shape"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>
      </div>
    </main>
  );
};

export default VoxelRearrange;
