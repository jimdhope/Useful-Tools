"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, BookOpen, Tv, Zap, Info, CalendarDays, Flame, Infinity, BarChartBig, FileCheck2 } from "lucide-react";
import { InstalmentPlanCalculator } from "@/components/calculators/instalment-plan-calculator";
import { EnergyTariffComparisonTool } from "@/components/calculators/tariff-comparison-tool";
import { BurnsTestCalculator } from "@/components/calculators/burns-test-calculator";
import { EnergyUsageCalculator } from "@/components/calculators/energy-usage-calculator";
import { AgreedReadsCalculator } from "@/components/calculators/agreed-reads-calculator";
import { DualFuelCalculator } from "@/components/calculators/dual-fuel-calculator";
import { CallFlow } from "@/components/calculators/call-flow";
import { ResultsPanel } from "@/components/calculators/results-panel";
import { ResultsProvider, useResults } from "@/lib/results-context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

function HomePageContent() {
  const { setResults } = useResults();
  const [activeTab, setActiveTab] = useState("instalment-plan");
  const tabTriggerClassName = "flex-col sm:flex-row items-center gap-2 py-2.5 px-3 text-xs sm:text-sm inline-flex justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-accent hover:text-accent-foreground";

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setResults(null);
  };

  return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <header className="text-center mb-8 py-6">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            Useful Tools
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Your smart assistant for various calculations and utilities.
          </p>
        </header>

        <main className="flex-grow max-w-[90vw] mx-auto w-full">
            <nav aria-label="Useful tools menu" className="mb-6 flex flex-wrap gap-2 rounded-lg bg-muted p-1.5">
              <button onClick={() => handleTabChange("instalment-plan")} className={cn(tabTriggerClassName, "flex-1 min-w-[140px] justify-center", activeTab === "instalment-plan" && "bg-background text-foreground shadow-sm")}>
                <CalendarDays className="h-4 w-4" /> Instalment Plan
              </button>
              <button onClick={() => handleTabChange("energy-usage")} className={cn(tabTriggerClassName, "flex-1 min-w-[140px] justify-center", activeTab === "energy-usage" && "bg-background text-foreground shadow-sm")}>
                <Zap className="h-4 w-4" /> Energy Usage
              </button>
              <button onClick={() => handleTabChange("burns-test")} className={cn(tabTriggerClassName, "flex-1 min-w-[140px] justify-center", activeTab === "burns-test" && "bg-background text-foreground shadow-sm")}>
                <Flame className="h-4 w-4" /> Burns Test
              </button>
              <button onClick={() => handleTabChange("dual-fuel")} className={cn(tabTriggerClassName, "flex-1 min-w-[140px] justify-center", activeTab === "dual-fuel" && "bg-background text-foreground shadow-sm")}>
                <Infinity className="h-4 w-4" /> Dual Fuel
              </button>
              <button onClick={() => handleTabChange("tariff-comparison")} className={cn(tabTriggerClassName, "flex-1 min-w-[140px] justify-center", activeTab === "tariff-comparison" && "bg-background text-foreground shadow-sm")}>
                <BarChartBig className="h-4 w-4" /> Tariff Comparison
              </button>
              <button onClick={() => handleTabChange("agreed-reads")} className={cn(tabTriggerClassName, "flex-1 min-w-[140px] justify-center", activeTab === "agreed-reads" && "bg-background text-foreground shadow-sm")}>
                <FileCheck2 className="h-4 w-4" /> Agreed Reads
              </button>
              <Link href="/scoring" className={cn(tabTriggerClassName, "flex-1 min-w-[140px] bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline justify-center")}>
                <Phone className="h-4 w-4" /> Call Flow
              </Link>
              <Link href="/meter-reading-guide" className={cn(tabTriggerClassName, "flex-1 min-w-[140px] bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline justify-center")}>
                <BookOpen className="h-4 w-4" /> Meter Reading
              </Link>
              <Link href="/ihd-guide" className={cn(tabTriggerClassName, "flex-1 min-w-[140px] bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline justify-center")}>
                <Tv className="h-4 w-4" /> IHD Guide
              </Link>
              <Link href="/power-cuts" className={cn(tabTriggerClassName, "flex-1 min-w-[140px] bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline justify-center")}>
                <Zap className="h-4 w-4" /> Power Cuts
              </Link>
              <Link href="/about" className={cn(tabTriggerClassName, "flex-1 min-w-[140px] bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline justify-center")}>
                <Info className="h-4 w-4" /> About
              </Link>
            </nav>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                {activeTab === "instalment-plan" && <InstalmentPlanCalculator />}
                {activeTab === "energy-usage" && <EnergyUsageCalculator />}
                {activeTab === "burns-test" && <BurnsTestCalculator />}
                {activeTab === "dual-fuel" && <DualFuelCalculator />}
                {activeTab === "tariff-comparison" && <EnergyTariffComparisonTool />}
                {activeTab === "agreed-reads" && <AgreedReadsCalculator />}
                {activeTab === "call-flow" && <CallFlow />}
              </div>
              <div className="xl:col-span-1 xl:sticky xl:top-6 xl:self-start xl:min-h-[calc(100vh-12rem)] xl:flex xl:flex-col hidden xl:block">
                <ResultsPanel />
              </div>
              <div className="xl:hidden">
                <ResultsPanel />
              </div>
            </div>
        </main>

        <footer className="text-center mt-12 py-6 text-sm text-muted-foreground border-t">
          <p>&copy; {new Date().getFullYear()} Useful Tools. All rights reserved.</p>
        </footer>
      </div>
  );
}

export default function HomePage() {
  return (
    <ResultsProvider>
      <HomePageContent />
    </ResultsProvider>
  );
}
