"use client";
import React, { useRef, useState } from "react";
import { motion, useAnimate } from "motion/react";

const Gooey = () => {
  const [scope, animate] = useAnimate();
  const [cleanScope, animateClean] = useAnimate();
  const isOpen = useRef(false);
  const [showClean, setShowClean] = useState(false);

  const handleClick = async () => {
    if (isOpen.current) {
      isOpen.current = false;
      // Fade out clean div first
      await animateClean(
        cleanScope.current,
        { opacity: 0 },
        { duration: 0.15 },
      );
      setShowClean(false);
      // Collapse with gooey effect
      animate(
        scope.current,
        { y: 0 },
        { duration: 0.8, ease: [0.45, 0, 0.55, 1] },
      );
      animate(
        scope.current,
        { width: "120px" },
        { duration: 0.7, ease: [0.45, 0, 0.55, 1] },
      );
      await animate(
        scope.current,
        { height: "40px" },
        { duration: 0.7, ease: [0.45, 0, 0.55, 1] },
      );
    } else {
      isOpen.current = true;
      // Expand with gooey effect
      animate(
        scope.current,
        { y: -344 },
        { duration: 0.8, ease: [0.45, 0, 0.55, 1] },
      );
      animate(
        scope.current,
        { width: "480px" },
        { duration: 0.7, ease: [0.45, 0, 0.55, 1], delay: 0.1 },
      );
      await animate(
        scope.current,
        { height: "294px" },
        { duration: 0.7, ease: [0.45, 0, 0.55, 1], delay: 0.1 },
      );
      // Mount clean div then crossfade it in over the gooey element
      setShowClean(true);
    }
  };

  return (
    <main
      className="w-screen h-screen flex justify-center items-end pb-40 bg-[white]"
      onClick={handleClick}
    >
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 200 -80"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative w-30 h-10">
        {/* Gooey filtered layer — always rendered */}
        <div style={{ opacity: 0.4 }}>
          <div style={{ filter: "url(#gooey)" }} className="relative w-30 h-10">
            <div
              className="w-30 h-10 rounded-lg bg-black absolute left-1/2"
              style={{ transform: "translateX(-50%)" }}
            />
            <motion.div
              ref={scope}
              className="w-30 h-10 rounded-lg bg-black absolute"
            />
          </div>
        </div>

        {/* Clean layer fades in on top — no visibility toggle on gooey */}
        {showClean && (
          <motion.div
            ref={cleanScope}
            className="w-[480px] h-[294px] rounded-lg absolute top-0 left-0"
            style={{ y: -344, backgroundColor: "rgba(0,0,0,0)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex items-center justify-center w-full h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-black text-2xl font-medium">Rndr Realm</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Gooey;
