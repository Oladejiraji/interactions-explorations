"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from "motion/react";

const DRAG_OPEN_THRESHOLD = 60;
const ACTIONS_WIDTH = 172;
const FAVORITES_WIDTH = 120;

interface Token {
  id: number;
  symbol: string;
  logo: string;
  price: string;
  change: string;
  changePct: string;
  volume: string;
  marketCap: string;
  marketCapChange: string | null;
  volatility: string | null;
}

const tokens: Token[] = [
  {
    id: 1,
    symbol: "Aave",
    logo: "/tokens/aave.svg",
    price: "$100.80",
    change: "$20.03",
    changePct: "+5.92%",
    volume: "11.20B",
    marketCap: "$94.3B",
    marketCapChange: "+12.20%",
    volatility: "5.01%",
  },
  {
    id: 2,
    symbol: "USDC",
    logo: "/tokens/usdc.svg",
    price: "$0.99",
    change: "$0.03",
    changePct: "+5.92%",
    volume: "121.20B",
    marketCap: "$283T",
    marketCapChange: "+12.20%",
    volatility: "0.01%",
  },
  {
    id: 3,
    symbol: "Chain",
    logo: "/tokens/chain.svg",
    price: "$10.80",
    change: "-$0.34",
    changePct: "-3.21%",
    volume: "11.20B",
    marketCap: "$94.3B",
    marketCapChange: null,
    volatility: null,
  },
];

const columns = [
  { label: "Symbol", width: 180, align: "left" as const, headerOffset: 0 },
  { label: "Price", width: 100, align: "left" as const, headerOffset: 0 },
  { label: "Change(%)", width: 150, align: "right" as const, flex: 1.3 },
  { label: "Volume", width: 110, align: "right" as const, flex: 1 },
  {
    label: "MarketCap",
    width: 120,
    align: "right" as const,
    flex: 1.3,
    marginLeft: 48,
  },
  { label: "Vol. Score", width: 120, align: "right" as const, flex: 1.2 },
];

const SPRING = { type: "spring" as const, duration: 0.3, bounce: 0 };

const STAR_PATH =
  "M10.92 2.868a1.25 1.25 0 0 1 2.16 0l2.795 4.798 5.428 1.176a1.25 1.25 0 0 1 .667 2.054l-3.7 4.141.56 5.525a1.25 1.25 0 0 1-1.748 1.27L12 19.592l-5.082 2.24a1.25 1.25 0 0 1-1.748-1.27l.56-5.525-3.7-4.14a1.25 1.25 0 0 1 .667-2.055l5.428-1.176z";

const STAR_OUTLINE_PATH =
  "M12 4.987 9.687 8.959a1.25 1.25 0 0 1-.816.592l-4.492.973 3.062 3.427c.234.262.347.61.312.959l-.463 4.573 4.206-1.854a1.25 1.25 0 0 1 1.008 0l4.206 1.854-.463-4.573a1.25 1.25 0 0 1 .311-.959l3.063-3.427-4.492-.973a1.25 1.25 0 0 1-.816-.592z";

function StarButton({
  onToggle,
  favourited,
}: {
  onToggle: () => void;
  favourited: boolean;
}) {
  const starScale = useMotionValue(1);
  const [particles, setParticles] = useState<
    {
      id: number;
      angle: number;
      distance: number;
      size: number;
      color: string;
    }[]
  >([]);
  const prevFavourited = useRef(!favourited);

  useEffect(() => {
    const wasFavourited = prevFavourited.current;
    prevFavourited.current = favourited;

    if (favourited && !wasFavourited) {
      // Favourite: scale up + particles
      animate(starScale, 1.2, {
        type: "spring",
        duration: 0.15,
        bounce: 0,
      }).then(() =>
        animate(starScale, 1, { type: "spring", duration: 0.2, bounce: 0 }),
      );
      const colors = ["#FFD700", "#FFA500", "#FFE066", "#FFF4B8", "#FF6B35"];
      const newParticles = Array.from({ length: 14 }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / 14) * i + Math.random() * 15 - 7.5,
        distance: 22 + Math.random() * 18,
        size: 3.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 700);
    }
  }, [favourited, starScale]);

  return (
    <motion.button
      initial={{
        opacity: 0,
        scale: 0.25,
        filter: "blur(4px)",
        rotate: 0,
      }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }}
      exit={{
        opacity: 0,
        scale: 0.25,
        filter: "blur(4px)",
        rotate: 360,
        transition: { type: "spring", duration: 0.3, bounce: 0 },
      }}
      transition={SPRING}
      whileTap={{ scale: 0.96 }}
      onClick={onToggle}
      className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0"
    >
      <AnimatePresence>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 1.2, x: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [1.2, 0.8, 0],
                x: Math.cos(rad) * p.distance,
                y: Math.sin(rad) * p.distance,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
              }}
            />
          );
        })}
      </AnimatePresence>
      <motion.div
        className="relative flex size-5 items-center justify-center"
        style={{ scale: starScale }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="overflow-visible"
        >
          <path
            d={STAR_PATH}
            fill={favourited ? "#FFD700" : "rgba(255,255,255,0.15)"}
          />
          {!favourited && (
            <path
              d={STAR_OUTLINE_PATH}
              fill="rgba(255,255,255,0.65)"
            />
          )}
        </svg>
      </motion.div>
    </motion.button>
  );
}

