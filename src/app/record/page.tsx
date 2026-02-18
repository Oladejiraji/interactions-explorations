"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

const BAR_COUNT = 30;
const FFT_SIZE = 64;

type RecordingState = "idle" | "recording" | "paused";

function formatTime(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  const time = [m, s].map((v) => String(v).padStart(2, "0")).join(":");
  return `${time}.${String(cs).padStart(2, "0")}`;
}

const Record = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(
    new Array(BAR_COUNT).fill(0),
  );
  const [micLabel, setMicLabel] = useState("Default Microphone");

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  const visualize = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const half = Math.ceil(BAR_COUNT / 2);
      const step = Math.floor(dataArray.length / half);
      const rightHalf: number[] = [];
      for (let i = 0; i < half; i++) {
        const value = dataArray[i * step] ?? 0;
        rightHalf.push((value / 255) * 80);
      }
      const leftHalf = [...rightHalf].reverse();
      setBarHeights([...leftHalf, ...rightHalf]);
    };
    draw();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get mic label
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack?.label) {
        setMicLabel(audioTrack.label);
      }

      // Set up audio context and analyser
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Start timer
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 10);
      }, 10);

      setRecordingState("recording");
      visualize();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, [visualize]);

  const stopRecording = useCallback(() => {
    cleanupAudio();
    setRecordingState("idle");
    setBarHeights(new Array(BAR_COUNT).fill(0));
    setElapsed(0);
  }, [cleanupAudio]);

  const handleToggle = useCallback(() => {
    if (recordingState === "idle") {
      startRecording();
    } else {
      stopRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  const statusColor =
    recordingState === "recording" ? "bg-[#FF3B30]" : "bg-[#9CA3AF]";
  const statusText =
    recordingState === "recording" ? "Recording" : "Ready to record";

  return (
    <main className="w-screen h-screen flex justify-center items-center bg-[#1A2C31]">
      <div className="w-105">
        <h1 className="font-medium text-lg pb-5 text-white">Voice Memo</h1>
        <div className="bg-white rounded-[28px] p-8">
          <div className="flex gap-2 items-center mb-10">
            <div
              className={`size-2 rounded-full ${statusColor} ${recordingState === "recording" ? "animate-pulse" : ""}`}
            />
            <AnimatePresence mode="wait">
              <motion.h3
                key={statusText}
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                transition={{ duration: 0.25 }}
                className="uppercase text-[#6B7280] font-semibold text-xs"
              >
                {statusText}
              </motion.h3>
            </AnimatePresence>
          </div>

          <div>
            <h1 className="text-center font-semibold text-[4rem] tabular-nums">
              {formatTime(elapsed)}
            </h1>
          </div>

          <div className="my-7.5 relative h-25 flex items-center justify-center">
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              animate={{
                scale: recordingState === "recording" ? 0.92 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div
                className={`absolute top-0 left-0 rounded-tl-sm border-t-2 border-l-2 size-4 transition-colors duration-300 ${recordingState === "recording" ? "border-[#C9D83A]" : "border-black"}`}
              />
              <div
                className={`absolute top-0 right-0 rounded-tr-sm border-t-2 border-r-2 size-4 transition-colors duration-300 ${recordingState === "recording" ? "border-[#C9D83A]" : "border-black"}`}
              />
              <div
                className={`absolute bottom-0 left-0 rounded-bl-sm border-b-2 border-l-2 size-4 transition-colors duration-300 ${recordingState === "recording" ? "border-[#C9D83A]" : "border-black"}`}
              />
              <div
                className={`absolute bottom-0 right-0 rounded-br-sm border-b-2 border-r-2 size-4 transition-colors duration-300 ${recordingState === "recording" ? "border-[#C9D83A]" : "border-black"}`}
              />
            </motion.div>
            <div className="flex gap-1 items-center justify-center h-20">
              {barHeights.map((height, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-black transition-all duration-75"
                  style={{
                    height: `${Math.max(4, height)}px`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-[#F3F4F6] pt-6 mt-7.5 flex justify-between items-center">
            <div className="text-xs">
              <p className="text-[#666666] pb-1">Microphone Input</p>
              <p className="text-black font-semibold">{micLabel}</p>
            </div>
            <div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{
                  scale: 1.05,
                  //   boxShadow: "0 0 20px rgba(232, 242, 76, 0.5)",
                }}
                onClick={handleToggle}
                animate={{
                  backgroundColor:
                    recordingState === "recording" ? "#C9D83A" : "#000",
                }}
                className="rounded-full flex items-center justify-center cursor-pointer size-16"
              >
                <motion.div
                  className="bg-white"
                  animate={{
                    width: recordingState === "recording" ? 20 : 24,
                    height: recordingState === "recording" ? 20 : 24,
                    borderRadius: recordingState === "recording" ? 4 : 12,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Record;
