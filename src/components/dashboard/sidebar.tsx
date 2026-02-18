import React from "react";
import { BanderasLogo, DashboardPlusIcon, HouseIcon } from "../icons";
import { cn } from "@/lib/utils";

export const navData = [
  {
    id: 1,
    icon: <HouseIcon />,
    title: "Dashboard",
    active: true,
  },
  {
    id: 2,
    icon: <HouseIcon />,
    title: "Transactions",
    active: false,
  },
  {
    id: 1,
    icon: <HouseIcon />,
    title: "Inbox",
    active: false,
  },
];

const Sidebar = () => {
  return (
    <div className="min-w-60 px-4  py-3">
      <div className="flex items-center py-2 gap-1 mb-12">
        <BanderasLogo />
        <h3>Banderas, Inc</h3>
      </div>

      <button className="h-9.5 px-2.5 flex items-center w-full bg-[#F1F1F3] rounded-[12px] gap-3">
        <DashboardPlusIcon />
        <span className="text-[#151515B2] font-medium text-base">
          Create Workspace
        </span>
      </button>

      <nav className="mt-4">
        {navData.map((nv, i) => {
          return (
            <div
              key={i}
              className={cn("p-2.5 flex rounded-[12px] items-center gap-3", {
                "bg-[#F1F1F3]": nv.active,
              })}
            >
              {nv.icon}
              <span className="text-[#15151580]">{nv.title}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
