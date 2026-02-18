import { Info } from "lucide-react";
import React from "react";

const AnchorLearn = () => {
  return (
    <main className="w-screen h-screen flex justify-center items-center bg-[#f4f4f4]">
      <div>
        <div className="relative">
          <button
            className="cursor-pointer learn-trigger"
            id="trigger"
            popoverTarget="content"
          >
            <Info />
          </button>

          <div id="content" popover="auto" className="learn-content">
            hello
          </div>
        </div>
      </div>
    </main>
  );
};

export default AnchorLearn;
