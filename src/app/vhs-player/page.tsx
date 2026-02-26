"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import fragmentShader from "../../shaders/vhs/fragment.glsl";
import vertexShader from "../../shaders/vhs/vertex.glsl";
import { shaderMaterial, useVideoTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, Vector2 } from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    cardMaterial: any;
  }
}

const EFFECT_PRESETS = {
  "VHS Static": {
    noiseIntensity: 0.35,
    distortionIntensity: 0.04,
    displacementSpeed: 0.0,
    tapeNoiseIntensity: 0.0,
  },
  Glitch: {
    noiseIntensity: 0.08,
    distortionIntensity: 0.22,
    displacementSpeed: 0.2,
    tapeNoiseIntensity: 0.0,
  },
  "Tape Noise": {
    noiseIntensity: 0.0,
    distortionIntensity: 0.0,
    displacementSpeed: 0.0,
    tapeNoiseIntensity: 1.8,
  },
  "Full VHS": {
    noiseIntensity: 0.25,
    distortionIntensity: 0.1,
    displacementSpeed: 0.12,
    tapeNoiseIntensity: 1.2,
  },
  Clean: {
    noiseIntensity: 0.0,
    distortionIntensity: 0.0,
    displacementSpeed: 0.0,
    tapeNoiseIntensity: 0.0,
  },
} as const;

type PresetName = keyof typeof EFFECT_PRESETS;

const CardMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: null,
    uPlaneSize: new Vector2(0, 0),
    uImageRes: new Vector2(0, 0),
    uNoiseIntensity: 0,
    uDistortionIntensity: 0,
    uSizeProgress: 0,
    uDisplacementSpeed: 0,
    uTapeNoiseIntensity: 0,
  },
  vertexShader,
  fragmentShader,
);

extend({ CardMaterial });

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface ExperienceProps {
  distortionActive: boolean;
  preset: PresetName;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

function Experience({ distortionActive, preset, videoRef }: ExperienceProps) {
  const { width, height } = useThree((state) => state.viewport);
  const materialRef = useRef<any>(null);

  const textureVideo = useVideoTexture("/media/videos/8bitdo.mp4", {
    muted: false,
  });

  const videoEl = textureVideo.source.data as HTMLVideoElement;
  useEffect(() => {
    videoRef.current = videoEl;
  }, [videoEl, videoRef]);

  const videoHeight = videoEl.videoHeight;
  const videoWidth = videoEl.videoWidth;

  textureVideo.wrapS = RepeatWrapping;
  textureVideo.wrapT = RepeatWrapping;
  textureVideo.colorSpace = SRGBColorSpace;

  const currentUniforms = useRef({
    noiseIntensity: 0,
    distortionIntensity: 0,
    displacementSpeed: 0,
    tapeNoiseIntensity: 0,
  });

  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

    const target = distortionActive
      ? EFFECT_PRESETS[preset]
      : { noiseIntensity: 0, distortionIntensity: 0, displacementSpeed: 0, tapeNoiseIntensity: 0 };
    const lerpFactor = 0.08;
    const cu = currentUniforms.current;

    cu.noiseIntensity = lerp(cu.noiseIntensity, target.noiseIntensity, lerpFactor);
    cu.distortionIntensity = lerp(cu.distortionIntensity, target.distortionIntensity, lerpFactor);
    cu.displacementSpeed = lerp(cu.displacementSpeed, target.displacementSpeed, lerpFactor);
    cu.tapeNoiseIntensity = lerp(cu.tapeNoiseIntensity, target.tapeNoiseIntensity, lerpFactor);

    materialRef.current.uniforms.uNoiseIntensity.value = cu.noiseIntensity;
    materialRef.current.uniforms.uDistortionIntensity.value = cu.distortionIntensity;
    materialRef.current.uniforms.uDisplacementSpeed.value = cu.displacementSpeed;
    materialRef.current.uniforms.uTapeNoiseIntensity.value = cu.tapeNoiseIntensity;
  });

  return (
    <mesh>
      <planeGeometry args={[width, height, 64, 64]} />
      <cardMaterial
        ref={materialRef}
        uTexture={textureVideo}
        uPlaneSize={new Vector2(width, height)}
        uImageRes={new Vector2(videoWidth, videoHeight)}
        uNoiseIntensity={0}
        uDistortionIntensity={0}
        uSizeProgress={0}
        uDisplacementSpeed={0}
        uTapeNoiseIntensity={0}
      />
    </mesh>
  );
}

