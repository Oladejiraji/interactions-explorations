import Link from "next/link";

const experiments = [
  {
    slug: "ai-assistant",
    title: "AI Assistant",
    description: "Animated chat interface with gooey orbiting particles",
  },
  {
    slug: "anchor-learn",
    title: "Anchor Popover",
    description: "Popover tooltip using HTML anchor positioning API",
  },
  {
    slug: "anchor-tabs",
    title: "Anchor Tabs",
    description: "Animated tab navigation with anchor-positioned background",
  },
  {
    slug: "brush",
    title: "Brush Drawing",
    description: "Animated pen-drawn sketch animation from image data",
  },
  {
    slug: "buttons",
    title: "Interactive Buttons",
    description: "Custom animated buttons with morphing SVG borders",
  },
  {
    slug: "card-blur",
    title: "Card Blur Effect",
    description: "Audio recording visualizer with animated bar spectrum and blur",
  },
  {
    slug: "chart",
    title: "Animated Chart",
    description: "Grid-based bar chart with animated cell blocks",
  },
  {
    slug: "circle",
    title: "Circle Gauge",
    description: "Interactive circular gauge with smooth angle-based animations",
  },
  {
    slug: "copy",
    title: "Copy Toolbar",
    description: "Interactive toolbar with copy and highlight actions",
  },
  {
    slug: "crt-loader",
    title: "CRT Loader",
    description: "Retro CRT monitor-style loader with scanlines and typewriter text",
  },
  {
    slug: "dashboard",
    title: "Dashboard UI",
    description: "Full-featured analytics dashboard with sidebar and table",
  },
  {
    slug: "device",
    title: "Device Orientation",
    description: "Real-time device orientation sensor data visualization",
  },
  {
    slug: "distractions",
    title: "Distractions",
    description: "Domain blocker with timer functionality",
  },
  {
    slug: "dropdown",
    title: "Gooey Dropdown",
    description: "Morphing gooey dropdown menu with SVG filter effect",
  },
  {
    slug: "freestyle",
    title: "Freestyle Shader",
    description: "Interactive 3D scene with custom shader material and pulsing lights",
  },
  {
    slug: "glare",
    title: "Depth Parallax",
    description: "WebGL depth-map parallax effect with mouse tracking",
  },
  {
    slug: "gooey",
    title: "Gooey",
    description: "Morphing gooey blob animation effect",
  },
  {
    slug: "gooey-loader",
    title: "Gooey Loader",
    description: "Compact gooey blob loader with orbiting particles",
  },
  {
    slug: "gooey-loader-lg",
    title: "Gooey Loader Large",
    description: "Large gooey blob loader with fluid particle morphing",
  },
  {
    slug: "gradient-checkbox",
    title: "Gradient Checkbox",
    description: "Animated checkbox with gradient-filled morphing circles",
  },
  {
    slug: "infographics",
    title: "Revenue Infographics",
    description: "Interactive financial dashboard with animated value transitions",
  },
  {
    slug: "lockin",
    title: "Lock In",
    description: "Focus mode website blocker",
  },
  {
    slug: "music",
    title: "Music Player",
    description: "Music player interface with album artwork display",
  },
  {
    slug: "panel",
    title: "Notification Panel",
    description: "Collapsible notification panel with user cards and slide animations",
  },
  {
    slug: "perspective",
    title: "Perspective Shift",
    description: "WebGL depth-based perspective shift on mouse movement",
  },
  {
    slug: "pip-boy",
    title: "Pip-Boy UI",
    description: "Fallout-inspired retro green terminal interface with stat displays",
  },
  {
    slug: "record",
    title: "Audio Recorder",
    description: "Real-time audio recording with frequency visualization",
  },
  {
    slug: "speaker-ai",
    title: "AI Speaker",
    description: "Voice interaction UI with listening, processing, and done states",
  },
  {
    slug: "three-voxel",
    title: "3D Voxel Grid",
    description: "3D voxel grid with wave and rotation animations",
  },
  {
    slug: "vhs",
    title: "VHS Shader",
    description: "VHS effect shader with static, glitch, and tape noise presets",
  },
  {
    slug: "vhs-player",
    title: "VHS Player",
    description: "Interactive VHS effect video player with adjustable distortion",
  },
  {
    slug: "vhs-player-mobile",
    title: "VHS Player Mobile",
    description: "Mobile-optimized VHS effect video player with shader presets",
  },
  {
    slug: "voxel",
    title: "Voxel",
    description: "Voxel grid with mouse-tracking interactions",
  },
  {
    slug: "voxel-rearrange",
    title: "Voxel Rearrange",
    description: "Interactive voxel grid with animated robot and shape rearrangement",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-20 flex flex-col items-center">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Interaction Experiments
        </h1>
        <p className="text-neutral-400 text-lg">
          A collection of UI interaction explorations
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {experiments.map((exp) => (
          <Link
            key={exp.slug}
            href={`/${exp.slug}`}
            className="group block rounded-xl border border-neutral-800 bg-neutral-900 p-6 transition-all hover:border-neutral-600 hover:bg-neutral-800/60"
          >
            <h2 className="text-lg font-semibold mb-1 group-hover:text-white text-neutral-200">
              {exp.title}
            </h2>
            <p className="text-sm text-neutral-500 group-hover:text-neutral-400">
              {exp.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
