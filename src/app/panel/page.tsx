"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
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
    name: "Raji Oladeji",
    email: "oladejiraji@gmail.com",
    image: PanelImage1,
  },
  {
    id: 2,
    name: "Kurosawa",
    email: "akirakurosa@gmail.com",
    image: PanelImage2,
  },
  {
    id: 3,
    name: "Miles Keown",
    email: "keownoffender@gmail.com",
    image: PanelImage3,
  },
  {
    id: 4,
    name: "Previous Leon",
    email: "previousleon@gmail.com",
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
        <div className="flex items-center justify-between mb-4 w-[326px]">
          <h2 className="text-sm font-medium text-[#3D3D3D]">Notifications</h2>
          <button
            className="text-sm text-[#3D3D3D] opacity-40  cursor-pointer transition-colors"
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            {isCollapsed ? "Show more" : "Show less"}
          </button>
        </div>
        <motion.div
          className="relative w-[326px]"
          onClick={() => {
            if (isCollapsed) setIsCollapsed(false);
          }}
          style={{ cursor: isCollapsed ? "pointer" : "default" }}
          animate={{
            height: isCollapsed
              ? 54 + (notifications.length - 1) * 6
              : notifications.length * 54 + (notifications.length - 1) * 8,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <AnimatePresence>
            {notifications.map((not, i) => (
              <motion.div
                key={not.id}
                className="absolute left-0 top-0 flex items-center gap-2 group/card "
                animate={{
                  y: isCollapsed ? i * 6 : i * (54 + 8),
                  scale: isCollapsed ? 1 - i * 0.03 : 1,
                  zIndex: notifications.length - i,
                  opacity: isCollapsed && i > 0 ? 0.6 : 1,
                  x: 0,
                }}
                exit={{
                  x: -300,
                  opacity: 0,
                  transition: { duration: 0.3, ease: "easeIn" },
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <div
                  className="rounded-[12px] w-[326px] bg-[#F8F9FA]"
                  style={{
                    boxShadow: "0px 4px 16px 0px #D3D3D314",
                  }}
                >
                  <div className="flex items-center gap-4 px-4 py-2">
                    <Image
                      src={not.image}
                      alt={not.name}
                      className="size-7 rounded-full shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#5D646E] leading-tight">
                        {not.name}
                      </h3>
                      <p className="text-[13px] text-[#5D646E] opacity-50 truncate">
                        {not.email}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  className="shrink-0 rounded-[4px] flex items-center justify-center cursor-pointer bg-[#F8F9FA] overflow-hidden opacity-0 group-hover/card:opacity-100 transition-opacity"
                  style={{
                    boxShadow: "0px 0px 0px 1px #B4B5B64F",
                  }}
                  initial="idle"
                  whileHover="hovered"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCollapsed) {
                      removeAll();
                    } else {
                      removeOne(not.id);
                    }
                  }}
                >
                  <div className="flex items-center h-5">
                    {isCollapsed ? (
                      <>
                        <motion.span
                          className="text-[10px] text-neutral-400 whitespace-nowrap"
                          variants={{
                            idle: { width: 0, opacity: 0 },
                            hovered: { width: "auto", opacity: 1 },
                          }}
                          transition={{ duration: 0.15 }}
                        >
                          <span className="px-1.5">Clear all</span>
                        </motion.span>
                        <motion.div
                          className="shrink-0 flex items-center justify-center"
                          variants={{
                            idle: { width: 20, opacity: 1 },
                            hovered: { width: 0, opacity: 0 },
                          }}
                          transition={{ duration: 0.15 }}
                        >
                          <X className="size-3.5 text-neutral-400" />
                        </motion.div>
                      </>
                    ) : (
                      <div className="size-5 flex items-center justify-center shrink-0">
                        <X className="size-3.5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
};

export default Panel;
