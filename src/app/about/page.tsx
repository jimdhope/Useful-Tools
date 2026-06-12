
"use client";
import type * as React from "react";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Zap, CalendarDays, BarChartBig, FileCheck2, Info, Lightbulb, ListChecks, TrendingUp, Calculator, ArrowLeft, ExternalLink, Infinity, Phone } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AboutPage() {
  const lottieAnimationUrl = "https://lottie.host/b92ebd9f-f109-45f1-8fed-a940e441e0a5/IxwKiEhOF4.json";
  const [animData, setAnimData] = useState<unknown>(null);

  useEffect(() => {
    fetch(lottieAnimationUrl)
      .then((r) => r.json())
      .then(setAnimData)
      .catch(() => {});
  }, [lottieAnimationUrl]);

  return (
      <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            About Useful Tools
          </h1>
          <p className="mt-3 text-xl text-muted-foreground sm:mt-4">
            Smart calculations and utilities at your fingertips.
          </p>
        </header>

        <div className="mb-8 flex justify-start">
          <Link href="/" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calculators
            </Button>
          </Link>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Lightbulb className="mr-3 h-7 w-7 text-accent" />
              Welcome to Useful Tools!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg text-card-foreground">
            <div className="flex flex-col sm:flex-row items-start sm:space-x-6">
              <div className="shrink-0 mt-1 h-20 w-20 md:h-24 md:w-24 self-center sm:self-start mb-4 sm:mb-0">
                {animData !== null && (
                  <Lottie animationData={animData} loop />
                )}
              </div>
              <div className="space-y-4">
                <p>
                  Useful Tools offers a suite of accessible, intuitive, and accurate calculators designed to simplify complex everyday calculations, particularly in the realm of energy and finance. Navigating tariffs, instalment plans, and energy usage can often be daunting. These tools are here to empower you with the clarity and information needed to make informed decisions.
                </p>
                <p>
                  Technology should serve to make life easier. Each calculator in this toolkit is crafted with attention to detail, ensuring user-friendliness without compromising on the depth of calculation required for accurate results. Whether you're trying to figure out the best energy tariff, understand consumption patterns, or plan out payments, Useful Tools provides assistance.
                </p>
                <p>
                  Useful Tools is committed to continuous improvement and expansion. Enhancements to existing tools and the addition of new ones to address real-world needs are always being explored. Feedback is invaluable in this process, helping to refine and grow the toolkit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <ListChecks className="mr-3 h-7 w-7 text-accent" />
              Available Calculators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              This suite of calculators simplifies complex tasks related to energy management and financial planning. Each tool provides clear inputs and detailed, easy-to-understand results. Here's a glimpse of what can be done:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <CalendarDays className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Instalment Plan Calculator</h3>
                  <p className="text-muted-foreground mt-1">Effectively plan your finances by calculating monthly payments, the total number of instalments, and the final payment details for clearing an outstanding balance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <Zap className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Energy Usage Calculator</h3>
                  <p className="text-muted-foreground mt-1">Understand and manage your energy consumption and costs. Calculate usage from meter readings or input kWh directly, along with rates and standing charges, to estimate costs over various periods.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <Flame className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Burns Test Calculator</h3>
                  <p className="text-muted-foreground mt-1">Analyze daily energy patterns by inputting 7 days of meter readings for multiple electricity rates and gas, helping to identify potential issues or high consumption periods.</p>
                </div>
              </div>
               <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <Infinity className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Dual Fuel Calculator</h3>
                  <p className="text-muted-foreground mt-1">Quickly combine electricity and gas balances and ongoing usage costs to see your total financial position and calculate a combined payment plan if needed.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <BarChartBig className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Tariff Comparison Tool</h3>
                  <p className="text-muted-foreground mt-1">Find the best energy deals by comparing different tariffs based on your annual usage data for electricity and gas, including standing charges and unit rates.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <FileCheck2 className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Agreed Reads Calculator</h3>
                  <p className="text-muted-foreground mt-1">Estimate meter readings accurately for a specific proposed date based on historical consumption patterns between known start and end readings.</p>
                </div>
              </div>
               <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <Phone className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">Interactive Call Flow Guide</h3>
                  <p className="text-muted-foreground mt-1">A step-by-step guide to ensure a consistent and high-quality customer experience, covering all required compliance and service steps for every call.</p>
                </div>
              </div>
               <div className="flex items-start space-x-4 p-4 bg-muted/20 dark:bg-muted/10 rounded-lg border">
                <Calculator className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold">FinTrack App</h3>
                  <p className="text-muted-foreground mt-1">Your private tool for tracking income, expenses, credit, and UK benefits (England), featuring calculators and clear financial insights.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.open("https://fintrack.jabi.uk", "_blank", "noopener,noreferrer")}
                  >
                    Visit FinTrack App <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <p className="text-lg">
              More tools and features are regularly added to make tasks simpler. The aim is for Useful Tools to be a go-to resource for practical calculations.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="mr-3 h-7 w-7 text-accent" />
              Recent Changes & Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 list-none text-muted-foreground">
              <li>
                <Badge variant="secondary" className="mr-2 py-1 px-2.5 text-xs">July 2025</Badge>
                <span className="font-medium text-card-foreground">Interactive Call Flow Guide Added:</span> A new guided process to ensure compliance and quality for every customer interaction.
              </li>
              <li>
                <Badge variant="secondary" className="mr-2 py-1 px-2.5 text-xs">July 2025</Badge>
                <span className="font-medium text-card-foreground">Dual Fuel Calculator Added:</span> A new tool to quickly combine electricity and gas balances and calculate a suggested payment plan.
              </li>
              <li>
                <Badge variant="outline" className="mr-2 py-1 px-2.5 text-xs">May 2025</Badge>
                <span className="font-medium text-card-foreground">New "About" Page Launched:</span> Information about the mission and the tools offered is now available.
              </li>
              <li>
                <Badge variant="outline" className="mr-2 py-1 px-2.5 text-xs">May 2025</Badge>
                <span className="font-medium text-card-foreground">Agreed Reads Calculator Enhanced:</span> Added flexible meter configuration options for electricity (1-3 rates) and gas.
              </li>
              <li>
                <Badge variant="outline" className="mr-2 py-1 px-2.5 text-xs">May 2025</Badge>
                <span className="font-medium text-card-foreground">Energy Calculators Merged:</span> The "Energy Cost" and "Energy Usage" calculators are now a single, more versatile tool with options for direct kWh input or calculation from meter readings.
              </li>
              <li>
                <Badge variant="outline" className="mr-2 py-1 px-2.5 text-xs">May 2025</Badge>
                <span className="font-medium text-card-foreground">Optional Fields Implemented:</span> All fuel and rate inputs across calculators are now fully optional to accommodate various user setups.
              </li>
              <li>
                <Badge variant="outline" className="mr-2 py-1 px-2.5 text-xs">April 2025</Badge>
                <span className="font-medium text-card-foreground">UI & Theme Refresh:</span> Implemented ShadCN UI components and improved color themes for better readability and aesthetics in both light and dark modes.
              </li>
              <li>
                <Badge variant="outline" className="mr-2 py-1 px-2.5 text-xs">April 2025</Badge>
                <span className="font-medium text-card-foreground">V3 Launched:</span> Migrated from WordPress to a new Firebase backend, enhancing performance and scalability. Core calculator tools (Instalment Plan, Tariff Comparison, Burns Test, Agreed Reads, Energy Usage) re-platformed.
              </li>
            </ul>
          </CardContent>
        </Card>

        <footer className="mt-12 text-center text-sm text-muted-foreground border-t pt-6">
          <p>&copy; {new Date().getFullYear()} Useful Tools.</p>
        </footer>
      </div>
  );
}
