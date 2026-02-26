"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const PHOSPHOR = "#00ff41";
const PHOSPHOR_DIM = "rgba(0,255,65,0.6)";
const PHOSPHOR_FAINT = "rgba(0,255,65,0.15)";
const PHOSPHOR_GLOW =
  "0 0 10px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.2)";
const BG_DARK = "#0a0a0a";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
interface Stat {
  label: string;
  abbr: string;
  value: number;
  maxValue: number;
}

const STATS: Stat[] = [
  { label: "Strength", abbr: "S", value: 6, maxValue: 10 },
  { label: "Perception", abbr: "P", value: 8, maxValue: 10 },
  { label: "Endurance", abbr: "E", value: 4, maxValue: 10 },
  { label: "Charisma", abbr: "C", value: 7, maxValue: 10 },
  { label: "Intelligence", abbr: "I", value: 9, maxValue: 10 },
  { label: "Agility", abbr: "A", value: 5, maxValue: 10 },
  { label: "Luck", abbr: "L", value: 3, maxValue: 10 },
];

interface InventoryItem {
  name: string;
  quantity: number;
  weight: number;
  description: string;
}

interface InventoryCategory {
  label: string;
  items: InventoryItem[];
}

const INVENTORY: InventoryCategory[] = [
  {
    label: "Weapons",
    items: [
      {
        name: "10mm Pistol",
        quantity: 1,
        weight: 3.5,
        description: "A common semi-automatic pistol.",
      },
      {
        name: "Laser Rifle",
        quantity: 1,
        weight: 6.2,
        description: "Directed energy weapon. Uses fusion cells.",
      },
      {
        name: "Combat Knife",
        quantity: 2,
        weight: 1.0,
        description: "A standard-issue military blade.",
      },
    ],
  },
  {
    label: "Apparel",
    items: [
      {
        name: "Vault 111 Jumpsuit",
        quantity: 1,
        weight: 1.0,
        description: "Standard issue Vault-Tec jumpsuit.",
      },
      {
        name: "Leather Armor",
        quantity: 1,
        weight: 7.5,
        description: "Basic protection from the wasteland.",
      },
    ],
  },
  {
    label: "Aid",
    items: [
      {
        name: "Stimpak",
        quantity: 5,
        weight: 0.5,
        description: "Heals injuries. A wasteland essential.",
      },
      {
        name: "RadAway",
        quantity: 3,
        weight: 0.5,
        description: "Flushes radiation from the body.",
      },
      {
        name: "Nuka-Cola",
        quantity: 8,
        weight: 1.0,
        description: "The taste of the old world.",
      },
    ],
  },
  {
    label: "Misc",
    items: [
      {
        name: "Bottle Caps",
        quantity: 247,
        weight: 0,
        description: "Post-war currency.",
      },
      {
        name: "Bobby Pin",
        quantity: 12,
        weight: 0,
        description: "Used for lockpicking.",
      },
      {
        name: "Desk Fan",
        quantity: 1,
        weight: 3.0,
        description: "Contains useful scrap components.",
      },
    ],
  },
];

type Tab = "STAT" | "INV";
type SoundType = "click" | "select" | "hover" | "static";

// ---------------------------------------------------------------------------
// Sound engine
// ---------------------------------------------------------------------------
function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      const ctx = getCtx();

      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }

      if (type === "select") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }

      if (type === "hover") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.015);
      }

      if (type === "static") {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.08;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    },
    [getCtx],
  );

  return play;
}

// ---------------------------------------------------------------------------
// CRT Overlay
// ---------------------------------------------------------------------------
function CrtOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.7)",
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Noise Overlay (canvas-based static during tab transitions)
// ---------------------------------------------------------------------------
function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 200;
    canvas.height = 200;
    const imageData = ctx.createImageData(200, 200);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() > 0.5 ? 255 : 0;
      imageData.data[i] = 0;
      imageData.data[i + 1] = Math.floor(v * 0.3);
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 100;
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ---------------------------------------------------------------------------
// Stat → body part mapping
// ---------------------------------------------------------------------------
const STAT_BODY_MAP: Record<string, string[]> = {
  S: ["leftArm", "rightArm"],
  P: ["head"],
  E: ["torso"],
  C: ["head"],
  I: ["head"],
  A: ["leftLeg", "rightLeg"],
  L: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
};

