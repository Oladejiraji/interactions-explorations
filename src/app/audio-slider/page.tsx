"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevBarIndexRef = useRef<number>(-1);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  // "sineTick" — short sine blip, pitch varies with bar height
  const sineTick = useCallback(
    (barHeight: number) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1000 + barHeight * 200, now);

      const volume = 0.06 + barHeight * 0.04;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.03);
    },
    [getAudioContext],
  );

  // "noiseBurst" — white noise pop, feels more like a vinyl crackle
  const noiseBurst = useCallback(
    (barHeight: number) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const duration = 0.015 + barHeight * 0.01;

      const bufferSize = Math.ceil(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        channelData[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      const volume = 0.08 + barHeight * 0.05;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(800 + barHeight * 400, now);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + duration);
    },
    [getAudioContext],
  );

  // "squareClick" — sharp square wave click (from circle exploration)
  const squareClick = useCallback(
    (_barHeight: number) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(1800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      oscillator.start(now);
      oscillator.stop(now + 0.03);
    },
    [getAudioContext],
  );

  const sounds = useMemo(
    () => ({ sineTick, noiseBurst, squareClick }) as Record<string, (h: number) => void>,
    [sineTick, noiseBurst, squareClick],
  );
  const soundNames = ["sineTick", "noiseBurst", "squareClick"] as const;
  const [activeSound, setActiveSound] = useState<string>("squareClick");
  const playTick = sounds[activeSound];

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

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
      const clampedX = Math.min(Math.max(x, 0), rect.width);

      const barIndex = Math.floor((clampedX / rect.width) * data.length);
      if (barIndex !== prevBarIndexRef.current && barIndex >= 0 && barIndex < data.length) {
        playTick(data[barIndex]);
        prevBarIndexRef.current = barIndex;
      }

      setRelativePosition({ x: clampedX, y });
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
      <div className="flex gap-2 mt-4">
        {soundNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveSound(name)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeSound === name
                ? "bg-black text-white"
                : "bg-[#e8e8e8] text-black hover:bg-[#d4d4d4]"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
