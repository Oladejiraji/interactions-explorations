"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, X } from "lucide-react";
import Image from "next/image";
import {
  PanelImage1,
  PanelImage2,
  PanelImage3,
  PanelImage4,
} from "@/lib/assets";

const initialNotifications = [
  {
    id: 1,
    name: "Sarah Chen",
    message: "Pushed 3 commits to main",
    time: "2m ago",
    image: PanelImage1,
  },
  {
    id: 2,
    name: "Alex Rivera",
    message: "Commented on your PR ",
    time: "15m ago",
    image: PanelImage2,
  },
  {
    id: 3,
    name: "Jordan Lee",
    message: "Requested a review ",
    time: "1h ago",
    image: PanelImage3,
  },
  {
    id: 4,
    name: "Maya Patel",
    message: "Merged branch ",
    time: "3h ago",
    image: PanelImage4,
  },
];

const Panel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const removeOne = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const removeAll = () => {
    setNotifications([]);
  };
  return (
    <main className="w-screen h-screen flex items-center justify-center bg-white font-sans">
      <div>
        <div className="flex items-center justify-between mb-4 w-76">
          <h2 className="text-sm font-medium text-[#3D3D3D]">Notifications</h2>
          <button
            className="flex items-center gap-1 text-sm text-[#3D3D3D] opacity-40 cursor-pointer transition-colors"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            {isCollapsed ? "Show more" : "Show less"}
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ChevronUp className="size-4" />
            </motion.div>
          </button>
        </div>
        <motion.div
          className="relative"
          onClick={() => {
            if (isCollapsed) setIsCollapsed(false);
          }}
          style={{ cursor: isCollapsed ? "pointer" : "default" }}
          animate={{
            height: isCollapsed
              ? 56 + (notifications.length - 1) * 12
              : notifications.length * 56 + (notifications.length - 1) * 12,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <AnimatePresence mode="popLayout">
            {notifications.map((not, i) => (
              <motion.div
                key={not.id}
                className="rounded-xl w-76 bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] group/tile"
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  left: 0,
                  top: 0,
                }}
                animate={{
                  y: isCollapsed ? i * 8 : i * (56 + 12),
                  scale: isCollapsed ? 1 - i * 0.05 : 1,
                  zIndex: notifications.length - i,
                  opacity: 1,
                }}
                exit={{
                  x: 300,
                  opacity: 0,
                  transition: { duration: 0.3, ease: "easeIn" },
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <div className="flex items-center gap-3 px-3 py-2.5 relative">
                  <motion.button
                    className="absolute top-0 left-0 -translate-x-[30%] -translate-y-[40%] rounded-full p-1 invisible group-hover/tile:visible cursor-pointer bg-white"
                    style={{
                      boxShadow: "0px 0px 0px 1px #DBD1D140",
                    }}
                    whileHover="hovered"
                    initial="idle"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCollapsed) {
                        removeAll();
                      } else {
                        removeOne(not.id);
                      }
                    }}
                  >
                    <div className="flex items-center overflow-hidden">
                      {isCollapsed ? (
                        <>
                          <motion.span
                            className="text-[10px] whitespace-nowrap"
                            variants={{
                              idle: { width: 0, opacity: 0 },
                              hovered: { width: 42, opacity: 0.6 },
                            }}
                            transition={{ duration: 0.15 }}
                          >
                            Clear All
                          </motion.span>
                          <motion.div
                            className="shrink-0"
                            variants={{
                              idle: { width: 12, opacity: 0.6 },
                              hovered: { width: 0, opacity: 0 },
                            }}
                            transition={{ duration: 0.15 }}
                          >
                            <X className="size-3" />
                          </motion.div>
                        </>
                      ) : (
                        <X className="size-3 opacity-60" />
                      )}
                    </div>
                  </motion.button>
                  <Image
                    src={not.image}
                    alt={not.name}
                    className="rounded-md size-9 shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 leading-tight">
                      {not.name}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate">
                      {not.message}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0">
                    {not.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
};

export default Panel;
