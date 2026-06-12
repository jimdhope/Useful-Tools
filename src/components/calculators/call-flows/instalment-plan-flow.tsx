
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { InstalmentPlanCalculator } from "../instalment-plan-calculator";

export interface InstalmentPlanState {
  billedToDate: boolean;
  onBestTariff: boolean;
  summary?: string;
}

interface InstalmentPlanFlowProps {
  onStateChange: (state: InstalmentPlanState) => void;
}

export function InstalmentPlanFlow({ onStateChange }: InstalmentPlanFlowProps) {
  const [billedToDate, setBilledToDate] = useState(false);
  const [onBestTariff, setOnBestTariff] = useState(false);

  useEffect(() => {
    let summaryParts: string[] = [];
    if (billedToDate) summaryParts.push("Account billed to date.");
    if (onBestTariff) summaryParts.push("Customer confirmed on best tariff.");
    
    const summary = summaryParts.length > 0 ? summaryParts.join(' ') : "Instalment plan prerequisites pending.";

    onStateChange({
      billedToDate,
      onBestTariff,
      summary
    });
  }, [billedToDate, onBestTariff, onStateChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Flow: Set Up Instalment Plan</CardTitle>
        <CardDescription>
          Follow these steps to correctly set up an instalment plan for a customer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Prerequisites</AlertTitle>
          <AlertDescription>
            Before setting up a plan, you must ensure the account is billed to date and the customer is on the best possible tariff. Use the other process flows if needed.
          </AlertDescription>
        </Alert>

        <Card>
            <CardContent className="p-6 space-y-4">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="billedToDate" checked={billedToDate} onCheckedChange={(checked) => setBilledToDate(checked as boolean)} />
                    <Label htmlFor="billedToDate">Account is billed to date.</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="onBestTariff" checked={onBestTariff} onCheckedChange={(checked) => setOnBestTariff(checked as boolean)} />
                    <Label htmlFor="onBestTariff">Customer is on the best tariff.</Label>
                </div>
            </CardContent>
        </Card>

        {billedToDate && onBestTariff && (
            <div className="pt-4 border-t">
                <h3 className="mb-4 text-lg font-semibold text-center">Instalment Plan Calculator</h3>
                <InstalmentPlanCalculator />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
