"use client";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Home, Search, Settings, Heart, User, Plus } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Home" },
  { icon: Search, label: "Search" },
  { icon: Heart, label: "Favorites" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" },
];

const radius = 140;
const petalSize = 64;
const halfPetal = petalSize / 2;

const glassStyle = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)",
  backdropFilter: "blur(16px) saturate(1.4)",
  WebkitBackdropFilter: "blur(16px) saturate(1.4)",
  boxShadow: [
    "0 4px 24px rgba(0,0,0,0.3)",
    "inset 0 1px 0 rgba(255,255,255,0.2)",
    "inset 0 -1px 0 rgba(255,255,255,0.05)",
  ].join(", "),
} as const;

const glassHoverShadow = [
  "0 8px 32px rgba(0,0,0,0.3)",
  "0 0 20px rgba(255,255,255,0.08)",
  "inset 0 1px 0 rgba(255,255,255,0.3)",
  "inset 0 -1px 0 rgba(255,255,255,0.08)",
].join(", ");

const glassRestShadow = glassStyle.boxShadow;

interface IFlowerMenuItem {
  icon: LucideIcon;
  label: string;
  y: number;
  x: number;
  index: number;
  isOpen: boolean;
}

function FlowerMenuItem(props: IFlowerMenuItem) {
  const { icon: Icon, label, y, x, index, isOpen } = props;

  return (
    <motion.button
      className="w-16 h-16 rounded-full absolute top-1/2 left-1/2 flex items-center justify-center cursor-pointer border border-white/15"
      initial={{
        x: -halfPetal,
        y: -halfPetal,
        opacity: 1,
      }}
      animate={{
        x: isOpen ? x - halfPetal : -halfPetal,
        y: isOpen ? y - halfPetal : -halfPetal,
        opacity: isOpen ? 1 : 0,
      }}
      whileHover={{ scale: 1.2 }}
      onHoverStart={(e) => {
        (e.target as HTMLElement).style.boxShadow = glassHoverShadow;
      }}
      onHoverEnd={(e) => {
        (e.target as HTMLElement).style.boxShadow = glassRestShadow;
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
        delay: index * 0.05,
      }}
      style={glassStyle}
      aria-label={label}
    >
      <Icon size={24} color="rgba(255,255,255,0.8)" strokeWidth={1.8} />
      <motion.span
        className="absolute -bottom-7 text-xs font-medium text-white/50 whitespace-nowrap pointer-events-none"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ delay: isOpen ? 1.2 : 0, duration: isOpen ? 0.3 : 0 }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #1a1a3e 0%, #0e0e10 50%), radial-gradient(ellipse at 70% 80%, #1e1030 0%, #0e0e10 60%)",
      }}
    >
      <motion.div
        className="w-96 h-96 flex items-center justify-center relative"
        animate={{
          rotate: isOpen ? 360 : 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {menuItems.map((item, index) => {
          const startAngle = -Math.PI / 2;
          const angle =
            startAngle + (index / menuItems.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <FlowerMenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              y={y}
              x={x}
              index={index}
              isOpen={isOpen}
            />
          );
        })}

        <motion.button
          type="button"
          className="w-14 h-14 rounded-full relative z-10 flex items-center justify-center cursor-pointer border border-white/15"
          style={glassStyle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Plus size={28} color="rgba(255,255,255,0.8)" strokeWidth={2} />
        </motion.button>
      </motion.div>
    </div>
  );
}
