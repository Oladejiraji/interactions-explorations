"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Button1, Button2, Button3 } from "@/lib/assets";
import { ArrowUp, MoveRight, MoveUp } from "lucide-react";

const Buttons = () => {
  const [status, setStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const buttonWidth = 140;
  const buttonHeight = 36;
  const borderRadius = 18;
  const svgW = buttonWidth + 6;
  const svgH = buttonHeight + 6;
  const rx = borderRadius + 3;
  const ry = Math.min(rx, (svgH - 3) / 2);
  const rectLeft = 1.5;
  const rectTop = 1.5;
  const rectRight = svgW - 1.5;
  const rectBottom = svgH - 1.5;
  const centerY = (rectTop + rectBottom) / 2;
  const cornerLeftX = rectLeft + rx;
  const cornerRightX = rectRight - rx;

  // Rounded rect path starting from left-center so the stroke ends there
  const rectPath = [
    `M ${rectLeft} ${centerY}`,
    `A ${rx} ${ry} 0 0 1 ${cornerLeftX} ${rectTop}`,
    `L ${cornerRightX} ${rectTop}`,
    `A ${rx} ${ry} 0 0 1 ${rectRight} ${centerY}`,
    `A ${rx} ${ry} 0 0 1 ${cornerRightX} ${rectBottom}`,
    `L ${cornerLeftX} ${rectBottom}`,
    `A ${rx} ${ry} 0 0 1 ${rectLeft} ${centerY}`,
  ].join(" ");

  // Check path: small line from left edge of rect into the button, forming a check next to text
  const checkStartX = rectLeft;
  const checkStartY = centerY;
  const checkPath = `M ${checkStartX} ${checkStartY} L ${checkStartX + 20} ${checkStartY} L ${checkStartX + 28} ${checkStartY + 6} L ${checkStartX + 40} ${checkStartY - 6}`;
  return (
    <main className="w-screen h-screen flex justify-center items-center bg-[grey]">
      <div>
        <div className="mb-8">
          <Image src={Button3} alt="button 1" width={300} height={64} />
        </div>

        <div className="px-2">
          <div
            className="relative"
            style={{ width: buttonWidth, height: buttonHeight }}
          >
            {/* SVG border trace + check — sits outside the button */}
            <svg
              className="absolute pointer-events-none z-10"
              style={{
                top: -3,
                left: -3,
                width: svgW,
                height: svgH,
              }}
              viewBox={`0 0 ${svgW} ${svgH}`}
              fill="none"
            >
              {/* Rounded rect trace starting from left-center */}
              <motion.path
                d={rectPath}
                stroke="white"
                strokeWidth={2.5}
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: uploading ? 0 : 1 }}
                transition={{ duration: 1.5, ease: "linear" }}
                onAnimationComplete={() => {
                  if (uploading && !uploaded) setUploaded(true);
                }}
              />
              {/* Check line that enters from left-center */}
              {uploaded && (
                <motion.path
                  d={checkPath}
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  pathLength={1}
                  strokeDasharray={1}
                  initial={{ strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
            </svg>

            <button
              className="relative flex items-center justify-center w-full h-full px-6 rounded-full font-medium text-sm bg-[#2b47fd] text-white overflow-hidden cursor-pointer"
              onClick={() => !uploading && setUploading(true)}
            >
              <AnimatePresence mode="wait">
                {!uploading ? (
                  <motion.span
                    key="upload"
                    className="flex items-center gap-3"
                    initial={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ArrowUp size={18} />
                    Upload
                  </motion.span>
                ) : !uploaded ? (
                  <motion.span
                    key="uploading"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Uploading...
                  </motion.span>
                ) : (
                  <motion.span
                    key="uploaded"
                    className="pl-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Uploaded
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <div className="px-2">
          <button className="bg-black hidden relative pl-2.5 pr-0 h-16 rounded-full w-70  items-center justify-between overflow-hidden group">
            <div className="text-sm font-medium text-white group-hover:text-black pl-6.5 relative z-2 transition-colors duration-300 delay-100">
              Contact Us
            </div>
            <div className="size-11.5 rounded-full flex items-center justify-center relative right-2.5">
              <div className="bg-lime-500 size-11.5 rounded-full absolute right-0 top-1/2 -translate-y-1/2 group-hover:w-70 group-hover:h-16 group-hover:-right-2.5 transition-all duration-300" />
              <div className="relative">
                <MoveRight className="size-5" />
              </div>
            </div>
          </button>
        </div>

        <div className="px-8">
          <motion.div
            className="rounded-full hidden items-center justify-center p-3 relative"
            animate={{ background: status ? "#000" : "#fff" }}
          >
            <div className="relative w-full h-full py-1">
              <motion.div
                key={String(status)}
                className="absolute top-0 rounded-full h-full"
                animate={{
                  left: status ? ["50%", "0%", "0%"] : ["0%", "0%", "50%"],
                  right: status ? ["0%", "0%", "50%"] : ["50%", "0%", "0%"],
                  backgroundColor: status ? "#fff" : "grey",
                }}
                initial={false}
                transition={{
                  left: {
                    duration: 0.4,
                    ease: "easeInOut",
                    times: [0, 0.4, 1],
                  },
                  right: {
                    duration: 0.4,
                    ease: "easeInOut",
                    times: [0, 0.4, 1],
                  },
                  backgroundColor: { duration: 0.2 },
                }}
              />
              <button
                className="font-semibold relative text-lg py-0 px-3 rounded-full w-6/12 cursor-pointer"
                onClick={() => setStatus(true)}
              >
                <motion.p
                  className="text-left relative"
                  animate={{ color: !status ? "grey" : "black" }}
                >
                  ON
                </motion.p>
              </button>
              <button
                className="font-semibold relative text-lg py-0 px-3 rounded-full w-6/12 cursor-pointer"
                onClick={() => setStatus(false)}
              >
                <motion.p
                  className="text-left relative"
                  animate={{ color: status ? "grey" : "black" }}
                >
                  OFF
                </motion.p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Buttons;
