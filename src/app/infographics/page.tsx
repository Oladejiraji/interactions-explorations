"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const monthlyData: Record<
  string,
  { recurring: number; oneTime: number; refunds: number }
> = {
  "Jan 2026": { recurring: 8750.0, oneTime: 22400.5, refunds: 1280.25 },
  "Feb 2026": { recurring: 28850.75, oneTime: 3890.0, refunds: 6450.0 },
  "Mar 2026": { recurring: 12420.0, oneTime: 12245.5, refunds: 11892.75 },
  "Apr 2026": { recurring: 31100.5, oneTime: 2430.0, refunds: 810.0 },
  "May 2026": { recurring: 5875.25, oneTime: 26200.0, refunds: 8675.5 },
  "Jun 2026": { recurring: 19340.0, oneTime: 8670.75, refunds: 3120.0 },
};

const months = Object.keys(monthlyData);

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function SlidingText({
  value,
  direction,
}: {
  value: string;
  direction: number;
}) {
  return (
    <span className="inline-flex overflow-hidden relative">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: direction > 0 ? "100%" : "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: direction > 0 ? "-100%" : "100%" }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const Infographics = () => {
  const [monthIndex, setMonthIndex] = useState(2);
  const [direction, setDirection] = useState(0);

  const month = months[monthIndex];
  const data = monthlyData[month];
  const total = data.recurring + data.oneTime - data.refunds;
  const barTotal = data.recurring + data.oneTime + data.refunds;
  const recurringWidth = (data.recurring / barTotal) * 100;
  const oneTimeWidth = (data.oneTime / barTotal) * 100;
  const refundsWidth = (data.refunds / barTotal) * 100;

  const goTo = (dir: -1 | 1) => {
    const next = monthIndex + dir;
    if (next < 0 || next >= months.length) return;
    setDirection(dir);
    setMonthIndex(next);
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-[#eae8e4]">
      <div className="bg-[#fefdfb] rounded-2xl p-8 shadow-sm max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-[#2a1f0e] font-medium">Monthly Revenue</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={monthIndex === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#2a1f0e] hover:bg-[#2a1f0e]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-medium text-[#2a1f0e] w-20 text-center">
              {month}
            </span>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={monthIndex === months.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#2a1f0e] hover:bg-[#2a1f0e]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <h1 className="text-5xl font-medium text-[#2a1f0e] tracking-tight mb-6">
          ${" "}
          <SlidingText value={formatCurrency(total)} direction={direction} />
        </h1>

        <div className="flex h-16 overflow-hidden mb-6">
          <motion.div
            className="bg-[#A8D45F]"
            animate={{ width: `${recurringWidth}%` }}
            transition={spring}
          />
          <motion.div
            className="bg-[#2a1f0e]"
            animate={{ width: `${oneTimeWidth}%` }}
            transition={spring}
          />
          <motion.div
            className="bg-[#E8637A]"
            animate={{ width: `${refundsWidth}%` }}
            transition={spring}
          />
        </div>

        <div className="grid grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A8D45F]" />
              <span className="text-sm text-[#2a1f0e]/70">Recurring</span>
            </div>
            <span className="text-sm font-semibold text-[#2a1f0e] pl-[18px]">
              $<SlidingText value={formatCurrency(data.recurring)} direction={direction} />
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a1f0e]" />
              <span className="text-sm text-[#2a1f0e]/70">One-time</span>
            </div>
            <span className="text-sm font-semibold text-[#2a1f0e] pl-[18px]">
              $<SlidingText value={formatCurrency(data.oneTime)} direction={direction} />
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8637A]" />
              <span className="text-sm text-[#2a1f0e]/70">Refunds</span>
            </div>
            <span className="text-sm font-semibold text-[#2a1f0e] pl-[18px]">
              -$<SlidingText value={formatCurrency(data.refunds)} direction={direction} />
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Infographics;
