"use client";

import { cn } from "@/lib/utils";
import { Check, Globe, Plus, X } from "lucide-react";
import React, { Fragment, useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { Meta, X as XIcon, blob, reddit } from "@/lib/assets";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { BellIcon, Pause, Play as PlayIcon, Restart } from "@/lib/svgs";

interface DistractionType {
  name: string;
}

const customIcons: Record<string, StaticImageData> = {
  "facebook.com": Meta,
  "meta.com": Meta,
  "instagram.com": Meta,
  "whatsapp.com": Meta,
  "x.com": XIcon,
  "twitter.com": XIcon,
  "reddit.com": reddit,
};

function SiteIcon({ domain }: { domain: string }) {
  const [errored, setErrored] = useState(false);
  const customIcon = customIcons[domain.toLowerCase()];

  if (customIcon) {
    return (
      <Image
        src={customIcon}
        alt=""
        className="size-3.5 shrink-0 rounded-sm"
        width={14}
        height={14}
      />
    );
  }

  if (errored) {
    return <Globe className="size-3.5 text-gray-400 shrink-0" />;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      className="size-3.5 shrink-0 rounded-sm"
      onError={() => setErrored(true)}
    />
  );
}

const timeOptions = [15, 30, 45, 60];

const colorTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] } as const;

