"use client";

import { Check, Copy, Highlighter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const iconVariants = {
  initial: { opacity: 0, scale: 0.6, rotate: -10 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.6, rotate: 10 },
};

const textVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 0.6, y: 0 },
  exit: { opacity: 0, y: -4 },
};

interface TooltipPosition {
  x: number;
  y: number;
}

const ToolbarButton = ({
  icon: Icon,
  doneIcon: DoneIcon,
  label,
  doneLabel,
  onClick,
}: {
  icon: React.ElementType;
  doneIcon: React.ElementType;
  label: string;
  doneLabel: string;
  onClick: () => void;
}) => {
  const [done, setDone] = useState(false);

  const handleClick = () => {
    onClick();
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  return (
    <button
      className="flex flex-col justify-center items-center cursor-pointer py-2 px-4 rounded-sm hover:bg-[#A65E2E]/10 transition-colors"
      onClick={handleClick}
    >
      <div className="relative size-6">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.span
              key="done"
              className="absolute inset-0 flex items-center justify-center text-[#A65E2E]"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", duration: 0.3, bounce: 0.5 }}
            >
              <DoneIcon size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              className="absolute inset-0 flex items-center justify-center"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", duration: 0.3, bounce: 0.5 }}
            >
              <Icon size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative h-5 mt-1 w-12">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.p
              key="done-text"
              className="absolute inset-0 text-sm text-center text-[#A65E2E]"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              {doneLabel}
            </motion.p>
          ) : (
            <motion.p
              key="idle-text"
              className="absolute inset-0 text-sm text-center"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

const Tooltip = ({ onHighlight }: { onHighlight: () => void }) => {
  const handleCopy = async () => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) return;
    await navigator.clipboard.writeText(selection.toString());
  };

  return (
    <div className="flex items-center justify-center border border-[#A65E2E]/15 p-1.5 bg-[#FCFAF7] rounded-sm shadow-lg">
      <ToolbarButton
        icon={Copy}
        doneIcon={Check}
        label="Copy"
        doneLabel="Copied"
        onClick={handleCopy}
      />
      <ToolbarButton
        icon={Highlighter}
        doneIcon={Check}
        label="Highlight"
        doneLabel="Done"
        onClick={onHighlight}
      />
    </div>
  );
};

const InlineEdit = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);

  const handleMouseUp = useCallback(() => {
    const selection = document.getSelection();

    if (!selection || selection.isCollapsed) {
      setTooltipPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (!containerRect) return;

    setTooltipPos({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top,
    });
  }, []);

  const handleHighlight = useCallback(() => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const mark = document.createElement("mark");
    mark.className = "bg-[#FDE047] rounded-sm py-0.5";
    range.surroundContents(mark);
    selection.removeAllRanges();
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (tooltipRef.current?.contains(e.target as Node)) return;
    setTooltipPos(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  return (
    <main className="w-screen h-screen bg-[#F4F1EA] flex items-center justify-center ">
      <div
        className="bg-[#FCFAF7] max-w-[600px] px-8 py-10 mx-auto h-full text-[#3D3834] relative selection:bg-[#A65E2E]/20 selection:text-[#3D3834]"
        ref={containerRef}
      >
        <AnimatePresence>
          {tooltipPos && (
            <motion.div
              ref={tooltipRef}
              className="absolute z-10"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                translateX: "-50%",
                translateY: "-100%",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", duration: 0.25, bounce: 0.4 }}
            >
              <Tooltip onHighlight={handleHighlight} />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="leading-7 tracking-wide pb-8 ">
          The garden was quiet, filled with the scent of late summer roses and
          the earthy smell of rain on dry soil. It was here that she found the
          letter.
        </p>
        <p className="leading-7 tracking-wide pb-8">
          She hesitated before breaking the seal. The paper was thick, creamy,
          and textured, much like the stationery she used for her own
          correspondence. The nature of consciousness, he had written, is not
          unlike a labyrinth—a series of turns and choices that lead us
          inevitably back to ourselves. It was a curious thought to send on the
          eve of a wedding.
        </p>
        <p className="leading-7 tracking-wide pb-8">
          Elizabeth folded the paper carefully, aligning the edges with a
          precision that betrayed her nervousness. The sun began to dip below
          the horizon, casting long, terracotta shadows across the stone patio.
        </p>
        <p className="leading-7 tracking-wide pb-8">
          Elizabeth folded the paper carefully, aligning the edges with a
          precision that betrayed her nervousness. The sun began to dip below
          the horizon, casting long, terracotta shadows across the stone patio.
        </p>
        <p className="leading-7 tracking-wide pb-8">
          Elizabeth folded the paper carefully, aligning the edges with a
          precision that betrayed her nervousness. The sun began to dip below
          the horizon, casting long, terracotta shadows across the stone patio.
        </p>
      </div>
    </main>
  );
};

export default InlineEdit;
