"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import NumberFlow from "@number-flow/react";

const normalizeRadians = (angle: number) => {
  if (angle > Math.PI) angle -= 2 * Math.PI;
  if (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const radToDeg = (rad: number) => rad * (180 / Math.PI);

const normalizeDegrees = (deg: number) => {
  const result = deg % 360;
  return result < 0 ? result + 360 : result;
};

const shortestAngleDiff = (a: number, b: number) => {
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
};

const NUMBER_OF_SEGMENTS = 50;
const MAX_SCALE = 3.5;
const PROXIMITY_THRESHOLD = 15;


export default function CircularDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const [displayRotation, setDisplayRotation] = useState(0);

  const ref = useRef<HTMLDivElement>(null);
  const lastAngle = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickIndex = useRef(0);

  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { stiffness: 200, damping: 20 });

  const oppositeRotation = useTransform(rotation, (value) => -value);

  const normalizedRotation = useTransform(rotation, normalizeDegrees);


  const playClick = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1800, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
  }, []);

  const getAngleFromCenter = useCallback((x: number, y: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(y - cy, x - cx);
  }, []);


  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastAngle.current = getAngleFromCenter(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const newAngle = getAngleFromCenter(e.clientX, e.clientY);
    const delta = normalizeRadians(newAngle - lastAngle.current);
    const deltaDeg = radToDeg(delta);

    rotation.set(rotation.get() + deltaDeg);
    lastAngle.current = newAngle;
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  const getTickScale = (tickDeg: number) => {
    const current = normalizedRotation.get();
    const diff = shortestAngleDiff(current, tickDeg);

    if (diff >= PROXIMITY_THRESHOLD) return 1;

    return 1 + (MAX_SCALE - 1) * (1 - diff / PROXIMITY_THRESHOLD);
  };

  useEffect(() => {
    const unsubscribe = normalizedRotation.on("change", (value) => {
      setDisplayRotation(value);
      const tickIndex = Math.floor(value / (360 / NUMBER_OF_SEGMENTS));
      if (tickIndex !== lastTickIndex.current) {
        lastTickIndex.current = tickIndex;
        playClick();
      }
    });
    return () => unsubscribe();
  }, [normalizedRotation, playClick]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="relative w-110 h-110 rounded-full flex justify-center items-center border border-slate-100">
        <motion.div
          className="absolute inset-0"
          style={{
            rotate: oppositeRotation,
          }}
        >
          {Array(NUMBER_OF_SEGMENTS)
            .fill(0)
            .map((_, index) => {
              const angle =
                (index / NUMBER_OF_SEGMENTS) * 2 * Math.PI - Math.PI / 2;

              const angleDeg = radToDeg(angle);
              const x = 190 * Math.cos(angle);
              const y = 190 * Math.sin(angle);

              const normalizedTickDeg = normalizeDegrees(
                angleDeg + 90 + oppositeRotation.get()
              );

              const scale = getTickScale(normalizedTickDeg);
              const opacity = scale / 3.5 - 0.1;

              const width = 10 * scale;

              return (
                <motion.div
                  animate={{
                    x,
                    y,
                    rotate: angleDeg,
                  }}
                  key={index}
                  className={`absolute h-0.5 top-1/2 left-1/2 flex justify-start items-center text-white transform -translate-x-1/2 -translate-y-1/2`}
                  style={{ width: MAX_SCALE * 10, opacity }}
                >
                  <motion.div
                    animate={{
                      width: width,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    className="w-full h-full b-slate-200 bg-[oklch(0.375_0_0)]"
                  />
                </motion.div>
              );
            })}
        </motion.div>


        <motion.div
          ref={ref}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            rotate: smoothRotation,
            cursor: "grab",
            touchAction: "none",
          }}
          className="relative w-[280px] h-[280px] rounded-full bg-white knob-shadow flex items-center justify-center active:cursor-grabbing z-5 touch-none transition-transform duration-75 ease-out will-change-transform cursor-grab shadow-[0_6px_14px_-2px_rgba(0,0,0,0.08),0_24px_60px_-10px_rgba(0,0,0,0.06),0_80px_160px_rgba(0,0,0,0.04),inset_0_2px_12px_rgba(255,255,255,0.10),inset_0_-4px_24px_rgba(0,0,0,0.05)]"
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-white via-white to-slate-50 opacity-80 pointer-events-none flex items-center justify-center"></div>
          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 flex flex-col items-center z-3 drop-shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{
                transform: "rotate(-90deg)",
              }}
            >
              <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0h24ZM12.594 23.258l-.012.002-.071.035-.02.004-.014-.004-.071-.036c-.01-.003-.019 0-.024.006l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.016-.018Zm.264-.113-.014.002-.184.093-.01.01-.003.011.018.43.005.012.008.008.201.092c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.003-.011.018-.43-.003-.012-.01-.01-.184-.092Z" />
                <path
                  fill="#09244BFF"
                  d="M14.536 12.707a1 1 0 0 0 0-1.414l-2.829-2.829A1 1 0 0 0 10 9.172v5.656a1 1 0 0 0 1.707.708l2.829-2.829Z"
                />
              </g>
            </svg>
            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-16 border-b-slate-800 invisible"></div>
          </div>
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <NumberFlow
            className="text-[7rem] font-bold text-[oklch(0.375_0_0)] tracking-tighter leading-none tabular-nums"
            value={displayRotation * (NUMBER_OF_SEGMENTS / 360)}
            format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
