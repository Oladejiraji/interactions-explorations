"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";

const BAR_NO = 20;
const SIDE_BARS = 10;
const TOTAL_BARS = SIDE_BARS + BAR_NO + SIDE_BARS;
const HALF = TOTAL_BARS / 2;
const BAR_HEIGHT = 36;
const GLOW_HEIGHT = 140;
const CARD_W = 320;
const CARD_H = 320;
const SVG_CENTER_Y = 160;
const GAP = 2;
const BAR_WIDTH = 2.5;

const PageBlur = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pulse, setPulse] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setPulse(-1);
    setElapsed(0);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setPulse(-1);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRecording]);

  // Pulse outward from center, then reset
  useEffect(() => {
    if (!isRecording) return;

    // Expand outward past the edge so trailing fade completes
    if (pulse < HALF + 8) {
      const timeout = setTimeout(() => {
        setPulse((prev) => prev + 1);
      }, 55);
      return () => clearTimeout(timeout);
    }

    // Pause then restart
    const timeout = setTimeout(() => {
      setPulse(-1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [isRecording, pulse]);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Opacity based on distance from center — pulse expands outward
  const getBarOpacity = (i: number): number => {
    if (!isRecording || pulse < 0) return 0;

    // Distance from the center of all bars
    const distFromCenter = Math.abs(i - (HALF - 0.5));

    // Bar hasn't been reached by the expanding pulse yet
    if (distFromCenter > pulse) return 0;

    // How far behind the pulse front this bar is
    const behind = pulse - distFromCenter;

    // Bright window — bars near the pulse front
    if (behind <= 6) return 1;

    // Trailing fade from center outward
    const fadeDist = behind - 6;
    return Math.max(0, 1 - fadeDist * 0.12);
  };

  const totalWidth = TOTAL_BARS * BAR_WIDTH + (TOTAL_BARS - 1) * GAP;
  const startX = (CARD_W - totalWidth) / 2;

  return (
    <main className="w-screen h-screen flex justify-center items-center bg-[#1a1a2e] overflow-hidden">
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{ width: CARD_W, height: CARD_H, background: "#2a2a3e" }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-5">
          <p className="text-white font-medium text-sm">Sally Peterson</p>
          <p className="text-[#7b8ca8] text-xs mt-0.5">Speaking...</p>
        </div>

        {/* Bars */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ filter: "blur(0.8px)" }}
        >
          <defs>
            <linearGradient id="glow-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="30%" stopColor="white" stopOpacity="0.4" />
              <stop offset="50%" stopColor="white" stopOpacity="0.6" />
              <stop offset="70%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Glow layer — all bars */}
          {new Array(TOTAL_BARS).fill(0).map((_, i) => {
            const x = startX + i * (BAR_WIDTH + GAP);
            const y = SVG_CENTER_Y - GLOW_HEIGHT / 2;

            return (
              <motion.rect
                key={`glow-${i}`}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={GLOW_HEIGHT}
                rx={1}
                fill="url(#glow-fade)"
                animate={{ opacity: getBarOpacity(i) }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              />
            );
          })}

          {/* Crisp layer — center bars only */}
          {new Array(BAR_NO).fill(0).map((_, i) => {
            const globalIndex = SIDE_BARS + i;
            const x = startX + globalIndex * (BAR_WIDTH + GAP);
            const y = SVG_CENTER_Y - BAR_HEIGHT / 2;

            return (
              <motion.rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={BAR_HEIGHT}
                rx={1}
                fill="white"
                animate={{ opacity: getBarOpacity(globalIndex) }}
                transition={{ duration: 0.08, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
          <p className="text-[#7b8ca8] text-xs font-mono">
            {formatTime(elapsed)}
          </p>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className="w-10 h-10 rounded-full bg-[#3a3a50] flex items-center justify-center hover:bg-[#4a4a60] transition-colors"
          >
            {isRecording ? (
              <div className="w-3 h-3 rounded-sm bg-white" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="w-5 h-5 ml-0.5"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default PageBlur;
