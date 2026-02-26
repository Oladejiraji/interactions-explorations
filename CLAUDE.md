# Interaction Experiments

A Next.js repo for building interactive UI experiments.

## Stack

- Next.js 15 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- React Three Fiber + Drei (3D scenes)

## Conventions

- Package manager: **pnpm**
- Styling: Tailwind CSS (prefer utility classes)
- Animation: Motion library for 2D, R3F for 3D
- Linting/formatting: Biome (`pnpm lint` / `pnpm format`)
- Each experiment lives in its own route under `src/app/`

## Notes

- Most explorations on this site are independent. Each page contains a separate exploration so don't check other files for patterns unless explicictly asked
