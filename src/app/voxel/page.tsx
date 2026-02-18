"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";

const rowNo = 16;
const colNo = 12;

const shapes = {
  robot: [
    // Antennae
    "1,5",
    "1,10",
    "2,6",
    "2,9",
    // Head
    "3,4",
    "3,5",
    "3,6",
    "3,7",
    "3,8",
    "3,9",
    "3,10",
    "3,11",
    // Eyes row
    "4,3",
    "4,4",
    "4,6",
    "4,7",
    "4,8",
    "4,9",
    "4,11",
    "4,12",
    // Body
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
    // Lower body
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
    // Arms
    "7,2",
    "7,4",
    "7,11",
    "7,13",
    // Feet
    "8,5",
    "8,6",
    "8,9",
    "8,10",
  ],
  heart: [
    // Top bumps
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
    // Upper middle
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
    // Middle
    "5,4",
    "5,5",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "5,10",
    "5,11",
    // Lower middle
    "6,5",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "6,10",
    // Lower
    "7,6",
    "7,7",
    "7,8",
    "7,9",
    // Bottom
    "8,7",
    "8,8",
  ],
  star: [
    // Top point
    "1,7",
    "1,8",
    "2,7",
    "2,8",
    // Upper arms and body
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
    // Middle
    "5,5",
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "5,10",
    // Lower arms
    "6,4",
    "6,5",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    "6,10",
    "6,11",
    // Bottom points
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
    // Top of head
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
    // Eyes level
    "3,4",
    "3,5",
    "3,6",
    "3,7",
    "3,8",
    "3,9",
    "3,10",
    "3,11",
    // Eyes (gaps at 5,6 and 9,10)
    "4,4",
    "4,7",
    "4,8",
    "4,11",
    // Body
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
    // Wavy bottom
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
    // Big eyes
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
    // Narrow head
    "5,6",
    "5,7",
    "5,8",
    "5,9",
    "6,6",
    "6,7",
    "6,8",
    "6,9",
    // Body
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
    // Legs
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

// Grid center for stagger calculations
const centerRow = (colNo - 1) / 2;
const centerCol = (rowNo - 1) / 2;

const Voxel = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<`${string},${string}` | null>(
    null,
  );
  const [currentShape, setCurrentShape] = useState<ShapeName>("robot");
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const cellSize = 28; // size-7 = 28px
    const gap = 2; // gap-0.5 = 2px
    const step = cellSize + gap;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / step);
      const row = Math.floor(y / step);

      if (col >= 0 && col < rowNo && row >= 0 && row < colNo) {
        setActiveCell(`${row},${col}`);
        // console.log("Hovered cell:", { col, row, key: `${col},${row}` });
      }
    };

    const handleMouseLeave = () => {
      setTimeout(() => {
        setActiveCell(null);
      }, 400);
    };

    gridRef.current?.addEventListener("mousemove", handleMouseMove);
    gridRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      gridRef.current?.removeEventListener("mousemove", handleMouseMove);
      gridRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const shapeIndex = shapeNames.indexOf(currentShape);
  const nextShape = () =>
    setCurrentShape(shapeNames[(shapeIndex + 1) % shapeNames.length]);
  const prevShape = () =>
    setCurrentShape(
      shapeNames[(shapeIndex - 1 + shapeNames.length) % shapeNames.length],
    );

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center bg-neutral-950 overflow-hidden">
      {/* Game Boy body */}
      <div className="bg-[#2a2a2e] rounded-[2.5rem] rounded-b-[3.5rem] px-10 pt-8 pb-14 shadow-[0_8px_60px_rgba(0,0,0,0.6)] border border-neutral-700/40 flex flex-col items-center relative">
        {/* Top label */}
        <div className="flex items-center gap-2 mb-4 self-start">
          <span className="text-amber-400/80 text-[11px] font-bold tracking-[0.25em] uppercase italic">
            Voxel Boy
          </span>
          <span className="text-neutral-500 text-[9px] tracking-wider">
            PIXEL
          </span>
        </div>

        {/* Screen bezel */}
        <div className="bg-[#1c1e24] rounded-2xl p-5 border-[3px] border-neutral-700/30 relative shadow-inner">
          {/* Power LED */}
          <div className="absolute top-2.5 right-5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="text-[7px] text-neutral-500 font-mono uppercase">
              Power
            </span>
          </div>

          {/* Screen */}
          <div className="relative">
            <div
              className="flex gap-0.5 flex-wrap"
              ref={gridRef}
              style={{ width: rowNo * 30 }}
            >
              {new Array(colNo).fill(null).map((_, rowIndex) => {
                return (
                  <Fragment key={rowIndex}>
                    {new Array(rowNo).fill(null).map((_, colIndex) => {
                      const radius = 3;
                      const affectedCells: string[] = [];
                      for (let dr = -radius; dr <= radius; dr++) {
                        for (let dc = -radius; dc <= radius; dc++) {
                          const r = rowIndex + dr;
                          const c = colIndex + dc;
                          if (r >= 0 && c >= 0) {
                            affectedCells.push(`${r},${c}`);
                          }
                        }
                      }

                      const currCell = `${rowIndex}-${colIndex}`;

                      const distFromCenter = Math.sqrt(
                        Math.pow(rowIndex - centerRow, 2) +
                          Math.pow(colIndex - centerCol, 2),
                      );
                      const maxDist2 = Math.sqrt(
                        Math.pow(centerRow, 2) + Math.pow(centerCol, 2),
                      );
                      const staggerDelay = (distFromCenter / maxDist2) * 0.3;

                      const activeRowIndex = activeCell?.split(",")[0];
                      const activeColumnIndex = activeCell?.split(",")[1];

                      const difference =
                        Math.abs(Number(rowIndex) - Number(activeRowIndex)) +
                        Math.abs(Number(colIndex) - Number(activeColumnIndex));

                      const maxDist = radius * 2;
                      const currScale =
                        0.5 + (0.5 * Math.min(difference, maxDist)) / maxDist;

                      const isParticipantCell =
                        activeCell && affectedCells.includes(activeCell);

                      const edgeDist = Math.min(
                        rowIndex,
                        colIndex,
                        colNo - 1 - rowIndex,
                        rowNo - 1 - colIndex,
                      );
                      const edgeMax = 3;
                      const edgeFactor = Math.min(edgeDist, edgeMax) / edgeMax;

                      const darkBase = 18;
                      const hoverIntensity = isParticipantCell
                        ? (1 - difference / maxDist) * edgeFactor
                        : 0;
                      const r = isParticipantCell
                        ? Math.round(darkBase + 80 * hoverIntensity)
                        : darkBase;
                      const g = isParticipantCell
                        ? Math.round(darkBase + 40 * hoverIntensity)
                        : darkBase;
                      const b = isParticipantCell
                        ? Math.round(darkBase + 10 * hoverIntensity)
                        : darkBase;

                      return (
                        <motion.div
                          key={currCell}
                          className="size-7 rounded-sm"
                          initial={{
                            scale: 0.6,
                            opacity: 0,
                            backgroundColor: "rgb(18, 18, 18)",
                          }}
                          animate={{
                            scale: isParticipantCell ? currScale : 1,
                            opacity: 1,
                            backgroundColor: `rgb(${r}, ${g}, ${b})`,
                            boxShadow: isParticipantCell
                              ? `0 0 ${8 - difference}px rgba(251, 146, 60, 0.15)`
                              : "none",
                          }}
                          transition={{
                            scale: { duration: 0.2 },
                            opacity: { duration: 0.3, delay: staggerDelay },
                            backgroundColor: {
                              duration: 0.4,
                              ease: "easeOut",
                            },
                            boxShadow: {
                              duration: 0.4,
                              ease: "easeOut",
                            },
                          }}
                        />
                      );
                    })}
                  </Fragment>
                );
              })}
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
                      backgroundColor: "rgb(251, 146, 60)",
                      boxShadow: "0 0 12px rgba(251, 146, 60, 0.35)",
                    }}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Shape name display */}
        <div className="mt-3 self-start pl-1">
          <span className="text-amber-400/50 text-[10px] font-mono tracking-[0.2em] uppercase">
            {currentShape}
          </span>
        </div>

        {/* Controls area */}
        <div className="mt-8 flex items-start justify-between w-full gap-8">
          {/* D-pad */}
          <div className="relative w-[108px] h-[108px] flex-shrink-0">
            {/* Vertical bar */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-9 h-full bg-neutral-700 rounded-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
            {/* Horizontal bar */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-9 bg-neutral-700 rounded-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
            {/* Center indent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-neutral-600/80" />
            {/* Up */}
            <button
              className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center cursor-pointer group"
              aria-label="Up"
            >
              <span className="text-neutral-500 group-hover:text-neutral-300 group-active:text-amber-400 text-xs select-none">
                ▲
              </span>
            </button>
            {/* Down */}
            <button
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center cursor-pointer group"
              aria-label="Down"
            >
              <span className="text-neutral-500 group-hover:text-neutral-300 group-active:text-amber-400 text-xs select-none">
                ▼
              </span>
            </button>
            {/* Left */}
            <motion.button
              className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center cursor-pointer group"
              onClick={prevShape}
              whileTap={{ scale: 0.85 }}
              aria-label="Previous shape"
            >
              <span className="text-neutral-500 group-hover:text-neutral-300 group-active:text-amber-400 text-xs select-none">
                ◄
              </span>
            </motion.button>
            {/* Right */}
            <motion.button
              className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center cursor-pointer group"
              onClick={nextShape}
              whileTap={{ scale: 0.85 }}
              aria-label="Next shape"
            >
              <span className="text-neutral-500 group-hover:text-neutral-300 group-active:text-amber-400 text-xs select-none">
                ►
              </span>
            </motion.button>
          </div>

          {/* A/B Buttons */}
          <div className="flex gap-5 -rotate-[20deg] mt-2 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                className="w-[52px] h-[52px] rounded-full bg-amber-600 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.1)] cursor-pointer active:shadow-[0_1px_4px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)]"
                onClick={prevShape}
                whileTap={{ scale: 0.9 }}
                aria-label="B - Previous shape"
              />
              <span className="text-neutral-500 text-[10px] font-bold tracking-wider">
                B
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 -mt-5">
              <motion.button
                className="w-[52px] h-[52px] rounded-full bg-amber-600 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.1)] cursor-pointer active:shadow-[0_1px_4px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)]"
                onClick={nextShape}
                whileTap={{ scale: 0.9 }}
                aria-label="A - Next shape"
              />
              <span className="text-neutral-500 text-[10px] font-bold tracking-wider">
                A
              </span>
            </div>
          </div>
        </div>

        {/* Start / Select */}
        <div className="mt-6 flex gap-8 -rotate-[25deg] self-center">
          <div className="flex flex-col items-center gap-1">
            <button className="w-14 h-[10px] rounded-full bg-neutral-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] cursor-pointer hover:bg-neutral-500 active:bg-neutral-400" />
            <span className="text-neutral-500 text-[8px] font-bold tracking-wider">
              SELECT
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button className="w-14 h-[10px] rounded-full bg-neutral-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] cursor-pointer hover:bg-neutral-500 active:bg-neutral-400" />
            <span className="text-neutral-500 text-[8px] font-bold tracking-wider">
              START
            </span>
          </div>
        </div>

        {/* Speaker grille */}
        <div className="absolute bottom-8 right-8 flex gap-[3px] rotate-[-30deg] opacity-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-neutral-500"
              style={{ height: 12 + Math.sin(i * 0.8) * 6 }}
            />
          ))}
        </div>
      </div>

      {/* Custom cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 size-5 rounded-full bg-orange-400 opacity-80 z-[12]"
        style={{ x: springX, y: springY }}
      />
    </main>
  );
};

export default Voxel;
