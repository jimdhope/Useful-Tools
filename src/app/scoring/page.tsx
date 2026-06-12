
import { ScoringGuide } from "@/components/scoring/scoring-guide";
import { CallFlow } from "@/components/calculators/call-flow";
import { ArrowLeft, BookOpen, ClipboardList, Presentation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";


export default function ScoringPage() {
  return (
      <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Call Excellence Suite
          </h1>
          <p className="mt-3 text-xl text-muted-foreground sm:mt-4">
            Your tools for guided, high-quality customer interactions.
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
        
        <Tabs defaultValue="interactive-guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="interactive-guide">
              <ClipboardList className="mr-2 h-4 w-4"/>
              Interactive Call Guide
            </TabsTrigger>
            <TabsTrigger value="scoring-documentation">
              <BookOpen className="mr-2 h-4 w-4"/>
              Scoring Documentation
              </TabsTrigger>
          </TabsList>
          <TabsContent value="interactive-guide" className="mt-6">
            <CallFlow />
          </TabsContent>
          <TabsContent value="scoring-documentation" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Call Scoring Guide</CardTitle>
                      <CardDescription>A step-by-step guide to achieving top marks on your calls.</CardDescription>
                    </div>
                    <Link href="/scoring/slideshow" passHref>
                      <Button variant="secondary">
                        <Presentation className="mr-2 h-4 w-4" />
                        View as Slideshow
                      </Button>
                    </Link>
                </div>
              </CardHeader>
              <CardContent>
                <ScoringGuide />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
