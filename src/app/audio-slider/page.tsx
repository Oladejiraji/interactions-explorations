"use client";
import React, { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

interface IUnit {
  height: number;
  className?: string;
}

function Unit(props: IUnit) {
  const { height, className = "" } = props;
  return (
    <div
      className={`w-[1px] bg-[black] ${className}`}
      style={{
        height: `${height}rem`,
      }}
    ></div>
  );
}

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });

  const data = useMemo(() => {
    const arr: number[] = [];
    let prev = 0.8;
    for (let i = 0; i < 50; i++) {
      // Drift from previous value for organic continuity
      const drift = (Math.random() - 0.5) * 0.4;
      // Occasional spike or dip
      const spike = Math.random() > 0.85 ? (Math.random() - 0.3) * 0.6 : 0;
      prev = Math.min(Math.max(prev + drift + spike, 0.25), 1.5);
      arr.push(prev);
    }
    return arr;
  }, []);

  const totalDuration = 5; // total duration in seconds

  const currentTime = useMemo(() => {
    if (!containerRef.current) return 0;
    const progress = relativePosition.x / containerRef.current.offsetWidth;
    return progress * totalDuration;
  }, [relativePosition.x]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
    }
    return `${secs}.${ms}s`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRelativePosition({ x: Math.min(Math.max(x, 0), rect.width), y });
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="max-w-[20rem] w-full flex flex-col bg-[#f4f4f4] gap-1 rounded-[0.5rem] p-[2px] relative hover:cursor-none"
      >
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-sm">Repost.mp3</p>
          <p className="text-sm font-mono tabular-nums">{formatTime(currentTime)}</p>
        </div>
        <div className="rounded-[0.375rem] h-12 bg-white relative flex items-center overflow-hidden">
          <div className="flex items-center justify-between gap-[2px] flex-1  px-3 ">
            {data.map((item, index) => {
              return (
                <Unit key={index} height={item} className="opacity-[0.1]" />
              );
            })}
          </div>

          <motion.div
            className="flex items-center justify-between gap-[2px] px-3 absolute top-0 left-0 w-full h-full"
            initial={{
              clipPath: `inset(0 ${100 - (containerRef.current ? (relativePosition.x / containerRef.current.offsetWidth) * 100 : 0)}% 0 0)`,
            }}
            animate={{
              clipPath: `inset(0 ${100 - (containerRef.current ? (relativePosition.x / containerRef.current.offsetWidth) * 100 : 0)}% 0 0)`,
            }}
            transition={{
              duration: 0.05,
              ease: "linear",
            }}
          >
            {data.map((item, index) => {
              return <Unit key={index} height={item} />;
            })}
          </motion.div>
        </div>

        <motion.div
          className="absolute top-[-6px] bottom-[-6px] left-0 w-[2px] rounded-[2px] bg-[black]"
          animate={{
            left: `${relativePosition.x}px`,
          }}
          transition={{
            duration: 0.05,
            ease: "linear",
          }}
        ></motion.div>
      </div>
    </div>
  );
}
