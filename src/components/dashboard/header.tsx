import React from "react";
import { DoubleArrowsIcon, SearchIcon } from "@/components/icons";
import { Avatar } from "@/lib/assets";
import Image from "next/image";

const Header = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div
          className="bg-[#F4F4F6] rounded-lg w-91.25 h-9.5 flex items-center p-2.5 gap-2"
          style={{ boxShadow: "0px 0px 0px 1px #A7A7A740" }}
        >
          <SearchIcon />
          <input
            type="text"
            className="placeholder:text-[#151515B2]"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-full border border-dashed border-[#D8DDE0] h-9.5 text-base font-medium text-[#151515B2] bg-[#F6F6F8] px-4.5">
          Get Help
        </button>

        <button className="flex items-center gap-1 px-3">
          <div>
            <Image
              src={Avatar}
              alt="avatar"
              width={33}
              height={41}
              className="rounded-full"
            />
          </div>
          <span className="text-base font-medium text-[#737373]">
            Kurosawa Udi
          </span>
          <div className="p-2">
            <DoubleArrowsIcon />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Header;
