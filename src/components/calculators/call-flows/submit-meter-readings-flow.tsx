
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lightbulb } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export interface MeterReadingsState {
  elecReadings?: string;
  gasReadings?: string;
  summary?: string;
}

interface SubmitMeterReadingsFlowProps {
  onStateChange: (state: MeterReadingsState) => void;
}

type BillingOutcome = "" | "billed" | "billed_4_days" | "back_office_10" | "back_office_15";

export function SubmitMeterReadingsFlow({ onStateChange }: SubmitMeterReadingsFlowProps) {
  const [fuelType, setFuelType] = useState<'electric' | 'gas' | 'both'>('both');
  const [numElectricRates, setNumElectricRates] = useState<1 | 2 | 3>(1);
  const [elecRate1, setElecRate1] = useState('');
  const [elecRate2, setElecRate2] = useState('');
  const [elecRate3, setElecRate3] = useState('');
  const [gasReading, setGasReading] = useState('');
  const [billingOutcome, setBillingOutcome] = useState<BillingOutcome>('');
  const [billAmount, setBillAmount] = useState('');

  useEffect(() => {
    const elecParts: string[] = [];
    if (fuelType === 'electric' || fuelType === 'both') {
      if (elecRate1) elecParts.push(`R1: ${elecRate1}`);
      if (numElectricRates >= 2 && elecRate2) elecParts.push(`R2: ${elecRate2}`);
      if (numElectricRates === 3 && elecRate3) elecParts.push(`R3: ${elecRate3}`);
    }
    
    let readingSummary = '';
    const elecReadingsProvided = elecParts.length > 0;
    const gasReadingsProvided = (fuelType === 'gas' || fuelType === 'both') && gasReading;

    if (elecReadingsProvided && gasReadingsProvided) {
        readingSummary = `Elec (${elecParts.join(', ')}) & Gas (${gasReading}) readings provided.`;
    } else if (elecReadingsProvided) {
        readingSummary = `Elec readings (${elecParts.join(', ')}) provided.`;
    } else if (gasReadingsProvided) {
        readingSummary = `Gas reading (${gasReading}) provided.`;
    }

    let outcomeSummary = '';
    switch (billingOutcome) {
      case "billed":
        outcomeSummary = `Bill Produced: £${billAmount || '...'}`;
        break;
      case "billed_4_days":
        outcomeSummary = "No bill produced (billed in last 4 days).";
        break;
      case "back_office_10":
        outcomeSummary = "Bill sent to back office (10 working days).";
        break;
      case "back_office_15":
        outcomeSummary = "Bill sent to back office (15 working days).";
        break;
    }
    
    let summaryParts: string[] = [];
    if (readingSummary) summaryParts.push(readingSummary);
    if (outcomeSummary) summaryParts.push(outcomeSummary);

    const summary = summaryParts.length > 0 ? summaryParts.join(' ') : 'No billing outcome selected.';

    onStateChange({
      summary,
    });
  }, [fuelType, numElectricRates, elecRate1, elecRate2, elecRate3, gasReading, onStateChange, billingOutcome, billAmount]);

  const showElectricFields = fuelType === 'electric' || fuelType === 'both';
  const showGasFields = fuelType === 'gas' || fuelType === 'both';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Flow: Bill Account with Readings</CardTitle>
        <CardDescription className="space-y-2 pt-2">
            <p>Select the outcome of billing the account with customer-provided readings. You can use the links below to help the customer read their meter.</p>
            <div className="flex flex-wrap gap-2">
                <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://www.scottishpower.co.uk/energy-efficiency/smart-meters/read-your-meter" target="_blank" rel="noopener noreferrer">
                        How to read Smart Meters <ExternalLink className="ml-1 h-4 w-4"/>
                    </a>
                </Button>
                 <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://www.scottishpower.co.uk/support-centre/meter-reading" target="_blank" rel="noopener noreferrer">
                       How to read Legacy (BAU) meters <ExternalLink className="ml-1 h-4 w-4"/>
                    </a>
                </Button>
            </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
               <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb className="h-4 w-4" />
                How to Bill the Account in UI5
              </div>
            </AccordionTrigger>
            <AccordionContent>
                <AlertDescription className="pt-2 text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                    <li>Click the orange "Bill Account" button on the UI5 home page.</li>
                    <li>Alternatively, use the "Submit Meter Readings" option in the UI5 menu.</li>
                    <li><strong>Hint:</strong> If neither option is available, try the "Manage Bank Details" button on the home page or speak to POD support.</li>
                    </ul>
                </AlertDescription>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Billing Outcome */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Billing Outcome</Label>
          <RadioGroup value={billingOutcome} onValueChange={(value) => setBillingOutcome(value as BillingOutcome)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="billed" id="outcome-billed" />
              <Label htmlFor="outcome-billed">Bill Produced</Label>
            </div>
            {billingOutcome === 'billed' && (
              <div className="pl-6">
                <Label htmlFor="billAmount">Total (£)</Label>
                <Input id="billAmount" type="number" placeholder="0.00" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} className="mt-1 max-w-xs" />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="billed_4_days" id="outcome-billed-4" />
              <Label htmlFor="outcome-billed-4">No Bill - Billed in last 4 days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="back_office_10" id="outcome-bo-10" />
              <Label htmlFor="outcome-bo-10">No Bill - Sent to back office (10 working days)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="back_office_15" id="outcome-bo-15" />
              <Label htmlFor="outcome-bo-15">No Bill - Sent to back office (15 working days)</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Meter Configuration and Readings (Optional) */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Optional: Note Meter Readings</Label>
          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <RadioGroup value={fuelType} onValueChange={(value) => setFuelType(value as 'electric' | 'gas' | 'both')} className="flex space-x-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="electric" id="mr-electric" /><Label htmlFor="mr-electric">Elec</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="gas" id="mr-gas" /><Label htmlFor="mr-gas">Gas</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="mr-both" /><Label htmlFor="mr-both">Both</Label></div>
            </RadioGroup>
          </div>
          {showElectricFields && (
            <div className="space-y-2">
              <Label>Number of Electricity Rates</Label>
              <RadioGroup value={String(numElectricRates)} onValueChange={(value) => setNumElectricRates(Number(value) as 1 | 2 | 3)} className="flex space-x-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="mr-rate-1" /><Label htmlFor="mr-rate-1">1</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="mr-rate-2" /><Label htmlFor="mr-rate-2">2</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="mr-rate-3" /><Label htmlFor="mr-rate-3">3</Label></div>
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showElectricFields && (
            <div className="space-y-2">
              <Label htmlFor="elecRate1">Elec Reading R1</Label>
              <Input id="elecRate1" type="number" placeholder="00000" value={elecRate1} onChange={(e) => setElecRate1(e.target.value)} />
            </div>
          )}
          {showElectricFields && numElectricRates >= 2 && (
            <div className="space-y-2">
              <Label htmlFor="elecRate2">Elec Reading R2</Label>
              <Input id="elecRate2" type="number" placeholder="00000" value={elecRate2} onChange={(e) => setElecRate2(e.target.value)} />
            </div>
          )}
          {showElectricFields && numElectricRates === 3 && (
            <div className="space-y-2">
              <Label htmlFor="elecRate3">Elec Reading R3</Label>
              <Input id="elecRate3" type="number" placeholder="00000" value={elecRate3} onChange={(e) => setElecRate3(e.target.value)} />
            </div>
          )}
          {showGasFields && (
            <div className="space-y-2">
              <Label htmlFor="gasReading">Gas Reading</Label>
              <Input id="gasReading" type="number" placeholder="00000" value={gasReading} onChange={(e) => setGasReading(e.target.value)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