const LockIn = () => {
  const [restartScope, animateRestart] = useAnimate();
  const [value, setValue] = useState("");
  const [distractions, setDistractions] = useState<DistractionType[]>([]);

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
    setDistractions([...distractions, { name: value.trim() }]);
    setValue("");
    setInputError(false);
    setInputSuccess(true);
    setTimeout(() => setInputSuccess(false), 600);
  };

  const [selectedTime, setSelectedTime] = useState<number | null>(15);
  const [remaining, setRemaining] = useState((selectedTime ?? 0) * 60);
  const [focusMode, setFocusMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setRemaining((selectedTime ?? 0) * 60);
  }, [selectedTime]);

  useEffect(() => {
    if (!focusMode || isPaused || remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, focusMode, isPaused]);

  const isReady = distractions.length > 0 && selectedTime !== null;
  return (
    <main className="w-screen h-screen flex justify-center items-center relative">
      {focusMode ? (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-1"
          aria-hidden
        >
          <Image src={blob} width={429} height={429} alt="background blob" />
        </div>
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "#ffffff" }}
      />
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: focusMode ? 1 : 0 }}
        transition={colorTransition}
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #DEAA93 -10.03%, #B18180 17.75%, #6D6382 46.79%, #384258 78.36%, #111B28 116.24%)",
        }}
      />
      <div className="relative z-2 flex flex-col justify-around h-full">
        <div className="w-80 md:w-100 mx-auto">
          <div className="flex items-center justify-between ">
            <motion.h1
              initial={false}
              animate={{ color: focusMode ? "#ffffff" : "#3D3D3D" }}
              transition={colorTransition}
              className="text-sm"
            >
              Lock In
            </motion.h1>
          </div>
          <motion.div
            initial={false}
            animate={{
              backgroundColor: focusMode ? "#0000004D" : "#FCFCFC",
              boxShadow: focusMode
                ? "0px 0px 0px 1px #E1A89F66"
                : "0px 0px 0px 1px #DEDEDE73",
              backdropFilter: focusMode ? "blur(4px)" : "blur(0px)",
            }}
            transition={colorTransition}
            className="px-4 pt-6 pb-4 rounded-[30px] mt-3"
          >
            <div className="">
              {focusMode ? (
                <div
                  className="rounded-[12px] bg-[#705559] flex items-center gap-2 py-3.5 px-4"
                  style={{ boxShadow: "0px 0px 0px 1px #7F676DE5" }}
                >
                  <BellIcon />
                  <motion.p
                    className="text-[#959595] text-sm font-medium"
                    initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                    transition={{ duration: 0.25 }}
                  >
                    Your focus mode ends by 19:00
                  </motion.p>
                </div>
              ) : (
                <motion.div
                  initial={false}
                  animate={{
                    x: inputError ? [0, -8, 8, -8, 8, 0] : 0,
                    backgroundColor: focusMode ? "#222222" : "#F7F7F7",
                    boxShadow: focusMode
                      ? "0px 0px 0px 1px #333333"
                      : "0px 0px 0px 1px #EEEEEEE5",
                  }}
                  transition={{
                    x: { duration: 0.4 },
                    backgroundColor: colorTransition,
                    boxShadow: colorTransition,
                  }}
                  className={cn(
                    "pr-12 rounded-[12px] relative border-2",
                    inputError ? "border-red-400" : "border-transparent",
                  )}
                >
                  <motion.input
                    type="text"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setValue(e.target.value);
                      if (inputError) setInputError(false);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") handleAdd();
                    }}
                    initial={false}
                    animate={{ color: focusMode ? "#ffffff" : "#000000" }}
                    transition={colorTransition}
                    placeholder="facebook.com"
                    className={cn(
                      "placeholder:font-medium w-full outline-none py-3 pl-4 bg-transparent",
                      focusMode
                        ? "placeholder:text-gray-500"
                        : "placeholder:text-gray-400",
                    )}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={false}
                    animate={{
                      backgroundColor: inputError
                        ? "#f87171"
                        : inputSuccess
                          ? "#4ade80"
                          : focusMode
                            ? "#ffffff"
                            : "#000000",
                      rotate: inputError ? 45 : 0,
                    }}
                    transition={{
                      backgroundColor: colorTransition,
                      rotate: { duration: 0.3 },
                    }}
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
                          <motion.div
                            initial={false}
                            animate={{
                              color: focusMode ? "#000000" : "#ffffff",
                            }}
                            transition={colorTransition}
                          >
                            <Check className="size-4" />
                          </motion.div>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="plus"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15 }}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              color: focusMode ? "#000000" : "#ffffff",
                            }}
                            transition={colorTransition}
                          >
                            <Plus className="size-4" />
                          </motion.div>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              )}
            </div>

            {distractions.length === 0 ? (
              <div className="h-8 mt-3" />
            ) : (
              <motion.div
                initial={false}
                animate={{ backgroundColor: focusMode ? "#7F676D" : "#F7F7F7" }}
                transition={colorTransition}
                className="flex w-fit max-w-full rounded-full overflow-x-auto scrollbar-hide mt-3 p-0.5"
              >
                <AnimatePresence>
                  {distractions.map((distraction, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                        backgroundColor: focusMode ? "#705559" : "#ffffff",
                        color: focusMode ? "#fff" : "#3D3D3D",
                        boxShadow: focusMode
                          ? "none"
                          : "0px 0px 0px 1px #EEEEEEE5",
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        backgroundColor: focusMode ? "#705559" : "#ffffff",
                        color: focusMode ? "#fff" : "#3D3D3D",
                        boxShadow: focusMode
                          ? "none"
                          : "0px 0px 0px 1px #EEEEEEE5",
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                        backgroundColor: colorTransition,
                        color: colorTransition,
                        boxShadow: colorTransition,
                      }}
                      layout
                      className="px-3 py-1.5 h-7 rounded-full font-medium text-xs flex items-center gap-1.5"
                    >
                      <SiteIcon domain={distraction.name} />
                      <span
                        className={cn({
                          "opacity-70": focusMode,
                        })}
                      >
                        {distraction.name}
                      </span>
                      {!focusMode ? (
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
                          <X className="size-3 " />
                        </motion.button>
                      ) : null}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            <div className="flex-1 flex flex-col justify-center items-center gap-0">
              <motion.h1
                initial={false}
                animate={{ color: focusMode ? "#ffffff" : "#000000" }}
                transition={colorTransition}
                className={cn(
                  "text-center text-[60px] md:text-[96px] font-medium leading-[0.9] letter-spacing-[-2px] tabular-nums",
                  !focusMode && "py-6",
                )}
              >
                {focusMode ? (
                  <>
                    <NumberFlow value={Math.floor(remaining / 60)} />
                    :
                    <NumberFlow
                      value={remaining % 60}
                      format={{ minimumIntegerDigits: 2 }}
                    />
                  </>
                ) : (
                  <>{selectedTime ?? 15}m</>
                )}
              </motion.h1>
            </div>

            <AnimatePresence>
              {focusMode ? (
                <Fragment>
                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsPaused((prev) => !prev)}
                      className="size-9 rounded-lg border border-[#C08B8780] flex items-center justify-center cursor-pointer"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isPaused ? (
                          <motion.span
                            key="play"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-center"
                          >
                            <PlayIcon />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="pause"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-center"
                          >
                            <Pause />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setRemaining((selectedTime ?? 0) * 60);
                        setIsPaused(false);
                        animateRestart(
                          restartScope.current,
                          { rotate: [0, -360] },
                          { duration: 0.4, ease: "easeInOut" },
                        );
                      }}
                      className="size-9 rounded-lg border border-[#C08B8780] flex items-center justify-center cursor-pointer"
                    >
                      <span
                        ref={restartScope}
                        className="flex items-center justify-center"
                      >
                        <Restart />
                      </span>
                    </motion.button>
                  </div>
                </Fragment>
              ) : (
                <Fragment>
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: focusMode ? "#222222" : "#F7F7F7",
                      boxShadow: focusMode
                        ? "0px 0px 0px 1px #333333"
                        : "0px 0px 0px 1px #EEEEEEB2",
                    }}
                    transition={colorTransition}
                    className="p-0.5 rounded-full flex items-center justify-center max-w-[245px] mx-auto"
                  >
                    {timeOptions.map((time, index) => (
                      <motion.button
                        onClick={() => setSelectedTime(time)}
                        key={index}
                        initial={false}
                        animate={{ color: focusMode ? "#ffffff" : "#000000" }}
                        transition={colorTransition}
                        className="w-15 h-9 rounded-full font-medium cursor-pointer text-xs relative"
                      >
                        <span
                          className={cn("relative z-1", {
                            "opacity-50": selectedTime !== time,
                          })}
                        >
                          {time}M
                        </span>
                        {selectedTime === time ? (
                          <motion.span
                            layoutId="option-highlight"
                            initial={false}
                            animate={{
                              backgroundColor: focusMode
                                ? "#333333"
                                : "#ffffff",
                            }}
                            transition={colorTransition}
                            className="absolute inset-0 rounded-full"
                          />
                        ) : null}
                      </motion.button>
                    ))}
                  </motion.div>
                </Fragment>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {focusMode ? (
                <motion.p
                  key="focus-text"
                  className="pt-2 text-center text-xs text-[#C08B87]"
                  initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                  transition={{ duration: 0.25 }}
                >
                  {selectedTime} Minutes
                </motion.p>
              ) : (
                <motion.p
                  key="default-text"
                  className="text-xs text-center mt-2"
                  initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                  animate={{
                    opacity: 0.4,
                    y: 0,
                    filter: "blur(0px)",
                    color: "#000000",
                  }}
                  exit={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                  transition={{ duration: 0.25 }}
                >
                  You can always change the time
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-17.75">
              {focusMode ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-sm md:text-base text-black transition-all bg-white px-4 py-3 rounded-[12px] w-full font-medium cursor-pointer"
                  onClick={() => setFocusMode(false)}
                  style={{
                    boxShadow: "0px 0px 0px 1px #EEEEEEE5",
                  }}
                >
                  Set New Focus
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "text-sm md:text-base text-white transition-all bg-black px-4 py-3 rounded-[12px] w-full font-medium cursor-pointer",
                    { "bg-[#E9E9E9] text-[#A4A4A4]": !isReady },
                  )}
                  onClick={() => setFocusMode(true)}
                  disabled={!isReady}
                  style={{
                    boxShadow: "0px 0px 0px 1px #EEEEEEE5",
                  }}
                >
                  Start Focusing
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={false}
          animate={{ color: focusMode ? "#ffffff" : "#000000" }}
          transition={colorTransition}
          className="opacity-40 text-xs font-medium flex items-center justify-between "
        >
          <p>
            Made by
            <Link
              href={"https://x.com/RajiOladeji"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="underline"> Raji Oladeji</span>
            </Link>
          </p>
          <p>A chrome extension</p>
        </motion.div>
      </div>
    </main>
  );
};

export default LockIn;
