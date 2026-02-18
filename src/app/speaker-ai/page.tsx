"use client";
import { Gradient } from "@/lib/assets";
import { DotIcon, MicIcon } from "@/lib/svgs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "motion/react";

export type ChatState =
  | "idle"
  | "listening"
  | "writing"
  | "processing"
  | "done";

const CIRCLE_COUNT = 5;
const RADIUS = 20;
const DURATIONS = [1.8, 2.2, 2.6, 3.0, 3.4];
const SCALE_DURATION = 0.25;
const SPREAD_DURATION = 0.2;
const ORBIT_DELAY = SCALE_DURATION + SPREAD_DURATION;

const allMessages = [
  {
    id: 1,
    text: "How do I get a smooth gradient noise effect in a fragment shader without it looking blocky?",
    user: true,
  },
  {
    id: 2,
    text: "Use a simplex or perlin noise function and sample it with scaled UV coordinates. Multiply the output by a smoothstep to fade the edges, then mix between two colors using the noise value as the blend factor. Bump up the octaves for finer detail.",
    user: false,
  },
];

const TIMINGS = {
  listeningToWriting: 6000,
  writingToProcessing: 2000,
  processingToDone: 5000,
};

const GooeyLoader = ({
  isClosing,
  onClosed,
}: {
  isClosing: boolean;
  onClosed: () => void;
}) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20"
      style={{ filter: "url(#gooey)" }}
    >
      {new Array(CIRCLE_COUNT).fill(0).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 2.3 }}
          animate={{ scale: 1 }}
          transition={{
            duration: SCALE_DURATION,
            ease: cubicBezier(0.35, 0.17, 0.3, 0.86),
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: DURATIONS[i],
              repeat: isClosing ? 0 : Infinity,
              ease: "linear",
              delay: isClosing ? 0 : ORBIT_DELAY,
            }}
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: isClosing ? 0 : -RADIUS }}
              transition={{
                duration: SPREAD_DURATION,
                delay: isClosing ? 0 : SCALE_DURATION,
                ease: cubicBezier(0.35, 0.17, 0.3, 0.86),
              }}
              onAnimationComplete={() => {
                if (isClosing && i === 0) onClosed();
              }}
              className="w-4 h-4 rounded-full overflow-hidden"
            >
              <Image
                src={Gradient}
                alt=""
                width={16}
                height={16}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

const CHAR_DELAY = 0.02;

const TypewriterText = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (displayCount < text.length) {
      const timer = setTimeout(
        () => setDisplayCount((c) => c + 1),
        CHAR_DELAY * 1000,
      );
      return () => clearTimeout(timer);
    }
    if (displayCount === text.length && onComplete) {
      onComplete();
    }
  }, [displayCount, text.length, onComplete]);

  const revealed = text.slice(0, displayCount);

  return (
    <div className="relative">
      <p className="text-sm text-[#414141] font-medium tracking-[-0.0056em] invisible">
        {text}
      </p>
      <p className="text-sm text-[#414141] font-medium tracking-[-0.0056em] absolute inset-0">
        {revealed}
      </p>
    </div>
  );
};

const SpeakerAi = () => {
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [visibleMessages, setVisibleMessages] = useState<typeof allMessages>(
    [],
  );
  const [gooeyClosing, setGooeyClosing] = useState(false);

  useEffect(() => {
    if (chatState === "listening") {
      const timer = setTimeout(
        () => setChatState("writing"),
        TIMINGS.listeningToWriting,
      );
      return () => clearTimeout(timer);
    }
    if (chatState === "writing") {
      setVisibleMessages([allMessages[0]]);
    }
    if (chatState === "processing") {
      const timer = setTimeout(
        () => setGooeyClosing(true),
        TIMINGS.processingToDone,
      );
      return () => clearTimeout(timer);
    }
  }, [chatState]);

  const handleTypingComplete = () => {
    if (chatState === "writing") {
      setChatState("processing");
    }
  };

  const handleGooeyDone = () => {
    setGooeyClosing(false);
    setChatState("done");
    setVisibleMessages([allMessages[0], allMessages[1]]);
  };

  return (
    <main className="h-screen bg-white flex flex-col overflow-hidden w-[868px] mx-auto">
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 30 -10"
            />
          </filter>
        </defs>
      </svg>

      <div className="w-full pt-40">
        <div className="flex flex-col justify-center items-center">
          <h1 className="flex items-center gap-1 text-[#D2D2D2] text-[13px] tracking-[-0.0056em] text-center">
            <span>Wednesday, Feb 18</span>
            <span>
              <DotIcon />
            </span>
            <span>rndrai</span>
          </h1>
          <div className="mt-10 mb-4">
            <div className="relative">
              {chatState === "listening" &&
                new Array(99).fill(0).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#f2f2f2] rounded-full box-content size-18"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    transition={{
                      duration: 2.4,
                      ease: "linear",
                      delay: i * 1.2,
                    }}
                  />
                ))}

              {(chatState === "processing" ||
                (chatState === "done" && gooeyClosing)) && (
                <GooeyLoader
                  isClosing={gooeyClosing}
                  onClosed={handleGooeyDone}
                />
              )}

              <motion.div
                initial={false}
                animate={{
                  scale: chatState === "processing" ? 0 : 1,
                  opacity: chatState === "processing" ? 0 : 1,
                }}
                transition={{
                  duration: chatState === "done" ? 0.4 : SCALE_DURATION,
                  ease: cubicBezier(0.35, 0.17, 0.3, 0.86),
                }}
                className="relative z-10 cursor-pointer"
                onClick={() => {
                  if (chatState === "idle") setChatState("listening");
                }}
              >
                <Image src={Gradient} alt="gradient" width={64} height={64} />
              </motion.div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={chatState}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="text-[#D2D2D2] text-sm font-medium tracking-[-0.0056em] text-center min-h-5"
            >
              {chatState === "idle" && "Tap to speak"}
              {chatState === "listening" && "Listening..."}
              {chatState === "processing" && "Thinking..."}
            </motion.h1>
          </AnimatePresence>
        </div>

        <div className="mt-17 flex flex-col gap-10">
          <AnimatePresence>
            {visibleMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn("flex items-center gap-2", {
                  "self-end": message.user,
                  "self-start": !message.user,
                })}
              >
                {message.user ? (
                  <div className="size-8 rounded-full flex items-center justify-center bg-[#F9F9F9]">
                    <MicIcon />
                  </div>
                ) : null}
                <div
                  className={`max-w-[400px] px-4 py-2 rounded-lg ${
                    message.user ? "bg-[#F9F9F9]" : "bg-white"
                  }`}
                >
                  <TypewriterText
                    text={message.text}
                    onComplete={message.user ? handleTypingComplete : undefined}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default SpeakerAi;
