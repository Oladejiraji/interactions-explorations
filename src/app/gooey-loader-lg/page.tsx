"use client";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "motion/react";
const CIRCLE_COUNT = 5;
const RADIUS = 30;
const DURATIONS = [1.8, 2.2, 2.6, 3.0, 3.4];
const SCALE_DURATION = 0.25;
const SPREAD_DURATION = 0.2;
const ORBIT_DELAY = SCALE_DURATION + SPREAD_DURATION;

const Loader = ({
  isClosing,
  onClosed,
}: {
  isClosing: boolean;
  onClosed: () => void;
}) => {
  return (
    <div className="relative" style={{ filter: "url(#gooey)" }}>
      {new Array(CIRCLE_COUNT).fill(0).map((_, i) => {
        return (
          <motion.div
            key={i}
            initial={{ scale: 2.3 }}
            animate={{ scale: isClosing ? 2.3 : 1 }}
            transition={{
              duration: SCALE_DURATION,
              // ease: "easeOut",
              ease: cubicBezier(0.35, 0.17, 0.3, 0.86),
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
                  ease: cubicBezier(0.35, 0.17, 0.3, 0.86),
                }}
                className="bg-black w-6 h-6 rounded-full"
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

type Status = "idle" | "loading" | "closing" | "done";

const GooeyLoaderLg = () => {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => setStatus("closing"), 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <main className="w-screen h-screen flex justify-center items-center bg-[white]">
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

      <div className="aspect-video w-full max-w-[640px] border border-gray-200 rounded-2xl flex justify-center items-center relative">
        <div className="rounded-full size-14 flex justify-center items-center relative">
          <AnimatePresence>
            {status === "idle" && (
              <motion.button
                key="button"
                className="absolute inset-0 rounded-full bg-black flex justify-center items-center cursor-pointer"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                // whileHover={{ scale: 1.1 }}
                // whileTap={{ scale: 0.9 }}
                onClick={() => setStatus("loading")}
              >
                <Plus className="text-white size-6" />
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
                  <Check className="text-white size-6" />
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

export default GooeyLoaderLg;
