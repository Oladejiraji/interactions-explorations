"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const IMG_WIDTH = 579;
const IMG_HEIGHT = 579;
const DRAW_DURATION_MS = 6000;
const TARGET_FPS = 60;
const STEP = 3;
const DARK_THRESHOLD = 128;

const IMAGES = [
  "/sketch1_prime.png",
  "/sketch2_prime.png",
  "/sketch3_prime.png",
];

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lw: number;
}

/** Normalise an angle difference to [-PI, PI] */
function angleDiff(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function generateSketchFromImage(imageData: ImageData): Seg[] {
  const { width, height, data } = imageData;
  const segments: Seg[] = [];

  // Pre-compute brightness map
  const brightness = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const off = i * 4;
    brightness[i] = (data[off] + data[off + 1] + data[off + 2]) / 3;
  }

  const darkAt = (x: number, y: number): boolean => {
    const ix = Math.round(x),
      iy = Math.round(y);
    if (ix < 0 || ix >= width || iy < 0 || iy >= height) return false;
    return brightness[iy * width + ix] < DARK_THRESHOLD;
  };

  const brightnessAt = (x: number, y: number): number => {
    const ix = Math.round(x),
      iy = Math.round(y);
    if (ix < 0 || ix >= width || iy < 0 || iy >= height) return 255;
    return brightness[iy * width + ix];
  };

  // Collect ALL dark pixel positions
  const darkPoints: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (brightness[y * width + x] < DARK_THRESHOLD) {
        darkPoints.push({ x, y });
      }
    }
  }

  // Shuffle for random stroke starting order
  for (let i = darkPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [darkPoints[i], darkPoints[j]] = [darkPoints[j], darkPoints[i]];
  }

  // Coverage tracking — per-pixel for accuracy
  const covered = new Uint8Array(width * height);

  const markCovered = (cx: number, cy: number, radius: number) => {
    const r = Math.ceil(radius);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = Math.round(cx) + dx;
        const py = Math.round(cy) + dy;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          covered[py * width + px] = 1;
        }
      }
    }
  };

  const isCovered = (cx: number, cy: number): boolean => {
    const ix = Math.round(cx),
      iy = Math.round(cy);
    if (ix < 0 || ix >= width || iy < 0 || iy >= height) return true;
    return covered[iy * width + ix] === 1;
  };

  let dpIdx = 0;

  for (let s = 0; s < 3000; s++) {
    // Find next uncovered dark pixel as stroke start
    while (
      dpIdx < darkPoints.length &&
      isCovered(darkPoints[dpIdx].x, darkPoints[dpIdx].y)
    ) {
      dpIdx++;
    }
    if (dpIdx >= darkPoints.length) break;

    let x = darkPoints[dpIdx].x;
    let y = darkPoints[dpIdx].y;
    dpIdx++; // always advance past this starting point
    let angle = Math.random() * Math.PI * 2;

    const maxSteps = 50 + Math.floor(Math.random() * 150);
    const baseLw = 5 + Math.random() * 4;
    let offInk = 0;

    // Always mark and draw the starting point
    markCovered(x, y, baseLw / 2);
    segments.push({ x1: x, y1: y, x2: x + 0.5, y2: y + 0.5, lw: baseLw });

    for (let i = 0; i < maxSteps; i++) {
      const t = i / maxSteps;
      const pressure = 0.4 + 0.6 * Math.sin(t * Math.PI);
      const lw = baseLw * pressure;
      const prevX = x,
        prevY = y;

      // Sample 12 directions — prefer dark, uncovered, forward-facing
      let bestAngle = angle;
      let bestScore = Infinity;

      for (let a = 0; a < 12; a++) {
        const ta = angle + ((a / 12) * Math.PI * 2 - Math.PI);
        const tx = x + Math.cos(ta) * STEP;
        const ty = y + Math.sin(ta) * STEP;
        if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;

        const bri = brightnessAt(tx, ty);
        const dirCost = Math.abs(angleDiff(angle, ta)) * 30;
        const covCost = isCovered(tx, ty) ? 150 : 0;
        const score = bri + dirCost + covCost;

        if (score < bestScore) {
          bestScore = score;
          bestAngle = ta;
        }
      }

      angle = bestAngle + (Math.random() - 0.5) * 0.1;
      x += Math.cos(angle) * STEP;
      y += Math.sin(angle) * STEP;
      x = Math.max(1, Math.min(width - 2, x));
      y = Math.max(1, Math.min(height - 2, y));

      if (darkAt(x, y)) {
        offInk = 0;
        markCovered(x, y, lw / 2);
        segments.push({ x1: prevX, y1: prevY, x2: x, y2: y, lw });
      } else {
        offInk++;
        if (offInk > 6) break;
      }
    }
  }

  return segments;
}

const Brush = () => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + IMAGES.length) % IMAGES.length);
  }, []);

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!imageCanvas || !overlayCanvas) return;

    const imageCtx = imageCanvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!imageCtx || !overlayCtx) return;

    imageCtx.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    overlayCtx.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    overlayCtx.fillStyle = "#fff";
    overlayCtx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

    const img = new Image();
    img.src = IMAGES[activeIndex];

    let animId: number;

    img.onload = () => {
      imageCtx.drawImage(img, 0, 0, IMG_WIDTH, IMG_HEIGHT);

      // Read pixel data and generate strokes that follow the ink
      const imageData = imageCtx.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
      const segs = generateSketchFromImage(imageData);
      const totalFrames = Math.ceil((DRAW_DURATION_MS / 1000) * TARGET_FPS);
      const segsPerFrame = Math.max(1, Math.ceil(segs.length / totalFrames));
      let idx = 0;

      const animate = () => {
        if (idx >= segs.length) return;

        for (
          let i = 0;
          i < segsPerFrame && idx < segs.length;
          i++, idx++
        ) {
          const s = segs[idx];
          overlayCtx.save();
          overlayCtx.globalCompositeOperation = "destination-out";
          overlayCtx.strokeStyle = "#000";
          overlayCtx.lineWidth = s.lw;
          overlayCtx.lineCap = "round";
          overlayCtx.lineJoin = "round";
          overlayCtx.beginPath();
          overlayCtx.moveTo(s.x1, s.y1);
          overlayCtx.lineTo(s.x2, s.y2);
          overlayCtx.stroke();
          overlayCtx.restore();
        }

        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);
    };

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeIndex]);

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <div
        className="relative"
        style={{ width: IMG_WIDTH, height: IMG_HEIGHT }}
      >
        <canvas
          ref={imageCanvasRef}
          width={IMG_WIDTH}
          height={IMG_HEIGHT}
          className="absolute inset-0"
        />
        <canvas
          ref={overlayCanvasRef}
          width={IMG_WIDTH}
          height={IMG_HEIGHT}
          className="absolute inset-0"
        />

        <button
          onClick={() => goTo(activeIndex - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center hover:bg-black/20 transition-colors"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M5.5 1L1 6l4.5 5"
              stroke="#333"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => goTo(activeIndex + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center hover:bg-black/20 transition-colors"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path
              d="M1.5 1L6 6l-4.5 5"
              stroke="#333"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex gap-2">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === activeIndex ? "bg-neutral-800" : "bg-neutral-300"
            }`}
          />
        ))}
      </div>
    </main>
  );
};

export default Brush;