const ACTION_BUTTON_WIDTH = ACTIONS_WIDTH / 3;

function ActionButton({
  src,
  label,
  bg,
  labelColor = "#fff",
  dragX,
  index,
}: {
  src: string;
  label: string;
  bg: string;
  labelColor?: string;
  dragX: MotionValue<number>;
  index: number;
}) {
  const finalX = index * ACTION_BUTTON_WIDTH;
  // Stack peek: each card peeks out a few px behind the one in front.
  // As drag increases, they fan out to their final positions.
  const peekOffset = index * 6;
  const buttonX = useTransform(dragX, [0, ACTIONS_WIDTH], [peekOffset, finalX]);

  return (
    <motion.div
      className="absolute inset-y-0 left-0"
      style={{
        x: buttonX,
        width: ACTION_BUTTON_WIDTH,
        zIndex: index,
      }}
    >
      <button
        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-0.5 border-none p-0"
        style={{ background: bg }}
      >
        <img src={src} width={28} height={28} className="block" alt={label} />
        <span
          className="whitespace-nowrap text-[10px] font-semibold tracking-wide"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      </button>
    </motion.div>
  );
}

function TokenIcon({ token }: { token: Token }) {
  return (
    <img
      src={token.logo}
      width={28}
      height={28}
      alt={token.symbol}
      className="block shrink-0 rounded-full outline-1 -outline-offset-1 outline-white/10"
    />
  );
}

interface TokenRowHandle {
  reset: () => void;
}

const TokenRow = forwardRef<
  TokenRowHandle,
  {
    token: Token;
    isLocked: boolean;
    isMobile: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
  }
