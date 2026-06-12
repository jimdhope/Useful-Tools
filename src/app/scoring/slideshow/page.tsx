
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScoringSlideshow } from "@/components/scoring/scoring-slideshow";
import { Fullscreen, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoringSlideshowPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (!slideshowRef.current) return;

    if (!document.fullscreenElement) {
      slideshowRef.current.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
      <div ref={slideshowRef} className="bg-background relative flex-1 flex flex-col">
         <header className="text-center mb-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            SLC Sessions
            </h1>
        </header>

        <Button onClick={handleFullscreen} variant="ghost" size="icon" className="absolute top-0 right-0 z-10">
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Fullscreen className="h-5 w-5" />}
          <span className="sr-only">{isFullscreen ? "Exit Full Screen" : "Full Screen"}</span>
        </Button>

        <div className={cn("flex-1 flex flex-col", isFullscreen ? "h-screen w-screen" : "")}>
            <ScoringSlideshow isFullscreen={isFullscreen} />
        </div>
      </div>

    </div>
  );
}
