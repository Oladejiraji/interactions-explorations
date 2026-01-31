"use client";

import { cn } from "@/lib/utils";
import { Check, Globe, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import { Meta, X as XIcon, reddit } from "@/lib/assets";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

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

const LockIn = () => {
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

  const isReady = distractions.length > 0 && selectedTime !== null;

  return (
    <main
      className={cn(
        "w-screen h-screen flex justify-center items-center",
        focusMode ? "bg-[#111111]" : "bg-white",
      )}
    >
      <div className="relative flex flex-col justify-around h-full">
        <div className="w-80 md:w-100 mx-auto">
          <div className="flex items-center justify-between ">
            <h1
              className={cn(
                "text-sm",
                focusMode ? "text-[#A0A0A0]" : "text-[#3D3D3D]",
              )}
            >
              Lock In
            </h1>
          </div>
          <div
            className={cn(
              "px-3 py-6 rounded-[30px] mt-3",
              focusMode ? "bg-[#1A1A1A]" : "bg-[#FCFCFC]",
            )}
            style={{
              boxShadow: focusMode
                ? "0px 0px 0px 1px #2A2A2A"
                : "0px 0px 0px 1px #DEDEDE73",
            }}
          >
            <div className="mt-6">
              <motion.div
                animate={{ x: inputError ? [0, -8, 8, -8, 8, 0] : 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "pr-12 rounded-[12px] relative border-2",
                  inputError ? "border-red-400" : "border-transparent",
                  focusMode ? "bg-[#222222]" : "bg-[#F7F7F7]",
                )}
                style={{
                  boxShadow: focusMode
                    ? "0px 0px 0px 1px #333333"
                    : "0px 0px 0px 1px #EEEEEEE5",
                }}
              >
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (inputError) setInputError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                  placeholder="facebook.com"
                  className={cn(
                    "placeholder:font-medium w-full outline-none py-4 pl-4 bg-transparent",
                    focusMode
                      ? "text-white placeholder:text-gray-500"
                      : "text-black placeholder:text-gray-400",
                  )}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                        <Check
                          className={cn(
                            "size-4",
                            focusMode ? "text-black" : "text-white",
                          )}
                        />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="plus"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Plus
                          className={cn(
                            "size-4",
                            focusMode ? "text-black" : "text-white",
                          )}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </div>

            {distractions.length === 0 ? (
              <div className="h-8 mt-3" />
            ) : (
              <div
                className={cn(
                  "flex w-fit max-w-full rounded-full overflow-x-auto scrollbar-hide mt-3 p-0.5",
                  focusMode ? "bg-[#222222]" : "bg-[#F7F7F7]",
                )}
              >
                <AnimatePresence>
                  {distractions.map((distraction) => (
                    <motion.div
                      key={distraction.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      layout
                      className={cn(
                        "px-3 py-1.5 h-7 rounded-full font-medium text-xs flex items-center gap-1.5",
                        focusMode
                          ? "bg-[#2A2A2A] text-[#C0C0C0]"
                          : "bg-white text-[#3D3D3D]",
                      )}
                      style={{
                        boxShadow: focusMode
                          ? "0px 0px 0px 1px #333333"
                          : "0px 0px 0px 1px #EEEEEEE5",
                      }}
                    >
                      <SiteIcon domain={distraction.name} />
                      <span>{distraction.name}</span>
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center items-center gap-0">
              <h1
                className={cn(
                  "text-center text-[60px] md:text-[96px] font-medium leading-[0.9] letter-spacing-[-2px]",
                  focusMode ? "text-white" : "text-black py-6",
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
              </h1>
            </div>

            <div
              className={cn(
                "p-0.5 rounded-full flex items-center justify-center max-w-[245px] mx-auto",
                focusMode ? "bg-[#222222]" : "bg-[#F7F7F7]",
              )}
              style={{
                boxShadow: focusMode
                  ? "0px 0px 0px 1px #333333"
                  : "0px 0px 0px 1px #EEEEEEB2",
              }}
            >
              {timeOptions.map((time, index) => (
                <button
                  onClick={() => setSelectedTime(time)}
                  key={index}
                  className={cn(
                    "w-15 h-9 rounded-full font-medium cursor-pointer text-xs relative",
                    focusMode ? "text-white" : "text-black",
                  )}
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
                      className={cn(
                        "absolute inset-0 rounded-full",
                        focusMode ? "bg-[#333333]" : "bg-white",
                      )}
                    />
                  ) : null}
                </button>
              ))}
            </div>
            <p
              className={cn(
                "text-xs text-center opacity-40 mt-2",
                focusMode ? "text-[#666666]" : "text-black",
              )}
            >
              You can always change the time
            </p>

            <div className="mt-17.75">
              {focusMode ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-sm md:text-base text-black transition-all bg-white p-4 rounded-[12px] w-full font-medium cursor-pointer"
                  onClick={() => setFocusMode(false)}
                  style={{
                    boxShadow: "0px 0px 0px 1px #333333",
                  }}
                >
                  I Give Up
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "text-sm md:text-base text-white transition-all bg-black p-4 rounded-[12px] w-full font-medium cursor-pointer",
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
          </div>
        </div>

        <div
          className={cn(
            "opacity-40 text-xs font-medium flex items-center justify-between",
            focusMode ? "text-white" : "text-black",
          )}
        >
          <p>
            Made by
            <Link
              href={"https://x.com/RajiOladeji"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="underline">Raji Oladeji</span>
            </Link>
          </p>
          <p>A chrome extension</p>
        </div>
      </div>
    </main>
  );
};

export default LockIn;
