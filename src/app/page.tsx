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