function useStaticNoise(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 4000;
    filter.Q.value = 0.5;
    filter.connect(gain);

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    source.start();

    ctxRef.current = ctx;
    gainRef.current = gain;

    return () => {
      source.stop();
      ctx.close();
    };
  }, []);

  useEffect(() => {
    const gain = gainRef.current;
    const ctx = ctxRef.current;
    if (!gain || !ctx) return;

    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(active ? 0.12 : 0, now + 0.15);
  }, [active]);
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPlayingRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [preset, setPreset] = useState<PresetName>("Full VHS");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const rewindRaf = useRef<number | null>(null);
  const timeUpdateRaf = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const distortionActive = isSeeking || isRewinding || isForwarding;

  useStaticNoise(distortionActive);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const update = () => {
      const v = videoRef.current;
      if (v) {
        setCurrentTime(v.currentTime);
        if (v.duration && v.duration !== duration) {
          setDuration(v.duration);
        }
      }
      timeUpdateRaf.current = requestAnimationFrame(update);
    };
    timeUpdateRaf.current = requestAnimationFrame(update);
    return () => {
      if (timeUpdateRaf.current) cancelAnimationFrame(timeUpdateRaf.current);
    };
  }, [duration]);

  const handleSeekStart = useCallback(() => setIsSeeking(true), []);
  const handleSeekEnd = useCallback(() => setIsSeeking(false), []);
  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const togglePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const startRewind = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setIsRewinding(true);
    const step = () => {
      if (v.currentTime > 0.1) v.currentTime -= 0.1;
      rewindRaf.current = requestAnimationFrame(step);
    };
    rewindRaf.current = requestAnimationFrame(step);
  }, []);

  const stopRewind = useCallback(() => {
    setIsRewinding(false);
    if (rewindRaf.current) {
      cancelAnimationFrame(rewindRaf.current);
      rewindRaf.current = null;
    }
    const v = videoRef.current;
    if (v && isPlayingRef.current) v.play();
  }, []);

  const startForward = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setIsForwarding(true);
    v.playbackRate = 3;
  }, []);

  const stopForward = useCallback(() => {
    setIsForwarding(false);
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 1;
  }, []);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_8px_60px_-12px_rgba(0,0,0,0.3)]" style={{ aspectRatio: "16 / 9" }}>
        {/* Video canvas — fills entire widget */}
        <Canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <Experience
            distortionActive={distortionActive}
            preset={preset}
            videoRef={videoRef}
          />
        </Canvas>

        {/* Controls overlay — sits on top of video */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 px-4 pb-3.5 pt-10 bg-gradient-to-t from-black/50 to-transparent z-10">
          {/* Scrubber row */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-white/60 tabular-nums select-none w-9 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.01}
              value={currentTime}
              onPointerDown={handleSeekStart}
              onPointerUp={handleSeekEnd}
              onChange={handleSeekChange}
              className="flex-1 h-1 appearance-none bg-white/20 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
            />
            <span className="font-mono text-[11px] text-white/60 tabular-nums select-none w-9">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons + dropdown row */}
          <div className="flex items-center">
            <div className="flex-1" />

            {/* Transport controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onPointerDown={startRewind}
                onPointerUp={stopRewind}
                onPointerLeave={stopRewind}
                className="text-white/60 hover:text-white transition-colors select-none p-1.5 active:scale-90"
                aria-label="Rewind"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 16.07V7.93a.5.5 0 00-.78-.42l-5.87 4.07a.5.5 0 000 .84l5.87 4.07a.5.5 0 00.78-.42zM22 16.07V7.93a.5.5 0 00-.78-.42l-5.87 4.07a.5.5 0 000 .84l5.87 4.07a.5.5 0 00.78-.42z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                className="text-white bg-white/15 hover:bg-white/25 transition-colors rounded-full w-9 h-9 flex items-center justify-center select-none active:scale-90"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.5 4.23a1 1 0 011.5-.87l12 7a1 1 0 010 1.74l-12 7a1 1 0 01-1.5-.87V4.23z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onPointerDown={startForward}
                onPointerUp={stopForward}
                onPointerLeave={stopForward}
                className="text-white/60 hover:text-white transition-colors select-none p-1.5 active:scale-90"
                aria-label="Fast forward"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 16.07V7.93a.5.5 0 01.78-.42l5.87 4.07a.5.5 0 010 .84l-5.87 4.07a.5.5 0 01-.78-.42zM2 16.07V7.93a.5.5 0 01.78-.42l5.87 4.07a.5.5 0 010 .84L2.78 16.49A.5.5 0 012 16.07z" />
                </svg>
              </button>
            </div>

            {/* Spacer + dropdown */}
            <div className="flex-1 flex justify-end">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-white/60 hover:text-white/90 transition-colors px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 select-none backdrop-blur-sm"
                >
                  {preset}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-1.5 w-36 rounded-lg bg-neutral-800/90 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden z-10">
                    {(Object.keys(EFFECT_PRESETS) as PresetName[]).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setPreset(name);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left text-[11px] font-mono px-3 py-1.5 transition-colors select-none
                          ${preset === name ? "text-white bg-white/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