>(function TokenRow(
  { token, isLocked, isMobile, onDragStart, onDragEnd },
  ref,
) {
  const x = useMotionValue(0);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      setIsFavOpen(false);
    },
  }));

  function handleDragEnd() {
    const current = x.get();
    if (current > DRAG_OPEN_THRESHOLD) {
      animate(x, ACTIONS_WIDTH, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      setIsFavOpen(false);
    } else if (current < -DRAG_OPEN_THRESHOLD) {
      setIsFavOpen(true);
      setIsFavourited((prev) => !prev);
      animate(x, -FAVORITES_WIDTH * 0.65, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.075,
      }).then(() => {
        setIsFavOpen(false);
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      setIsFavOpen(false);
    }
    onDragEnd();
  }

  const isNegative = token.changePct.startsWith("-");

  return (
    <div className="relative w-full" style={{ overflow: "clip" }}>
      {/* Favourites panel on right */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
        style={{ width: FAVORITES_WIDTH }}
      >
        <AnimatePresence initial={false}>
          {isFavOpen && (
            <StarButton
              key="star"
              onToggle={() => {}}
              favourited={isFavourited}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Actions revealed underneath */}
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: ACTIONS_WIDTH }}
      >
        <ActionButton
          src="/tokens/news.svg"
          label="News"
          bg="#A581FA"
          dragX={x}
          index={0}
        />
        <ActionButton
          src="/tokens/robinhood.svg"
          label="Trade"
          bg="#CCFF00"
          labelColor="#0B0B0B"
          dragX={x}
          index={1}
        />
        <ActionButton
          src="/tokens/notifications.svg"
          label="Alerts"
          bg="#151515"
          dragX={x}
          index={2}
        />
      </div>

      {/* Draggable row */}
      <motion.div
        drag={isLocked ? false : "x"}
        dragConstraints={{ left: -FAVORITES_WIDTH, right: ACTIONS_WIDTH }}
        dragElastic={{ left: 0.1, right: 0.1 }}
        className="relative z-10 flex h-14 w-full select-none items-center bg-black p-4 font-semibold will-change-transform"
        style={{
          x,
          cursor: isLocked ? "default" : "grab",
        }}
        whileDrag={{ cursor: "grabbing" }}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Symbol + Price */}
        <div className="flex min-w-0 flex-2 items-center">
          <div className="flex flex-1 items-center gap-3">
            <TokenIcon token={token} />
            <span className="text-[15px] font-medium text-white">
              {token.symbol}
            </span>
          </div>
          <div className="flex flex-1 items-center justify-start pl-3.5 text-sm tabular-nums text-neutral-300">
            {token.price}
          </div>
        </div>

        {/* Change */}
        <div
          className="flex min-w-0 items-center justify-end gap-2"
          style={{ flex: 1.3 }}
        >
          <span className="text-sm tabular-nums text-neutral-300">
            {token.change}
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
              isNegative
                ? "bg-red-400/10 text-red-400"
                : "bg-green-400/12 text-green-400"
            }`}
          >
            {token.changePct}
          </span>
        </div>

        {/* Volume */}
        {!isMobile && (
          <div className="flex min-w-0 flex-1 items-center justify-end text-sm tabular-nums text-neutral-300">
            {token.volume}
          </div>
        )}

        {/* MarketCap */}
        {!isMobile && (
          <div
            className="flex min-w-0 items-center justify-end gap-2 pl-12"
            style={{ flex: 1.3 }}
          >
            <span className="text-sm tabular-nums text-neutral-300">
              {token.marketCap}
            </span>
            {token.marketCapChange && (
              <span className="rounded-md bg-green-400/12 px-1.5 py-0.5 text-xs tabular-nums text-green-400">
                {token.marketCapChange}
              </span>
            )}
          </div>
        )}

        {/* Volatility */}
        {!isMobile && (
          <div
            className="flex min-w-0 items-center justify-end text-sm tabular-nums text-neutral-300"
            style={{ flex: 1.2 }}
          >
            {token.volatility ?? "—"}
          </div>
        )}
      </motion.div>
    </div>
  );
});

export default function DragToInteractPage() {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, TokenRowHandle | null>>({});

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        Object.values(rowRefs.current).forEach((ref) => ref?.reset());
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white antialiased">
      <div className="w-[680px] select-none py-1.5">
        {/* Header */}
        <div
          className="mb-2 flex h-12 w-full items-center rounded-t-2xl px-4"
          style={{
            background: "rgba(18,18,18,0.5)",
            boxShadow: "0 0 0 1px rgba(38,38,38,0.5)",
          }}
        >
          {/* Symbol + Price group */}
          <div className="flex flex-2 items-center">
            {columns.slice(0, 2).map((col, i) => (
              <div
                key={col.label}
                className="flex h-6.5 flex-1 items-center justify-start px-1 text-sm font-medium text-white/40"
                style={{ paddingLeft: i === 1 ? 14 : 0 }}
              >
                {col.label}
              </div>
            ))}
          </div>
          {/* Remaining columns */}
          {columns
            .slice(2)
            .filter((_, i) => !isMobile || i === 0)
            .map((col) => (
              <div
                key={col.label}
                className="flex h-6.5 items-center justify-end text-sm font-medium text-white/40"
                style={{
                  flex: col.flex,
                  marginLeft: col.marginLeft ?? 0,
                }}
              >
                {col.label}
              </div>
            ))}
        </div>

        {/* Rows */}
        <div ref={containerRef} className="flex flex-col gap-2">
          {tokens.map((token) => (
            <TokenRow
              key={token.id}
              ref={(el) => {
                rowRefs.current[token.id] = el;
              }}
              token={token}
              isMobile={isMobile}
              isLocked={draggingId !== null && draggingId !== token.id}
              onDragStart={() => {
                setDraggingId(token.id);
                Object.entries(rowRefs.current).forEach(([id, ref]) => {
                  if (Number(id) !== token.id) ref?.reset();
                });
              }}
              onDragEnd={() => setDraggingId(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
