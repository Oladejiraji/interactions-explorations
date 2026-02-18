"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const links = [
  { name: "Projects", value: "projects" },
  { name: "Gallery", value: "gallery" },
  { name: "Studio", value: "studio" },
  { name: "Profile", value: "profile" },
];

const AnchorTabs = () => {
  const [activeTab, setActiveTab] = useState(links[0].value);
  return (
    <main className="w-screen h-screen flex justify-center items-center bg-black">
      <div>
        <div>
          <Image src="/tabs.png" alt="Anchor Tabs" width={400} height={400} />
        </div>

        <div className="mt-12 relative">
          <div className="flex relative items-center justify-center p-0.5 border border-gray-300 rounded-full nav-wrap">
            {links.map((link, i) => {
              return (
                <div className="tab-button" key={i}>
                  <button
                    className={cn(
                      "py-3 px-7 text-base font-medium text-white tab-trigger-btn relative z-4",
                      {
                        active: activeTab === link.value,
                      },
                    )}
                    id="tab-trigger"
                    onClick={() => setActiveTab(link.value)}
                  >
                    {link.name}
                  </button>
                </div>
              );
            })}
          </div>
          <div
            className="absolute bg-[red] rounded-full transition-all z-3"
            id="tab-popover"
          />
          <div
            className="absolute bg-[blue] rounded-full transition-all z-2"
            id="tab-popover-hover"
          />
        </div>
      </div>
    </main>
  );
};

export default AnchorTabs;
