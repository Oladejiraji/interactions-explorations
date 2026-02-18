import { music1 } from "@/lib/assets";
import Image from "next/image";
import React from "react";

const songs = [
  {
    id: 1,
    title: "Song Title 1",
    artist: "Artist Name 1",
    album: "Album Name 1",
    duration: "3:45",
  },
  {
    id: 2,
    title: "Song Title 2",
    artist: "Artist Name 2",
    album: "Album Name 2",
    duration: "3:45",
  },
  {
    id: 3,
    title: "Song Title 3",
    artist: "Artist Name 3",
    album: "Album Name 3",
    duration: "3:45",
  },
  {
    id: 4,
    title: "Song Title 4",
    artist: "Artist Name 4",
    album: "Album Name 4",
    duration: "3:45",
  },
  {
    id: 5,
    title: "Song Title 5",
    artist: "Artist Name 5",
    album: "Album Name 5",
    duration: "3:45",
  },
  {
    id: 6,
    title: "Song Title 6",
    artist: "Artist Name 6",
    album: "Album Name 6",
    duration: "3:45",
  },
];

const Music = () => {
  return (
    <main className="w-screen h-screen flex justify-center items-center bg-[#030303]">
      <div className="flex items-center justify-center gap-[50px]">
        <div>
          <div className="w-[379px] h-[379px] relative">
            <Image src={music1} alt="Music" fill className="object-cover " />
          </div>
          <div className="mt-15">
            <p className="text-sm text-center text-white pb-1.5">
              ANALOG FREQUENCY
            </p>
            <p className="text-[#555555] text-center text-xs">
              Station 94.2 • Live Broadcast
            </p>
            <div className="my-6">
              <div className="bg-[#1a1a1a]">
                <div className="w-6/12 h-0.5 bg-white" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h1 className="pl-2.5 text-[#555555] text-[10px] mb-5">UP NEXT</h1>
          <div className="flex flex-col gap-2 w-[324px]">
            {songs.map((song, i) => {
              return (
                <div className="h-12">
                  <div className="flex items-center justify-between px-5">
                    <p className="text-[#888] font-semibold text-[11px]">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-xs text-[#666]">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Music;
