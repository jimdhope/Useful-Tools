import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MeterReadingGuide } from "@/components/meter-reading-guide";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MeterReadingGuidePage() {
  return (
    <div className="relative container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex justify-start">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Tools
          </Button>
        </Link>
      </div>
      <MeterReadingGuide />
    </div>
  );
}
