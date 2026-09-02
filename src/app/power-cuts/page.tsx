"use client";

import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          UK Power Cut Map
        </h1>
        <p className="mt-3 text-xl text-muted-foreground sm:mt-4">
          Real-time power cut incidents across the UK from all 6 Distribution Network Operators.
        </p>
      </header>

      <div className="mb-8 flex justify-start">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Tools
          </Button>
        </Link>
      </div>

      <div className="h-[calc(100vh-20rem)] min-h-[500px] overflow-hidden rounded-lg border border-border">
        <PowerCutMap />
      </div>
    </div>
  );
}
