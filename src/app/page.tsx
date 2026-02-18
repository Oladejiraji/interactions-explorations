import Link from "next/link";

const experiments = [
  {
    slug: "gooey",
    title: "Gooey",
    description: "Morphing gooey blob animation effect",
  },
  {
    slug: "voxel",
    title: "Voxel",
    description: "Voxel grid with mouse-tracking interactions",
  },
  {
    slug: "lockin",
    title: "Lock In",
    description: "Focus mode website blocker",
  },
  {
    slug: "distractions",
    title: "Distractions",
    description: "Domain blocker with timer functionality",
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
    slug: "copy",
    title: "Copy Toolbar",
    description: "Interactive toolbar with copy and highlight actions",
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
    slug: "dropdown",
    title: "Gooey Dropdown",
    description: "Morphing gooey dropdown menu with SVG filter effect",
  },
  {
    slug: "glare",
    title: "Depth Parallax",
    description: "WebGL depth-map parallax effect with mouse tracking",
  },
  {
    slug: "music",
    title: "Music Player",
    description: "Music player interface with album artwork display",
  },
  {
    slug: "perspective",
    title: "Perspective Shift",
    description: "WebGL depth-based perspective shift on mouse movement",
  },
  {
    slug: "pricing",
    title: "Pricing Page",
    description: "Pricing page component with plan cards",
  },
  {
    slug: "record",
    title: "Audio Recorder",
    description: "Real-time audio recording with frequency visualization",
  },
  {
    slug: "three-voxel",
    title: "3D Voxel Grid",
    description: "3D voxel grid with wave and rotation animations",
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
