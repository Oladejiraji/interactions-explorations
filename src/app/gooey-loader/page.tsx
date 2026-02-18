"use client";
import { Check, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const CIRCLE_COUNT = 5;
const RADIUS = 10;
const DURATIONS = [1.8, 2.2, 2.6, 3.0, 3.4];
const SCALE_DURATION = 0.25;
const SPREAD_DURATION = 0.2;
const ORBIT_DELAY = SCALE_DURATION + SPREAD_DURATION;

const Loader = ({
  isClosing,
  onClosed,
}: { isClosing: boolean; onClosed: () => void }) => {
  return (
    <div className="relative" style={{ filter: "url(#gooey)" }}>
      {new Array(CIRCLE_COUNT).fill(0).map((_, i) => {
        return (
          <motion.div
            key={i}
            initial={{ scale: 4 }}
            animate={{ scale: isClosing ? 4 : 1 }}
            transition={{
              duration: SCALE_DURATION,
              ease: "easeOut",
              delay: isClosing ? SPREAD_DURATION : 0,
            }}
            onAnimationComplete={() => {
              if (isClosing && i === 0) onClosed();
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
                  ease: "easeOut",
                }}
                className="bg-black w-2 h-2 rounded-full"
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

type Status = "idle" | "loading" | "closing" | "done";

const GooeyLoader = () => {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => setStatus("closing"), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <main className="w-screen h-screen flex justify-center items-center  bg-[white]">
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
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

      <div
        className={cn("pr-12 h-12 rounded-[12px] relative")}
        style={{ boxShadow: "0px 0px 0px 1px #CCCCCCE5" }}
      >
        <input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
          }}
          placeholder="Message..."
          className="placeholder:font-medium w-full outline-none py-3 pl-4 bg-transparent"
        />
        <div className="rounded-full absolute right-0 size-8 flex justify-center items-center mr-2 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {status === "idle" && (
              <motion.button
                key="button"
                className="absolute inset-0 rounded-full bg-black flex justify-center items-center cursor-pointer"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setStatus("loading")}
              >
                <Plus className="text-white size-4" />
              </motion.button>
            )}
            {status === "done" && (
              <motion.div
                key="done"
                className="absolute inset-0 rounded-full bg-black flex justify-center items-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Check className="text-white size-4" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {(status === "loading" || status === "closing") && (
            <Loader
              isClosing={status === "closing"}
              onClosed={() => setStatus("done")}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default GooeyLoader;
