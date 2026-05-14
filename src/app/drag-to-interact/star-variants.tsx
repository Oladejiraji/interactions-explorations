"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, animate, useMotionValue, AnimatePresence } from "motion/react"

const STAR_PATH =
  "M10.92 2.868a1.25 1.25 0 0 1 2.16 0l2.795 4.798 5.428 1.176a1.25 1.25 0 0 1 .667 2.054l-3.7 4.141.56 5.525a1.25 1.25 0 0 1-1.748 1.27L12 19.592l-5.082 2.24a1.25 1.25 0 0 1-1.748-1.27l.56-5.525-3.7-4.14a1.25 1.25 0 0 1 .667-2.055l5.428-1.176z"

const STAR_OUTLINE_PATH =
  "M12 4.987 9.687 8.959a1.25 1.25 0 0 1-.816.592l-4.492.973 3.062 3.427c.234.262.347.61.312.959l-.463 4.573 4.206-1.854a1.25 1.25 0 0 1 1.008 0l4.206 1.854-.463-4.573a1.25 1.25 0 0 1 .311-.959l3.063-3.427-4.492-.973a1.25 1.25 0 0 1-.816-.592z"

// ─── 1. Particle Burst ───────────────────────────────────────────────
function ParticleBurstStar() {
  const [favourited, setFavourited] = useState(false)
  const [particles, setParticles] = useState<
    { id: number; angle: number; distance: number; size: number; color: string }[]
  >([])
  const scale = useMotionValue(1)

  const toggle = useCallback(() => {
    const next = !favourited
    setFavourited(next)
    if (next) {
      animate(scale, 1.2, { type: "spring", duration: 0.15, bounce: 0 }).then(
        () => animate(scale, 1, { type: "spring", duration: 0.2, bounce: 0 })
      )
      const colors = ["#FFD700", "#FFA500", "#FFE066", "#FFF4B8", "#FF6B35"]
      const newParticles = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        angle: (360 / 10) * i + Math.random() * 20 - 10,
        distance: 20 + Math.random() * 16,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 600)
    }
  }, [favourited, scale])

  return (
    <button
      onClick={toggle}
      style={{
        width: 48,
        height: 48,
        background: "none",
        border: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <AnimatePresence>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180
          return (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: Math.cos(rad) * p.distance,
                y: Math.sin(rad) * p.distance,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                pointerEvents: "none",
              }}
            />
          )
        })}
      </AnimatePresence>
      <motion.div style={{ scale, display: "flex" }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <motion.path
            d={STAR_PATH}
            fill={favourited ? "#FFD700" : "none"}
            stroke={favourited ? "#FFD700" : "rgba(255,255,255,0.65)"}
            strokeWidth={favourited ? 0 : 0}
            animate={{ fill: favourited ? "#FFD700" : "rgba(255,255,255,0.15)" }}
            transition={{ duration: 0.2 }}
          />
          {!favourited && (
            <path
              d={STAR_OUTLINE_PATH}
              fill="rgba(255,255,255,0.65)"
            />
          )}
        </svg>
      </motion.div>
    </button>
  )
}