type BodyPart = "head" | "torso" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";

// ---------------------------------------------------------------------------
// Vault Boy Silhouette
// ---------------------------------------------------------------------------
function VaultBoy({
  hoveredStat,
  stats,
}: {
  hoveredStat: string | null;
  stats: Stat[];
}) {
  const activeParts = hoveredStat ? STAT_BODY_MAP[hoveredStat] ?? [] : [];

  const getPartStyle = (part: BodyPart): React.CSSProperties => {
    const isActive = activeParts.includes(part);
    // Find the stat value that maps to this part for base brightness
    const relevantStats = stats.filter((s) =>
      (STAT_BODY_MAP[s.abbr] ?? []).includes(part),
    );
    const avgValue =
      relevantStats.length > 0
        ? relevantStats.reduce((sum, s) => sum + s.value, 0) /
          relevantStats.length
        : 5;
    const baseOpacity = 0.25 + (avgValue / 10) * 0.35;

    return {
      fill: PHOSPHOR,
      opacity: isActive ? 1 : baseOpacity,
      filter: isActive ? `drop-shadow(0 0 8px ${PHOSPHOR}) drop-shadow(0 0 16px ${PHOSPHOR})` : "none",
      transition: "opacity 0.2s ease, filter 0.2s ease",
    };
  };

  // Outline-only style for the stroke-based look
  const getStrokeStyle = (part: BodyPart): React.CSSProperties => {
    const base = getPartStyle(part);
    return {
      fill: "none",
      stroke: PHOSPHOR,
      strokeWidth: 2.5,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      opacity: base.opacity,
      filter: base.filter,
      transition: base.transition,
    };
  };

  const getFillStyle = (part: BodyPart): React.CSSProperties => ({
    ...getPartStyle(part),
    opacity: (getPartStyle(part).opacity as number) * 0.15,
  });

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      style={{ maxHeight: "280px" }}
    >
      {/* ---- HEAD ---- */}
      {/* Head fill */}
      <circle cx="100" cy="38" r="22" style={getFillStyle("head")} />
      {/* Head outline */}
      <circle cx="100" cy="38" r="22" style={getStrokeStyle("head")} />
      {/* Hair — simple swooped tuft */}
      <path
        d="M 82 22 Q 86 8 100 10 Q 114 8 118 22"
        style={getStrokeStyle("head")}
      />
      {/* Left eye — open dot */}
      <circle cx="91" cy="35" r="2" style={{ fill: PHOSPHOR, opacity: getPartStyle("head").opacity, transition: "opacity 0.2s ease" }} />
      {/* Right eye — open dot */}
      <circle cx="109" cy="35" r="2" style={{ fill: PHOSPHOR, opacity: getPartStyle("head").opacity, transition: "opacity 0.2s ease" }} />
      {/* Big wide grin */}
      <path
        d="M 88 45 Q 94 54 100 54 Q 106 54 112 45"
        style={getStrokeStyle("head")}
      />

      {/* ---- NECK ---- */}
      <line x1="100" y1="60" x2="100" y2="70" style={getStrokeStyle("torso")} />

      {/* ---- TORSO ---- */}
      {/* Torso fill */}
      <path
        d="M 80 70 L 80 125 L 120 125 L 120 70 Z"
        style={getFillStyle("torso")}
      />
      {/* Torso outline */}
      <path
        d="M 80 70 L 80 125 L 120 125 L 120 70 Z"
        style={getStrokeStyle("torso")}
      />

      {/* ---- LEFT ARM (spread wide) ---- */}
      {/* Arm fill */}
      <path
        d="M 80 72 L 30 78 L 14 80 L 8 84 L 10 90 L 16 88 L 30 86 L 80 82 Z"
        style={getFillStyle("leftArm")}
      />
      {/* Upper arm */}
      <line x1="80" y1="75" x2="40" y2="80" style={getStrokeStyle("leftArm")} />
      {/* Forearm */}
      <line x1="40" y1="80" x2="14" y2="84" style={getStrokeStyle("leftArm")} />
      {/* Hand — open, spread fingers */}
      <line x1="14" y1="84" x2="6" y2="82" style={getStrokeStyle("leftArm")} />
      <line x1="6" y1="82" x2="2" y2="78" style={{ ...getStrokeStyle("leftArm"), strokeWidth: 2 }} />
      <line x1="6" y1="82" x2="1" y2="82" style={{ ...getStrokeStyle("leftArm"), strokeWidth: 2 }} />
      <line x1="6" y1="82" x2="2" y2="86" style={{ ...getStrokeStyle("leftArm"), strokeWidth: 2 }} />
      <line x1="6" y1="82" x2="4" y2="90" style={{ ...getStrokeStyle("leftArm"), strokeWidth: 2 }} />

      {/* ---- RIGHT ARM (spread wide) ---- */}
      {/* Arm fill */}
      <path
        d="M 120 72 L 170 78 L 186 80 L 192 84 L 190 90 L 184 88 L 170 86 L 120 82 Z"
        style={getFillStyle("rightArm")}
      />
      {/* Upper arm */}
      <line x1="120" y1="75" x2="160" y2="80" style={getStrokeStyle("rightArm")} />
      {/* Forearm */}
      <line x1="160" y1="80" x2="186" y2="84" style={getStrokeStyle("rightArm")} />
      {/* Hand — open, spread fingers */}
      <line x1="186" y1="84" x2="194" y2="82" style={getStrokeStyle("rightArm")} />
      <line x1="194" y1="82" x2="198" y2="78" style={{ ...getStrokeStyle("rightArm"), strokeWidth: 2 }} />
      <line x1="194" y1="82" x2="199" y2="82" style={{ ...getStrokeStyle("rightArm"), strokeWidth: 2 }} />
      <line x1="194" y1="82" x2="198" y2="86" style={{ ...getStrokeStyle("rightArm"), strokeWidth: 2 }} />
      <line x1="194" y1="82" x2="196" y2="90" style={{ ...getStrokeStyle("rightArm"), strokeWidth: 2 }} />

      {/* ---- LEFT LEG (wide stance) ---- */}
      {/* Leg fill */}
      <path
        d="M 85 125 L 65 170 L 55 192 L 50 196 L 62 200 L 78 200 L 75 192 L 95 125 Z"
        style={getFillStyle("leftLeg")}
      />
      {/* Thigh */}
      <line x1="90" y1="125" x2="72" y2="160" style={getStrokeStyle("leftLeg")} />
      {/* Shin */}
      <line x1="72" y1="160" x2="62" y2="190" style={getStrokeStyle("leftLeg")} />
      {/* Boot */}
      <path
        d="M 62 190 L 58 196 L 50 198 L 50 200 L 78 200 L 78 196 L 66 194"
        style={getStrokeStyle("leftLeg")}
      />

      {/* ---- RIGHT LEG (wide stance) ---- */}
      {/* Leg fill */}
      <path
        d="M 115 125 L 135 170 L 145 192 L 150 196 L 138 200 L 122 200 L 125 192 L 105 125 Z"
        style={getFillStyle("rightLeg")}
      />
      {/* Thigh */}
      <line x1="110" y1="125" x2="128" y2="160" style={getStrokeStyle("rightLeg")} />
      {/* Shin */}
      <line x1="128" y1="160" x2="138" y2="190" style={getStrokeStyle("rightLeg")} />
      {/* Boot */}
      <path
        d="M 138 190 L 142 196 L 150 198 L 150 200 L 122 200 L 122 196 L 134 194"
        style={getStrokeStyle("rightLeg")}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stat Bar
// ---------------------------------------------------------------------------
function StatBar({
  stat,
  index,
  playSound,
  onHover,
}: {
  stat: Stat;
  index: number;
  playSound: (type: SoundType) => void;
  onHover: (abbr: string | null) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 py-1.5 px-2 cursor-default"
      onMouseEnter={() => {
        playSound("hover");
        onHover(stat.abbr);
      }}
      onMouseLeave={() => onHover(null)}
      style={{ color: PHOSPHOR }}
    >
      <span
        className="w-6 text-center font-bold text-lg"
        style={{ textShadow: PHOSPHOR_GLOW }}
      >
        {stat.abbr}
      </span>
      <span className="w-28 text-sm" style={{ color: PHOSPHOR_DIM }}>
        {stat.label}
      </span>
      <div
        className="flex-1 h-4 relative"
        style={{
          border: `1px solid ${PHOSPHOR_DIM}`,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: PHOSPHOR, boxShadow: `0 0 8px ${PHOSPHOR}` }}
          initial={{ width: 0 }}
          animate={{ width: `${(stat.value / stat.maxValue) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
        />
        {/* Tick marks */}
        {Array.from({ length: stat.maxValue - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${((i + 1) / stat.maxValue) * 100}%`,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />
        ))}
      </div>
      <span
        className="w-6 text-right text-sm tabular-nums"
        style={{ textShadow: PHOSPHOR_GLOW }}
      >
        {stat.value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Tab
// ---------------------------------------------------------------------------
function StatTab({ playSound }: { playSound: (type: SoundType) => void }) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  return (
    <div className="p-4">
      <h2
        className="text-sm mb-4 tracking-widest uppercase"
        style={{ color: PHOSPHOR_DIM }}
      >
        S.P.E.C.I.A.L. Attributes
      </h2>
      <div className="flex gap-4">
        {/* Vault Boy silhouette */}
        <div className="hidden sm:flex w-36 shrink-0 items-center justify-center">
          <VaultBoy hoveredStat={hoveredStat} stats={STATS} />
        </div>
        {/* Stat bars */}
        <div className="flex flex-col flex-1">
          {STATS.map((stat, i) => (
            <StatBar
              key={stat.abbr}
              stat={stat}
              index={i}
              playSound={playSound}
              onHover={setHoveredStat}
            />
          ))}
        </div>
      </div>
      {/* Character summary */}
      <div
        className="mt-6 pt-4 text-xs flex gap-6"
        style={{ borderTop: `1px solid ${PHOSPHOR_FAINT}`, color: PHOSPHOR_DIM }}
      >
        <span>
          Total:{" "}
          <span style={{ color: PHOSPHOR }}>
            {STATS.reduce((sum, s) => sum + s.value, 0)}
          </span>
        </span>
        <span>
          Average:{" "}
          <span style={{ color: PHOSPHOR }}>
            {(STATS.reduce((sum, s) => sum + s.value, 0) / STATS.length).toFixed(1)}
          </span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inventory Tab
// ---------------------------------------------------------------------------
function InvTab({ playSound }: { playSound: (type: SoundType) => void }) {
  const [activeCat, setActiveCat] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  const category = INVENTORY[activeCat];
  const item = category.items[selectedItem];

  const handleCatChange = (i: number) => {
    if (i === activeCat) return;
    playSound("click");
    setActiveCat(i);
    setSelectedItem(0);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Category tabs */}
      <div
        className="flex gap-1 mb-4 pb-2"
        style={{ borderBottom: `1px solid ${PHOSPHOR_FAINT}` }}
      >
        {INVENTORY.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => handleCatChange(i)}
            onMouseEnter={() => playSound("hover")}
            className="px-3 py-1 text-xs uppercase tracking-wider cursor-pointer transition-colors"
            style={{
              color: i === activeCat ? BG_DARK : PHOSPHOR_DIM,
              backgroundColor: i === activeCat ? PHOSPHOR : "transparent",
              border: `1px solid ${i === activeCat ? PHOSPHOR : PHOSPHOR_FAINT}`,
              textShadow: i === activeCat ? "none" : undefined,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item list + detail */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* List */}
        <div className="w-1/2 flex flex-col gap-0.5 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCat}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {category.items.map((itm, i) => (
                <button
                  key={itm.name}
                  type="button"
                  onClick={() => {
                    playSound("select");
                    setSelectedItem(i);
                  }}
                  onMouseEnter={() => playSound("hover")}
                  className="w-full text-left px-2 py-1.5 text-sm flex justify-between items-center cursor-pointer transition-colors"
                  style={{
                    color: i === selectedItem ? BG_DARK : PHOSPHOR,
                    backgroundColor:
                      i === selectedItem ? PHOSPHOR : "transparent",
                    textShadow:
                      i === selectedItem ? "none" : `0 0 6px ${PHOSPHOR_FAINT}`,
                  }}
                >
                  <span>{itm.name}</span>
                  <span
                    className="text-xs tabular-nums"
                    style={{
                      color:
                        i === selectedItem ? "rgba(0,0,0,0.6)" : PHOSPHOR_DIM,
                    }}
                  >
                    x{itm.quantity}
                  </span>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Detail panel */}
        <div
          className="w-1/2 p-3 text-xs"
          style={{
            border: `1px solid ${PHOSPHOR_FAINT}`,
            backgroundColor: "rgba(0,255,65,0.03)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCat}-${selectedItem}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <h3
                className="text-sm font-bold mb-2"
                style={{ color: PHOSPHOR, textShadow: PHOSPHOR_GLOW }}
              >
                {item.name}
              </h3>
              <p className="mb-3 leading-relaxed" style={{ color: PHOSPHOR_DIM }}>
                {item.description}
              </p>
              <div
                className="flex flex-col gap-1"
                style={{ color: PHOSPHOR_DIM }}
              >
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span style={{ color: PHOSPHOR }}>{item.weight.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span style={{ color: PHOSPHOR }}>{item.quantity}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function PipBoyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("STAT");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const playSound = useSounds();

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab || isTransitioning) return;
    playSound("static");
    playSound("click");
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const tabs: Tab[] = ["STAT", "INV"];

  return (
    <>
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: keyframes for CRT flicker
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes crt-flicker {
              0% { opacity: 1; }
              5% { opacity: 0.97; }
              10% { opacity: 1; }
              15% { opacity: 0.985; }
              20% { opacity: 1; }
              100% { opacity: 1; }
            }
          `,
        }}
      />
      <main
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#050505", fontFamily: "monospace" }}
      >
        {/* Pip-Boy bezel */}
        <div
          className="w-full max-w-2xl"
          style={{
            border: `2px solid rgba(0,255,65,0.3)`,
            borderRadius: "24px",
            backgroundColor: BG_DARK,
            boxShadow: `0 0 60px rgba(0,255,65,0.08), inset 0 0 60px rgba(0,0,0,0.5)`,
            animation: "crt-flicker 4s infinite",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: `1px solid ${PHOSPHOR_FAINT}` }}
          >
            <span
              className="text-xs tracking-[0.3em] uppercase"
              style={{ color: PHOSPHOR_DIM }}
            >
              Vault-Tec
            </span>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  onMouseEnter={() => playSound("hover")}
                  className="px-4 py-1.5 text-xs uppercase tracking-widest cursor-pointer transition-colors"
                  style={{
                    color: activeTab === tab ? BG_DARK : PHOSPHOR,
                    backgroundColor:
                      activeTab === tab ? PHOSPHOR : "transparent",
                    border: `1px solid ${activeTab === tab ? PHOSPHOR : PHOSPHOR_FAINT}`,
                    textShadow:
                      activeTab === tab ? "none" : `0 0 8px ${PHOSPHOR}`,
                    borderRadius: "2px",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span
              className="text-xs tabular-nums"
              style={{ color: PHOSPHOR_DIM }}
            >
              PIP-BOY 3000
            </span>
          </div>

          {/* Screen content */}
          <div
            className="relative overflow-hidden"
            style={{
              minHeight: "420px",
              borderRadius: "0 0 22px 22px",
              boxShadow: "inset 0 0 80px rgba(0,0,0,0.4)",
            }}
          >
            <CrtOverlay />

            {/* Noise overlay during transitions */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.05 }}
                  className="absolute inset-0 z-20"
                >
                  <NoiseOverlay />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "STAT" ? (
                <motion.div
                  key="stat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <StatTab playSound={playSound} />
                </motion.div>
              ) : (
                <motion.div
                  key="inv"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <InvTab playSound={playSound} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer status bar */}
          <div
            className="flex items-center justify-between px-5 py-2.5 text-xs tabular-nums"
            style={{
              borderTop: `1px solid ${PHOSPHOR_FAINT}`,
              color: PHOSPHOR_DIM,
            }}
          >
            <span>
              HP{" "}
              <span style={{ color: PHOSPHOR, textShadow: PHOSPHOR_GLOW }}>
                85
              </span>
              /100
            </span>
            <span>
              LVL{" "}
              <span style={{ color: PHOSPHOR, textShadow: PHOSPHOR_GLOW }}>
                12
              </span>
            </span>
            <span>
              CAPS{" "}
              <span style={{ color: PHOSPHOR, textShadow: PHOSPHOR_GLOW }}>
                247
              </span>
            </span>
            <span>
              RADS{" "}
              <span style={{ color: PHOSPHOR, textShadow: PHOSPHOR_GLOW }}>
                15
              </span>
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
