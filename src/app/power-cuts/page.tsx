"use client";

import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/theme-toggle";

const PowerCutMap = dynamic(() => import("@/components/PowerCutMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <div className="text-center">
        <div className="text-4xl mb-2">⚡</div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
});

export default function PowerCutsPage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <PowerCutMap />
    </div>
  );
}
