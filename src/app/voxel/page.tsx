"use client";

import React, { Fragment, useEffect, useRef } from "react";

const rowNo = 16;
const colNo = 12;

const faceCoordinates = [
  // Left eye
  "5,4",
  "6,4",
  "5,5",
  "6,5",

  // Right eye
  "10,4",
  "11,4",
  "10,5",
  "11,5",

  // Smile (curved)
  "5,9",
  "6,10",
  "7,10",
  "8,10",
  "9,10",
  "10,10",
  "11,9",
];

const Voxel = () => {
  const gridRef = useRef<HTMLDivElement>(null);

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
        console.log("Hovered cell:", { col, row, key: `${col},${row}` });
      }
    };

    gridRef.current?.addEventListener("mousemove", handleMouseMove);

    return () => {
      gridRef.current?.removeEventListener("mousemove", handleMouseMove);
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
            <button className="px-4 py-1.5 bg-[#E1FF55] text-black rounded-full text-xs font-medium">
              System.Config
            </button>
            <button className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-medium">
              Override
            </button>
          </div>
        </div>

        <div className="my-10 ">
          <div className="flex gap-0.5 flex-wrap" ref={gridRef}>
            {new Array(colNo).fill(null).map((_, rowIndex) => {
              return (
                <Fragment key={rowIndex}>
                  {new Array(rowNo).fill(null).map((_, colIndex) => {
                    const isFacePart = faceCoordinates.includes(
                      `${colIndex},${rowIndex}`,
                    );
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="size-7 "
                        style={{
                          backgroundColor: isFacePart
                            ? "rgb(255, 255, 255)"
                            : "rgb(26, 26, 26)",
                        }}
                      />
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
          <button className="px-4 py-1.5 bg-transparent text-white rounded-full text-xs font-medium border border-[#333]">
            Execute Render
          </button>
        </div>
      </div>
    </main>
  );
};

export default Voxel;
