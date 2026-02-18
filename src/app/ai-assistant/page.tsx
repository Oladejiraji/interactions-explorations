"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

const CIRCLE_COUNT = 7;
const RADIUS = 28;
const DURATIONS = [1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4];
const SCALE_DURATION = 0.35;
const SPREAD_DURATION = 0.3;
const ORBIT_DELAY = SCALE_DURATION + SPREAD_DURATION;

const FAKE_RESPONSES = [
  "That's a great question. The universe is approximately 13.8 billion years old, based on observations of the cosmic microwave background radiation.",
  "I'd be happy to help with that. The key to understanding this concept is breaking it down into smaller, more manageable pieces.",
  "Interesting thought! Research suggests that creativity isn't a fixed trait — it's a skill that can be developed through practice and exposure to diverse ideas.",
  "From what I understand, the most effective approach would be to start with the fundamentals and gradually build complexity from there.",
  "That's something I find fascinating too. The short answer is that it depends on context, but let me explain the nuances.",
];

type Phase = "idle" | "expanding" | "thinking" | "collapsing" | "responding";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const GooeyOrb = ({
  phase,
  onThinkingDone,
  onCollapsed,
}: {
  phase: Phase;
  onThinkingDone: () => void;
  onCollapsed: () => void;
}) => {
  const isOrbVisible = phase === "idle" || phase === "responding";
  const isExpanding = phase === "expanding";
  const isOrbiting = phase === "thinking";
  const isCollapsing = phase === "collapsing";
  const showParticles = isExpanding || isOrbiting || isCollapsing;

  useEffect(() => {
    if (phase === "thinking") {
      const timer = setTimeout(onThinkingDone, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, onThinkingDone]);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* The main orb */}
      <AnimatePresence>
        {isOrbVisible && (
          <motion.div
            key="orb"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #6366f1, #8b5cf6, #a855f7, #7c3aed)",
              boxShadow:
                "0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)",
            }}
          >
            {/* Idle breathing animation */}
            {phase === "idle" && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.3)",
                    "0 0 40px rgba(139, 92, 246, 0.6)",
                    "0 0 20px rgba(139, 92, 246, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gooey particles */}
      {showParticles && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: "url(#gooey-ai)" }}
        >
          {new Array(CIRCLE_COUNT).fill(0).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: isExpanding ? 5 : 1 }}
              animate={{ scale: isCollapsing ? 5 : 1 }}
              transition={{
                duration: SCALE_DURATION,
                ease: "easeOut",
                delay: isCollapsing ? SPREAD_DURATION : 0,
              }}
              onAnimationComplete={() => {
                if (isCollapsing && i === 0) onCollapsed();
              }}
              className="absolute"
            >
              <motion.div
                initial={{ rotate: (360 / CIRCLE_COUNT) * i }}
                animate={{ rotate: (360 / CIRCLE_COUNT) * i + 360 }}
                transition={{
                  duration: DURATIONS[i],
                  repeat: isCollapsing ? 0 : Infinity,
                  ease: "linear",
                  delay: isCollapsing ? 0 : ORBIT_DELAY,
                }}
              >
                <motion.div
                  initial={{ y: isExpanding ? 0 : -RADIUS }}
                  animate={{ y: isCollapsing ? 0 : -RADIUS }}
                  transition={{
                    duration: SPREAD_DURATION,
                    delay: isCollapsing ? 0 : SCALE_DURATION,
                    ease: "easeOut",
                  }}
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background:
                      i % 3 === 0
                        ? "#8b5cf6"
                        : i % 3 === 1
                          ? "#6366f1"
                          : "#a855f7",
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const TypingText = ({
  text,
  onDone,
}: {
  text: string;
  onDone: () => void;
}) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onDone();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-violet-400 ml-[1px] align-text-bottom"
        />
      )}
    </span>
  );
};

const AiAssistant = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndexRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || phase !== "idle") return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setCurrentResponse(
      FAKE_RESPONSES[responseIndexRef.current % FAKE_RESPONSES.length]
    );
    responseIndexRef.current += 1;
    setPhase("expanding");

    // After expansion, move to thinking
    setTimeout(() => setPhase("thinking"), SCALE_DURATION * 1000 + 100);
  };

  const handleThinkingDone = React.useCallback(() => {
    setPhase("collapsing");
  }, []);

  const handleCollapsed = React.useCallback(() => {
    setPhase("responding");
  }, []);

  const handleResponseDone = React.useCallback(() => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: currentResponse },
    ]);
    setCurrentResponse("");
    setPhase("idle");
  }, [currentResponse]);

  return (
    <main className="w-screen h-screen flex flex-col items-center bg-[#0a0a0f] text-white overflow-hidden">
      {/* Hidden SVG filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-ai">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 25 -8"
            />
          </filter>
        </defs>
      </svg>

      {/* Messages area */}
      <div className="flex-1 w-full max-w-2xl overflow-y-auto px-6 pt-8 pb-4 scrollbar-hide">
        {messages.length === 0 && phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-6"
          >
            <GooeyOrb
              phase="idle"
              onThinkingDone={() => {}}
              onCollapsed={() => {}}
            />
            <div className="text-center">
              <h1 className="text-xl font-medium text-white/90 mb-2">
                How can I help you?
              </h1>
              <p className="text-sm text-white/40">
                Ask me anything and watch me think.
              </p>
            </div>
          </motion.div>
        )}

        {(messages.length > 0 || phase !== "idle") && (
          <div className="flex flex-col gap-5">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "max-w-[85%] text-[15px] leading-relaxed",
                  msg.role === "user"
                    ? "self-end bg-violet-600/20 text-white/90 px-4 py-2.5 rounded-2xl rounded-br-md"
                    : "self-start text-white/80"
                )}
              >
                {msg.text}
              </motion.div>
            ))}

            {/* Active thinking/responding state */}
            {phase !== "idle" && (
              <div className="self-start flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <GooeyOrb
                    phase={phase}
                    onThinkingDone={handleThinkingDone}
                    onCollapsed={handleCollapsed}
                  />
                  {(phase === "expanding" ||
                    phase === "thinking" ||
                    phase === "collapsing") && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-white/40"
                    >
                      Thinking...
                    </motion.span>
                  )}
                </div>
                {phase === "responding" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[15px] leading-relaxed text-white/80 max-w-[85%]"
                  >
                    <TypingText
                      text={currentResponse}
                      onDone={handleResponseDone}
                    />
                  </motion.div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="w-full max-w-2xl px-6 pb-8 pt-2">
        <div
          className="relative flex items-center rounded-2xl bg-white/[0.06] border border-white/[0.08]"
          style={{
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask me anything..."
            disabled={phase !== "idle"}
            className={cn(
              "flex-1 bg-transparent outline-none py-3.5 pl-5 pr-14 text-[15px] text-white/90 placeholder:text-white/30",
              phase !== "idle" && "opacity-50 cursor-not-allowed"
            )}
          />
          <motion.button
            onClick={handleSubmit}
            disabled={phase !== "idle" || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "absolute right-2.5 size-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors",
              input.trim() && phase === "idle"
                ? "bg-violet-600 text-white"
                : "bg-white/10 text-white/30"
            )}
          >
            <ArrowUp className="size-4" />
          </motion.button>
        </div>
      </div>
    </main>
  );
};

export default AiAssistant;
