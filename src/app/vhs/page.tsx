"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import fragmentShader from "../../shaders/vhs/fragment.glsl";
import vertexShader from "../../shaders/vhs/vertex.glsl";
import { shaderMaterial, useVideoTexture } from "@react-three/drei";
import { RepeatWrapping, SRGBColorSpace, Vector2 } from "three";
import { useControls } from "leva";

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

export const CardMaterial = shaderMaterial(
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

  // Expose the video element to the parent via the shared ref
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

// White noise generator for cassette static sound
function useStaticNoise(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    // Add a bandpass filter to shape the noise like cassette hiss
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 4000;
    filter.Q.value = 0.5;
    filter.connect(gain);

    // Create 2 seconds of white noise buffer
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
    sourceRef.current = source;

    return () => {
      source.stop();
      ctx.close();
    };
  }, []);

  useEffect(() => {
    const gain = gainRef.current;
    const ctx = ctxRef.current;
    if (!gain || !ctx) return;

    // Resume context on user interaction (browser autoplay policy)
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(active ? 0.12 : 0, now + 0.15);
  }, [active]);
}

export default function Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPlayingRef = useRef(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const rewindRaf = useRef<number | null>(null);
  const timeUpdateRaf = useRef<number | null>(null);

  const { preset } = useControls({
    preset: {
      value: "Full VHS" as PresetName,
      options: Object.keys(EFFECT_PRESETS) as PresetName[],
    },
  });

  const distortionActive = isSeeking || isRewinding || isForwarding;

  useStaticNoise(distortionActive);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Poll video time with rAF — much more responsive than timeupdate events
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

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number.parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
      setCurrentTime(time);
    },
    [],
  );

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
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
      if (v.currentTime > 0.1) {
        v.currentTime -= 0.1;
      }
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
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Experience
          distortionActive={distortionActive}
          preset={preset as PresetName}
          videoRef={videoRef}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6 pb-8 bg-gradient-to-t from-black/70 to-transparent">
        {/* Time display */}
        <div className="font-mono text-sm text-white/80 tracking-widest select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Seekbar */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekEnd}
          onChange={handleSeekChange}
          className="w-full max-w-2xl h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer accent-white
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
        />

        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onPointerDown={startRewind}
            onPointerUp={stopRewind}
            onPointerLeave={stopRewind}
            className="text-white/80 hover:text-white transition-colors select-none font-mono text-lg px-4 py-2 active:scale-95"
          >
            ◀◀ REW
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="text-white bg-white/10 hover:bg-white/20 transition-colors rounded-full w-14 h-14 flex items-center justify-center select-none text-2xl active:scale-95"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            type="button"
            onPointerDown={startForward}
            onPointerUp={stopForward}
            onPointerLeave={stopForward}
            className="text-white/80 hover:text-white transition-colors select-none font-mono text-lg px-4 py-2 active:scale-95"
          >
            FF ▶▶
          </button>
        </div>
      </div>
    </div>
  );
}
