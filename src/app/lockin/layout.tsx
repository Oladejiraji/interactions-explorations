import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lock In - Focus Mode",
  description:
    "Block distracting websites and stay focused with a simple timer-based focus mode.",
  openGraph: {
    title: "Lock In - Focus Mode",
    description:
      "Block distracting websites and stay focused with a simple timer-based focus mode.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lock In - Focus Mode",
    description:
      "Block distracting websites and stay focused with a simple timer-based focus mode.",
  },
};

export default function LockInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
