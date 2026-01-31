"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const rowNo = 16;
const colNo = 12;

const faceCoordinates = [
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

  // Eyes row (gaps at 5,10 for eyes)
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
];

const Voxel = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<`${string},${string}` | null>(
    null,
  );

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

  return (
    <main className="w-screen h-screen flex justify-center items-center bg-black">
      <div className="w-[480px] mx-auto">
        <div className="">
          <h3 className="text-sm text-white leading-[1.4] max-w-[280px]">
            Initialize new project sequence via system parameters or manual
            override.
          </h3>
          <div className="mt-3 flex items-center gap-2">
            <motion.button
              className="px-4 py-1.5 bg-[#E1FF55] text-black rounded-full text-xs font-medium cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              System.Config
            </motion.button>
            <motion.button
              className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Override
            </motion.button>
          </div>
        </div>

        <div className="my-10 ">
          <div className="flex gap-0.5 flex-wrap" ref={gridRef}>
            {new Array(colNo).fill(null).map((_, rowIndex) => {
              return (
                <Fragment key={rowIndex}>
                  {new Array(rowNo).fill(null).map((_, colIndex) => {
                    const isFacePart = faceCoordinates.includes(
                      `${rowIndex},${colIndex}`,
                    );

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
                    const darkCellBrightness = isParticipantCell
                      ? Math.round(10 + 16 * edgeFactor)
                      : 26;

                    return (
                      <motion.div
                        key={currCell}
                        className="size-7 "
                        animate={{
                          scale: isParticipantCell ? currScale : 1,
                          backgroundColor: isFacePart
                            ? "rgb(255, 255, 255)"
                            : `rgb(${darkCellBrightness}, ${darkCellBrightness}, ${darkCellBrightness})`,
                        }}
                        transition={{
                          duration: 0.3,
                          // delay: isParticipantCell ? difference * 0.04 : 0,
                        }}
                      ></motion.div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-white text-sm">
            <h2 className=" opacity-50 ">Status</h2>
            <p className="">Awaiting input stream.</p>
            <p className="">Grid ready.</p>
          </div>
          <motion.button
            className="px-4 py-1.5 bg-transparent text-white rounded-full text-xs font-medium border border-[#333] cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "#fff" }}
            whileTap={{ scale: 0.97 }}
          >
            Execute Render
          </motion.button>
        </div>
      </div>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 size-6 rounded-full border border-white/40 bg-[#E1FF55] mix-blend-difference"
        style={{ x: springX, y: springY }}
      />
    </main>
  );
};

export default Voxel;
