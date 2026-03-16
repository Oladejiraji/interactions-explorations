"use client";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Home, Search, Settings, Heart, User, Plus } from "lucide-react";

const menuItems = [
  { color: "#FF6B6B", icon: Home, label: "Home" },
  { color: "#4ECDC4", icon: Search, label: "Search" },
  { color: "#45B7D1", icon: Heart, label: "Favorites" },
  { color: "#BB8FCE", icon: User, label: "Profile" },
  { color: "#F8B500", icon: Settings, label: "Settings" },
];

const radius = 140;
const petalSize = 64;
const halfPetal = petalSize / 2;

interface IFlowerMenuItem {
  color: string;
  icon: LucideIcon;
  label: string;
  y: number;
  x: number;
  index: number;
  isOpen: boolean;
}

function FlowerMenuItem(props: IFlowerMenuItem) {
  const { color, icon: Icon, label, y, x, index, isOpen } = props;

  return (
    <motion.button
      className="w-16 h-16 rounded-full absolute top-1/2 left-1/2 flex items-center justify-center cursor-pointer"
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
        (e.target as HTMLElement).style.boxShadow = `0 0 24px ${color}88`;
      }}
      onHoverEnd={(e) => {
        (e.target as HTMLElement).style.boxShadow = `0 4px 16px ${color}44`;
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
        delay: index * 0.05,
      }}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 4px 16px ${color}44`,
      }}
      aria-label={label}
    >
      <Icon size={24} color="white" strokeWidth={2} />
      <motion.span
        className="absolute -bottom-7 text-xs font-medium text-white/70 whitespace-nowrap pointer-events-none"
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
    <div className="w-full h-screen flex items-center justify-center bg-[#0e0e10]">
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
              color={item.color}
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
          className="w-14 h-14 rounded-full relative z-10 flex items-center justify-center cursor-pointer border-none"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, #ff4757, #ff6b81)"
              : "linear-gradient(135deg, #667eea, #764ba2)",
            boxShadow: isOpen
              ? "0 0 30px #ff475744, 0 4px 20px rgba(0,0,0,0.3)"
              : "0 0 30px #667eea44, 0 4px 20px rgba(0,0,0,0.3)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Plus size={28} color="white" strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </div>
  );
}
