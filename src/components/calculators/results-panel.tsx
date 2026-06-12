"use client";

import { useResults, type ResultsSection } from "@/lib/results-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ResultsPanel() {
  const { results } = useResults();

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Enter values to see results
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">{results.title}</p>
            {results.groups.map((group, gi) => (
              <div key={gi} className="space-y-2">
                {gi > 0 && <Separator />}
                {results.groupTitles?.[gi] && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {results.groupTitles[gi]}
                  </p>
                )}
                {group.map((section: ResultsSection, si: number) => (
                  <div key={si} className="flex justify-between items-center gap-2">
                    <span className="text-xs text-muted-foreground">{section.label}</span>
                    <span className={cn(
                      "text-sm font-semibold text-right whitespace-nowrap",
                      section.highlight && "text-primary"
                    )}>
                      {section.value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
