"use client";

import { Fragment, useEffect, useState } from "react";
import { motion } from "motion/react";

const DURATION = 2;

const INTRO_TEXT = "ARE YOU READY";

const Content = () => {
  return (
    <Fragment>
      {/* Screen content */}
      <motion.div className="absolute inset-0">
        {/* CRT scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* CRT vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            boxShadow: "inset 0 0 150px rgba(0,0,0,0.7)",
          }}
        />

        {/* Flicker overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            animation: "crt-flicker 0.15s infinite",
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center gap-8">
            <h1
              className="text-center text-5xl font-bold tracking-wider sm:text-7xl"
              style={{
                color: "#00ff41",
                textShadow:
                  "0 0 10px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.2)",
                fontFamily: "monospace",
              }}
            >
              SYSTEM ONLINE
            </h1>

            <p
              className="max-w-md text-center text-sm tracking-widest sm:text-base"
              style={{
                color: "rgba(0,255,65,0.6)",
                fontFamily: "monospace",
              }}
            >
              WELCOME TO THE MATRIX
            </p>
          </div>
        </div>
      </motion.div>

      {/* Power button */}
      <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2">
        <div
          className="group relative rounded-full p-4"
          style={{
            backgroundColor: "rgba(0,255,65,0.1)",
            border: "1px solid rgba(0,255,65,0.3)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00ff41"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 0 6px rgba(0,255,65,0.6))",
            }}
          >
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </div>
      </div>

      {/* Keyframes for flicker */}
      <style jsx>{`
        @keyframes crt-flicker {
          0% {
            background: rgba(0, 255, 65, 0.01);
          }
          50% {
            background: transparent;
          }
          100% {
            background: rgba(0, 255, 65, 0.01);
          }
        }
      `}</style>
    </Fragment>
  );
};

export default function CrtPage() {
  const [midPoint, setMidPoint] = useState(0);
  const [carretWidth, setCarretWidth] = useState(0);

  useEffect(() => {
    setMidPoint(window.innerHeight / 2 - 8);
    setCarretWidth(window.innerWidth * 0.01);
  }, []);

  const [displayText, setDisplayText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [initialAnim, setInitialAnim] = useState(true);

  useEffect(() => {
    const text = INTRO_TEXT;
    const segmenter = new Intl.Segmenter("en");
    const segments = Array.from(segmenter.segment(text));
    let index = 0;

    const interval = setInterval(() => {
      if (index < segments.length) {
        setDisplayText(
          segments
            .slice(0, index + 1)
            .map((s) => s.segment)
            .join(""),
        );
        index++;
      } else {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!typingDone) return;
    const text = INTRO_TEXT;
    const segmenter = new Intl.Segmenter("en");
    const segments = Array.from(segmenter.segment(text));
    let length = segments.length;

    const timeout = setTimeout(() => {
      setClearing(true);
      const interval = setInterval(() => {
        if (length > 0) {
          length--;
          setDisplayText(
            segments
              .slice(0, length)
              .map((s) => s.segment)
              .join(""),
          );
        } else {
          clearInterval(interval);
          setTypingDone(false);
          setClearing(false);
          setInitialAnim(false);
        }
      }, 100);

      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [typingDone]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Top bar — starts at center, moves to top */}
      {initialAnim ? (
        <div className="w-full h-full flex items-center justify-center ">
          <p className="text-center text-green-500 font-bold uppercase relative">
            {displayText}
            <motion.span
              className="absolute top-6/12 -translate-y-6/12 -right-4 bg-green-500"
              style={{ width: carretWidth, height: 16 }}
              animate={
                typingDone && !clearing
                  ? { opacity: [1, 1, 0, 0, 1] }
                  : { opacity: 1 }
              }
              transition={
                typingDone && !clearing
                  ? {
                      duration: 0.8,
                      repeat: Infinity,
                      times: [0, 0.49, 0.5, 0.99, 1],
                    }
                  : { duration: 0 }
              }
            />
          </p>
        </div>
      ) : (
        <>
          <motion.div
            className="absolute left-0 z-3 h-2 w-full bg-green-500 "
            animate={{ scaleX: [0.01, 1, 1], top: [midPoint, midPoint, -8] }}
            // animate={{ scaleX: 1, top: 0 }}
            transition={{ duration: DURATION * 2, ease: "linear", delay: 1 }}
          />
          {/* Bottom bar — starts at center, moves to bottom */}
          <motion.div
            className="absolute left-0 z-2 h-2 w-full bg-green-500 "
            animate={{ scaleX: [0.01, 1, 1], bottom: [midPoint, midPoint, -8] }}
            // animate={{ scaleX: 1, bottom: 0 }}
            transition={{ duration: DURATION * 2, ease: "linear", delay: 1 }}
          />
          {/* Screen — starts collapsed, expands open */}
          <motion.div
            className="relative h-full w-full bg-black "
            initial={{ clipPath: "inset(50% 0 50% 0)" }}
            animate={{ clipPath: "inset(0% 0 0% 0)" }}
            transition={{
              duration: DURATION,
              ease: "linear",
              delay: DURATION + 1,
            }}
          >
            <Content />
          </motion.div>
        </>
      )}
    </main>
  );
}
