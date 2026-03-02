"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import fragmentShader from "../../shaders/vhs/fragment.glsl";
import vertexShader from "../../shaders/vhs/vertex.glsl";
import { shaderMaterial, useVideoTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, Vector2 } from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    mobileMaterial: any;
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

const MobileMaterial = shaderMaterial(
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

extend({ MobileMaterial });

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
      : {
          noiseIntensity: 0,
          distortionIntensity: 0,
          displacementSpeed: 0,
          tapeNoiseIntensity: 0,
        };
    const lerpFactor = 0.08;
    const cu = currentUniforms.current;

    cu.noiseIntensity = lerp(
      cu.noiseIntensity,
      target.noiseIntensity,
      lerpFactor,
    );
    cu.distortionIntensity = lerp(
      cu.distortionIntensity,
      target.distortionIntensity,
      lerpFactor,
    );
    cu.displacementSpeed = lerp(
      cu.displacementSpeed,
      target.displacementSpeed,
      lerpFactor,
    );
    cu.tapeNoiseIntensity = lerp(
      cu.tapeNoiseIntensity,
      target.tapeNoiseIntensity,
      lerpFactor,
    );

    materialRef.current.uniforms.uNoiseIntensity.value = cu.noiseIntensity;
    materialRef.current.uniforms.uDistortionIntensity.value =
      cu.distortionIntensity;
    materialRef.current.uniforms.uDisplacementSpeed.value =
      cu.displacementSpeed;
    materialRef.current.uniforms.uTapeNoiseIntensity.value =
      cu.tapeNoiseIntensity;
  });

  return (
    <mesh>
      <planeGeometry args={[width, height, 64, 64]} />
      <mobileMaterial
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
  const [presetDrawerOpen, setPresetDrawerOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSupportsFullscreen(
      typeof document.documentElement.requestFullscreen === "function",
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () =>
      document.removeEventListener("fullscreenchange", handler);
  }, []);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewindRaf = useRef<number | null>(null);
  const timeUpdateRaf = useRef<number | null>(null);

  const distortionActive = isSeeking || isRewinding || isForwarding;

  useStaticNoise(distortionActive);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Auto-hide controls after 3s of inactivity while playing
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlayingRef.current) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    } else {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying]);

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
  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number.parseFloat(e.target.value);
      if (videoRef.current) videoRef.current.currentTime = time;
      setCurrentTime(time);
    },
    [],
  );

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

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black select-none"
    >
      {/* Viewport meta for fullscreen mobile */}
      <style>{`
        html, body { overflow: hidden; }
      `}</style>

      {/* Full-screen video canvas */}
      <Canvas
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Experience
          distortionActive={distortionActive}
          preset={preset}
          videoRef={videoRef}
        />
      </Canvas>

      {/* Controls overlay — tap anywhere to show/hide */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={resetHideTimer}
      >
        {/* Top bar: preset selector */}
        <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,12px)+8px)] pb-2 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
          <span className="font-mono text-[11px] text-white/50 tracking-wider uppercase">
            VHS Player
          </span>
          <div className="flex items-center gap-2">
            {supportsFullscreen && (
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                  resetHideTimer();
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 active:bg-white/20 backdrop-blur-sm text-white/60 active:text-white transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 00-2 2v3m18-5h-3a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPresetDrawerOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-white/60 active:text-white transition-colors px-2.5 py-1.5 rounded-lg bg-white/10 active:bg-white/20 backdrop-blur-sm"
            >
              {preset}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: large play/pause tap target */}
        <div className="flex items-center justify-center flex-1">
          <button
            type="button"
            onClick={() => {
              togglePlayPause();
              resetHideTimer();
            }}
            className={`pointer-events-auto w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 active:scale-90 transition-all ${
              controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6.5 4.23a1 1 0 011.5-.87l12 7a1 1 0 010 1.74l-12 7a1 1 0 01-1.5-.87V4.23z" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="px-4 pb-[env(safe-area-inset-bottom,12px)] pt-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">
          {/* Progress bar */}
          <div className="relative h-6 flex items-center mb-2">
            {/* Track background */}
            <div className="absolute inset-x-0 h-[3px] bg-white/20 rounded-full" />
            {/* Filled track */}
            <div
              className="absolute left-0 h-[3px] bg-white/70 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
            {/* Range input (invisible, full-width touch target) */}
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.01}
              value={currentTime}
              onPointerDown={(e) => {
                handleSeekStart();
                resetHideTimer();
              }}
              onPointerUp={handleSeekEnd}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Thumb indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md pointer-events-none transition-transform"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>

          {/* Time + transport row */}
          <div className="flex items-center gap-2 py-2">
            <span className="font-mono text-[11px] text-white/50 tabular-nums w-24">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Transport: rewind */}
            <button
              type="button"
              onPointerDown={() => {
                startRewind();
                resetHideTimer();
              }}
              onPointerUp={stopRewind}
              onPointerLeave={stopRewind}
              onPointerCancel={stopRewind}
              className="text-white/60 active:text-white transition-colors p-2.5 active:scale-90"
              aria-label="Rewind"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 16.07V7.93a.5.5 0 00-.78-.42l-5.87 4.07a.5.5 0 000 .84l5.87 4.07a.5.5 0 00.78-.42zM22 16.07V7.93a.5.5 0 00-.78-.42l-5.87 4.07a.5.5 0 000 .84l5.87 4.07a.5.5 0 00.78-.42z" />
              </svg>
            </button>

            {/* Transport: play/pause (small, secondary) */}
            <button
              type="button"
              onClick={() => {
                togglePlayPause();
                resetHideTimer();
              }}
              className="text-white bg-white/15 active:bg-white/25 transition-colors rounded-full w-10 h-10 flex items-center justify-center active:scale-90"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6.5 4.23a1 1 0 011.5-.87l12 7a1 1 0 010 1.74l-12 7a1 1 0 01-1.5-.87V4.23z" />
                </svg>
              )}
            </button>

            {/* Transport: fast-forward */}
            <button
              type="button"
              onPointerDown={() => {
                startForward();
                resetHideTimer();
              }}
              onPointerUp={stopForward}
              onPointerLeave={stopForward}
              onPointerCancel={stopForward}
              className="text-white/60 active:text-white transition-colors p-2.5 active:scale-90"
              aria-label="Fast forward"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13 16.07V7.93a.5.5 0 01.78-.42l5.87 4.07a.5.5 0 010 .84l-5.87 4.07a.5.5 0 01-.78-.42zM2 16.07V7.93a.5.5 0 01.78-.42l5.87 4.07a.5.5 0 010 .84L2.78 16.49A.5.5 0 012 16.07z" />
              </svg>
            </button>

            <div className="flex-1" />
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Preset drawer (bottom sheet) */}
      {presetDrawerOpen && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPresetDrawerOpen(false)}
            onKeyDown={() => {}}
          />
          {/* Sheet */}
          <div className="relative bg-neutral-900/95 backdrop-blur-xl rounded-t-2xl border-t border-white/10 pb-[env(safe-area-inset-bottom,12px)]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 rounded-full bg-white/20" />
            </div>
            <div className="px-4 pb-2">
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                Effect Preset
              </span>
            </div>
            <div className="flex flex-col">
              {(Object.keys(EFFECT_PRESETS) as PresetName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setPreset(name);
                    setPresetDrawerOpen(false);
                  }}
                  className={`w-full text-left font-mono px-4 py-3 transition-colors active:bg-white/10
                    ${preset === name ? "text-white bg-white/5" : "text-white/50"}`}
                >
                  <span className="text-sm">{name}</span>
                  {preset === name && (
                    <svg
                      className="inline ml-2"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
