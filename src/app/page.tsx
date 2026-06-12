"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstalmentPlanCalculator } from "@/components/calculators/instalment-plan-calculator";
import { EnergyTariffComparisonTool } from "@/components/calculators/tariff-comparison-tool";
import { BurnsTestCalculator } from "@/components/calculators/burns-test-calculator";
import { EnergyUsageCalculator } from "@/components/calculators/energy-usage-calculator";
import { AgreedReadsCalculator } from "@/components/calculators/agreed-reads-calculator";
import { DualFuelCalculator } from "@/components/calculators/dual-fuel-calculator";
import { CallFlow } from "@/components/calculators/call-flow";
import { ResultsPanel } from "@/components/calculators/results-panel";
import { ResultsProvider, useResults } from "@/lib/results-context";
import { CalendarDays, BarChartBig, Flame, Zap, FileCheck2, Info, Infinity, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

function HomePageContent() {
  const { setResults } = useResults();
  const tabTriggerClassName = "flex-col sm:flex-row items-center gap-2 py-2.5 px-3 text-xs sm:text-sm inline-flex justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-accent hover:text-accent-foreground";

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
          <Tabs defaultValue="instalment-plan" onValueChange={() => setResults(null)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-6 h-auto p-1">
              <TabsTrigger value="instalment-plan" className={tabTriggerClassName}>
                <CalendarDays className="h-5 w-5 sm:h-4 sm:w-4" /> Instalment Plan
              </TabsTrigger>
              <TabsTrigger value="energy-usage" className={tabTriggerClassName}>
                <Zap className="h-5 w-5 sm:h-4 sm:w-4" /> Energy Usage
              </TabsTrigger>
              <TabsTrigger value="burns-test" className={tabTriggerClassName}>
                <Flame className="h-5 w-5 sm:h-4 sm:w-4" /> Burns Test
              </TabsTrigger>
              <TabsTrigger value="dual-fuel" className={tabTriggerClassName}>
                <Infinity className="h-5 w-5 sm:h-4 sm:w-4" /> Dual Fuel
              </TabsTrigger>
              <TabsTrigger value="tariff-comparison" className={tabTriggerClassName}>
                <BarChartBig className="h-5 w-5 sm:h-4 sm:w-4" /> Tariff Comparison
              </TabsTrigger>
              <TabsTrigger value="agreed-reads" className={tabTriggerClassName}>
                <FileCheck2 className="h-5 w-5 sm:h-4 sm_w-4" /> Agreed Reads
              </TabsTrigger>
              <Link href="/scoring" className={cn(tabTriggerClassName, "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline")}>
                <Phone className="h-5 w-5 sm:h-4 sm:w-4" /> Call Flow
              </Link>
              <Link href="/about" className={cn(tabTriggerClassName, "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground no-underline")}>
                <Info className="h-5 w-5 sm:h-4 sm:w-4" /> About
              </Link>
            </TabsList>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <TabsContent value="instalment-plan">
                  <InstalmentPlanCalculator />
                </TabsContent>
                <TabsContent value="energy-usage">
                  <EnergyUsageCalculator />
                </TabsContent>
                <TabsContent value="burns-test">
                  <BurnsTestCalculator />
                </TabsContent>
                <TabsContent value="dual-fuel">
                  <DualFuelCalculator />
                </TabsContent>
                <TabsContent value="tariff-comparison">
                  <EnergyTariffComparisonTool />
                </TabsContent>
                <TabsContent value="agreed-reads">
                  <AgreedReadsCalculator />
                </TabsContent>
                <TabsContent value="call-flow">
                  <CallFlow />
                </TabsContent>
              </div>
              <div className="xl:col-span-1 xl:sticky xl:top-6 xl:self-start xl:min-h-[calc(100vh-12rem)] xl:flex xl:flex-col hidden xl:block">
                <ResultsPanel />
              </div>
              <div className="xl:hidden">
                <ResultsPanel />
              </div>
            </div>
          </Tabs>
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
