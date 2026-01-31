"use client";

import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";

const randomColors = [
  "bg-rose-100 border-rose-400",
  "bg-sky-100 border-sky-400",
  "bg-amber-100 border-amber-400",
  "bg-emerald-100 border-emerald-400",
  "bg-violet-100 border-violet-400",
  "bg-fuchsia-100 border-fuchsia-400",
  "bg-teal-100 border-teal-400",
  "bg-orange-100 border-orange-400",
  "bg-lime-100 border-lime-400",
  "bg-cyan-100 border-cyan-400",
];

interface DistractionType {
  name: string;
  color: string;
}

function getRandomColor() {
  return randomColors[Math.floor(Math.random() * randomColors.length)];
}

const timeOptions = [15, 30, 45, 60];

const Distractions = () => {
  const [value, setValue] = useState("");
  const [distractions, setDistractions] = useState<DistractionType[]>(() =>
    [].map((name) => ({
      name,
      color: getRandomColor(),
    })),
  );

  const [inputError, setInputError] = useState(false);
  const [inputSuccess, setInputSuccess] = useState(false);

  const isValidDomain = (str: string) =>
    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(str.trim());

  const handleAdd = () => {
    if (!isValidDomain(value)) {
      setInputError(true);
      setTimeout(() => setInputError(false), 600);
      return;
    }
    setDistractions([
      ...distractions,
      { name: value.trim(), color: getRandomColor() },
    ]);
    setValue("");
    setInputError(false);
    setInputSuccess(true);
    setTimeout(() => setInputSuccess(false), 600);
  };

  const [selectedTime, setSelectedTime] = useState<number | null>(15);
  const [remaining, setRemaining] = useState((selectedTime ?? 0) * 60);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    setRemaining((selectedTime ?? 0) * 60);
  }, [selectedTime]);

  useEffect(() => {
    if (!focusMode || remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, focusMode]);

  return (
    <main className="w-screen h-screen flex justify-center items-center bg-black">
      <div className="relative">
        <div className="w-80 mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg text-white">
              LOCK <span className="font-medium">IN</span>
            </h1>
            <button className="py-1 px-2.5 text-white border border-white rounded-full text-[10px]">
              CHROME EXT
            </button>
          </div>
          <div className="p-5 rounded-[20px] bg-white mt-4">
            <h1 className="text-2xl">
              ADD <span className="font-semibold">DISTRACTIONS</span> TO{" "}
              <span className="font-semibold">BLOCK</span>
            </h1>
            <div className="my-5">
              <motion.div
                animate={inputError ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "pr-12 bg-[#f2f2f2] rounded-[12px] relative border-2 transition-colors",
                  inputError ? "border-red-400" : "border-transparent",
                )}
              >
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (inputError) setInputError(false);
                  }}
                  placeholder="facebook.com"
                  className="placeholder:text-gray-400 placeholder:font-medium outline-none py-4 pl-4"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    backgroundColor: inputError
                      ? "#f87171"
                      : inputSuccess
                        ? "#4ade80"
                        : "#000000",
                    rotate: inputError ? 45 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="rounded-full absolute right-0 size-8 flex justify-center items-center mr-2 top-1/2 -translate-y-1/2"
                  onClick={handleAdd}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {inputSuccess ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="text-white size-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="plus"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Plus className="text-white size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-30 content-start overflow-y-auto">
              <AnimatePresence>
                {distractions.map((distraction) => (
                  <motion.div
                    key={distraction.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    layout
                    className={`px-3 py-1.5 h-7 rounded-full font-medium text-xs flex items-center gap-1 border ${distraction.color}`}
                  >
                    <h1>{distraction.name}</h1>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      className=""
                      onClick={() =>
                        setDistractions(
                          distractions.filter(
                            (d) => d.name !== distraction.name,
                          ),
                        )
                      }
                    >
                      <X className="size-2 " />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-1 bg-[#f2f2f2] rounded-full my-4 flex items-center justify-center ">
              {timeOptions.map((time, index) => (
                <button
                  onClick={() => setSelectedTime(time)}
                  key={index}
                  className={cn(
                    "px-3 py-1.5 flex-1 rounded-full font-semibold cursor-pointer text-[13px] relative",
                  )}
                >
                  <span className="relative z-1">{time} min</span>
                  {selectedTime === time ? (
                    <motion.span
                      layoutId="option-highlight"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1)] "
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="text-base text-white bg-black p-4 rounded-[12px] w-full"
                onClick={() => setFocusMode(true)}
              >
                START <span className="font-semibold">FOCUSING</span>
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {focusMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#DBFF55] p-7.5 rounded-[20px] w-90 h-[520px] absolute inset-0 z-10"
            >
              <div className="flex flex-col h-full">
                <h1 className="text-black text-2xl text-center tracking-[-0.02em]">
                  DON'T <span className="font-bold">GIVE UP</span>
                </h1>

                <div className="flex-1 flex flex-col justify-center items-center gap-0">
                  <h1 className="text-center text-[80px] font-bold leading-[0.9] letter-spacing-[-2px]">
                    <NumberFlow value={Math.floor(remaining / 60)} />
                    :
                    <NumberFlow
                      value={remaining % 60}
                      format={{ minimumIntegerDigits: 2 }}
                    />
                  </h1>

                  <div className="px-4 py-0.5 text-sm font-bold rounded-full  border-black border-2 bg-[rgba(255,255,255,0.2)]">
                    <p className="">UNTIL FREEDOM</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-base text-white bg-black font-semibold px-4 py-3 rounded-[12px] w-full"
                  onClick={() => setFocusMode(false)}
                >
                  I <span className="font-semibold">GIVE UP</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Distractions;