// ─── 2. Glow Pulse ───────────────────────────────────────────────────
function GlowPulseStar() {
  const [favourited, setFavourited] = useState(false)
  const scale = useMotionValue(1)
  const [showGlow, setShowGlow] = useState(false)

  const toggle = useCallback(() => {
    const next = !favourited
    setFavourited(next)
    if (next) {
      animate(scale, 1.15, { type: "spring", duration: 0.15, bounce: 0 }).then(
        () => animate(scale, 1, { type: "spring", duration: 0.2, bounce: 0 })
      )
      setShowGlow(true)
      setTimeout(() => setShowGlow(false), 600)
    }
  }, [favourited, scale])

  return (
    <button
      onClick={toggle}
      style={{
        width: 48,
        height: 48,
        background: "none",
        border: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <AnimatePresence>
        {showGlow && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,165,0,0.3) 40%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
      <motion.div style={{ scale, display: "flex" }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <motion.path
            d={STAR_PATH}
            animate={{
              fill: favourited ? "#FFD700" : "rgba(255,255,255,0.15)",
              filter: favourited ? "drop-shadow(0 0 6px rgba(255,215,0,0.5))" : "none",
            }}
            transition={{ duration: 0.25 }}
          />
          {!favourited && (
            <path d={STAR_OUTLINE_PATH} fill="rgba(255,255,255,0.65)" />
          )}
        </svg>
      </motion.div>
    </button>
  )
}

// ─── 3. Wiggle / Wobble ──────────────────────────────────────────────
function WiggleWobbleStar() {
  const [favourited, setFavourited] = useState(false)
  const scale = useMotionValue(1)
  const rotate = useMotionValue(0)

  const toggle = useCallback(() => {
    const next = !favourited
    setFavourited(next)
    if (next) {
      animate(scale, [1, 1.35, 0.9, 1.1, 1], {
        duration: 0.5,
        ease: "easeInOut",
      })
      animate(rotate, [0, -12, 10, -6, 4, 0], {
        duration: 0.5,
        ease: "easeInOut",
      })
    }
  }, [favourited, scale, rotate])

  return (
    <button
      onClick={toggle}
      style={{
        width: 48,
        height: 48,
        background: "none",
        border: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <motion.div style={{ scale, rotate, display: "flex" }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <motion.path
            d={STAR_PATH}
            animate={{ fill: favourited ? "#FFD700" : "rgba(255,255,255,0.15)" }}
            transition={{ duration: 0.2 }}
          />
          {!favourited && (
            <path d={STAR_OUTLINE_PATH} fill="rgba(255,255,255,0.65)" />
          )}
        </svg>
      </motion.div>
    </button>
  )
}

// ─── 4. Stroke Draw + Fill Wipe ──────────────────────────────────────
function StrokeDrawStar() {
  const [favourited, setFavourited] = useState(false)
  const strokeDashoffset = useMotionValue(200)
  const fillScale = useMotionValue(0)
  const outerScale = useMotionValue(1)

  useEffect(() => {
    if (!favourited) {
      strokeDashoffset.set(200)
      fillScale.set(0)
    }
  }, [favourited, strokeDashoffset, fillScale])

  const toggle = useCallback(() => {
    const next = !favourited
    setFavourited(next)
    if (next) {
      animate(outerScale, 1.15, {
        type: "spring",
        duration: 0.15,
        bounce: 0,
      }).then(() =>
        animate(outerScale, 1, { type: "spring", duration: 0.2, bounce: 0 })
      )
      animate(strokeDashoffset, 0, {
        duration: 0.4,
        ease: "easeInOut",
      })
      animate(fillScale, 1, {
        duration: 0.3,
        delay: 0.25,
        ease: "easeOut",
      })
    }
  }, [favourited, strokeDashoffset, fillScale, outerScale])

  return (
    <button
      onClick={toggle}
      style={{
        width: 48,
        height: 48,
        background: "none",
        border: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <motion.div style={{ scale: outerScale, display: "flex" }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          {/* Outline version when not favourited */}
          {!favourited && (
            <>
              <path
                d={STAR_PATH}
                fill="rgba(255,255,255,0.15)"
              />
              <path
                d={STAR_OUTLINE_PATH}
                fill="rgba(255,255,255,0.65)"
              />
            </>
          )}

          {/* Drawing stroke */}
          {favourited && (
            <motion.path
              d={STAR_PATH}
              fill="none"
              stroke="#FFD700"
              strokeWidth={1.5}
              strokeDasharray={200}
              style={{ strokeDashoffset }}
            />
          )}

          {/* Fill expanding from center */}
          {favourited && (
            <g>
              <defs>
                <clipPath id="star-clip">
                  <path d={STAR_PATH} />
                </clipPath>
              </defs>
              <motion.circle
                cx="12"
                cy="12"
                r="12"
                fill="#FFD700"
                clipPath="url(#star-clip)"
                style={{ scale: fillScale }}
              />
            </g>
          )}
        </svg>
      </motion.div>
    </button>
  )
}

// ─── 5. Elastic Snap with Ghost Trail ────────────────────────────────
function ElasticTrailStar() {
  const [favourited, setFavourited] = useState(false)
  const x = useMotionValue(0)
  const scale = useMotionValue(1)
  const [ghosts, setGhosts] = useState<{ id: number; x: number }[]>([])

  const toggle = useCallback(() => {
    const next = !favourited
    setFavourited(next)
    if (next) {
      // Create ghost trail
      const newGhosts = [
        { id: Date.now(), x: 0 },
        { id: Date.now() + 1, x: -4 },
        { id: Date.now() + 2, x: -8 },
      ]
      setGhosts(newGhosts)

      // Elastic snap animation
      animate(x, [0, -18, 6, -3, 0], {
        duration: 0.5,
        ease: "easeInOut",
      })
      animate(scale, [1, 1.3, 0.95, 1.05, 1], {
        duration: 0.45,
        ease: "easeInOut",
      })

      setTimeout(() => setGhosts([]), 500)
    }
  }, [favourited, x, scale])

  return (
    <button
      onClick={toggle}
      style={{
        width: 48,
        height: 48,
        background: "none",
        border: "none",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <AnimatePresence>
        {ghosts.map((ghost, i) => (
          <motion.div
            key={ghost.id}
            initial={{ opacity: 0.4 - i * 0.1, x: ghost.x, scale: 1 - i * 0.08 }}
            animate={{ opacity: 0, x: ghost.x - 12, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.03 }}
            style={{
              position: "absolute",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d={STAR_PATH} fill="rgba(255,215,0,0.3)" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div style={{ x, scale, display: "flex" }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <motion.path
            d={STAR_PATH}
            animate={{ fill: favourited ? "#FFD700" : "rgba(255,255,255,0.15)" }}
            transition={{ duration: 0.2 }}
          />
          {!favourited && (
            <path d={STAR_OUTLINE_PATH} fill="rgba(255,255,255,0.65)" />
          )}
        </svg>
      </motion.div>
    </button>
  )
}

// ─── Showcase ────────────────────────────────────────────────────────
const variants = [
  { name: "Particle Burst", component: ParticleBurstStar },
  { name: "Glow Pulse", component: GlowPulseStar },
  { name: "Wiggle Wobble", component: WiggleWobbleStar },
  { name: "Stroke Draw", component: StrokeDrawStar },
  { name: "Elastic Trail", component: ElasticTrailStar },
]

export function StarVariantsShowcase() {
  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      {variants.map(({ name, component: Comp }) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Comp />
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  )
}
