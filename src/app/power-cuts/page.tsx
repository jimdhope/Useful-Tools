"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PowerCutMap = dynamic(() => import("@/components/PowerCutMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground">
      <div className="text-center">
        <div className="text-4xl mb-2">⚡</div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
});

export default function PowerCutsPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-background flex flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Tools
          </Button>
        </Link>
        <h1 className="text-sm font-semibold text-primary">⚡ UK Power Cut Map</h1>
      </header>
      <div className="flex-1 min-h-0">
        <PowerCutMap />
      </div>
    </div>
  );
}
