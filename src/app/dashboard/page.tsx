import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import Table from "@/components/dashboard/table";
import {
  AnalyzeIcon,
  ExportIcon,
  FilterIcon,
  ThreeDotsIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { ArrowDown, ChevronDown } from "lucide-react";
import React from "react";

const subLinks = [
  {
    id: 1,
    title: "Dev.Agents",
    active: true,
  },
  {
    id: 2,
    title: "UI Agents",
    active: false,
  },
  {
    id: 3,
    title: "WebGL Agents",
    active: false,
  },
];

const Dashboard = () => {
  return (
    <main className="w-screen flex min-h-screen bg-[#F9F9FB] pt-2">
      <Sidebar />
      <div className="bg-white w-full h-screen py-3 px-12 rounded-tl-[12px]">
        <Header />

        <h1 className="text-[#151515] font-medium text-2xl mt-8 py-4">
          Overview
        </h1>

        <div className="border-b border-[#E4E9EC] flex justify-between">
          <div className="flex">
            {subLinks.map((nv, i) => (
              <div
                className={cn("mr-4 pb-2 ", {
                  "border-b-2  border-black": nv.active,
                })}
                key={i}
              >
                <span className="text-base text-[#151515] font-medium py-2">
                  {nv.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex bg-[#F6F6F8] mb-2 rounded-[6px] items-center gap-2">
            <button className="flex items-center gap-1 bg-[#F1F1F3] rounded-[6px] px-4 h-9.5">
              <AnalyzeIcon />
              <span className="text-base font-medium text-[#151515B2]">
                Analyze
              </span>
            </button>
            <button className="flex items-center justify-center gap-1 bg-[#F1F1F3] rounded-[6px] size-9.5">
              <ThreeDotsIcon />
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-[#151515]">Net Save</p>
            <ChevronDown className="size-4 text-[#737373B2] font-bold" />
          </div>
          <h3 className="pt-4 pb-3 text-[#151515] font-medium text-2xl">
            $24,019.20
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-[#151515B2]">
              98% vs 12,309.12 last period
            </span>
            <div className="size-1 rounded-full bg-[#737373B2]" />
            <span className="text-xs font-medium text-[#151515B2] underline">
              COMPARE DIFFERENT TIME PERIODS
            </span>
          </div>
        </div>

        <div className="mt-12">
          <div className="pb-4 flex items-center justify-end gap-2 ">
            <button
              className="text-[#151515B2] text-base font-medium size-9.5 flex items-center justify-center bg-[#F6F6F8] rounded-[6px]"
              style={{ boxShadow: "0px 0px 0px 1px #E3E3E340" }}
            >
              <FilterIcon />
            </button>
            <button
              className="text-[#151515B2] text-base font-medium h-9 px-4.5 bg-[#F6F6F8] rounded-[6px]"
              style={{ boxShadow: "0px 0px 0px 1px #DADFE2" }}
            >
              Add Agent
            </button>

            <button
              className="text-white flex items-center gap-1 bg-[#437DFB] text-base font-medium h-9 px-4.5  rounded-[6px]"
              style={{ boxShadow: "0px 0px 0px 1px #E3E3E340" }}
            >
              <ExportIcon />
              <span>Export</span>
            </button>
          </div>

          <Table />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
