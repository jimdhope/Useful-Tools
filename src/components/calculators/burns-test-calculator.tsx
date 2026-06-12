
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BurnsTestSchema, type BurnsTestFormValues } from "@/lib/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useResults, type ResultsSection } from "@/lib/results-context";

interface DailyDifference {
  day: string;
  difference: string;
}

const initialDailyDifferences = (): DailyDifference[] => [
  { day: "Day 1 to 2", difference: "0 kWh" }, { day: "Day 2 to 3", difference: "0 kWh" },
  { day: "Day 3 to 4", difference: "0 kWh" }, { day: "Day 4 to 5", difference: "0 kWh" },
  { day: "Day 5 to 6", difference: "0 kWh" }, { day: "Day 6 to 7", difference: "0 kWh" },
];

const dayKeysArray = ["day1", "day2", "day3", "day4", "day5", "day6", "day7"] as const;
type DayKey = typeof dayKeysArray[number];

export function BurnsTestCalculator() {
  const { setResults } = useResults();
  const [fuelType, setFuelType] = React.useState<'electric' | 'gas' | 'both'>('both');
  const [numElectricRates, setNumElectricRates] = React.useState<1 | 2 | 3>(1);

  const form = useForm<BurnsTestFormValues>({
    resolver: zodResolver(BurnsTestSchema),
    defaultValues: {
      electricityRate1Readings: { day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
      electricityRate2Readings: { day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
      electricityRate3Readings: { day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
      gasReadings: { day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
    },
  });

  React.useEffect(() => {
    const resetReadings = (rateKey: keyof BurnsTestFormValues) => {
      dayKeysArray.forEach(dayKey => form.resetField(`${rateKey}.${dayKey}` as any));
    };

    if (fuelType === 'gas') {
      resetReadings("electricityRate1Readings");
      resetReadings("electricityRate2Readings");
      resetReadings("electricityRate3Readings");
    } else if (fuelType === 'electric') {
      resetReadings("gasReadings");
    }

    if (numElectricRates < 3) resetReadings("electricityRate3Readings");
    if (numElectricRates < 2) resetReadings("electricityRate2Readings");
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelType, numElectricRates, form.resetField]);

  const electricityRate1Readings = form.watch("electricityRate1Readings");
  const electricityRate2Readings = form.watch("electricityRate2Readings");
  const electricityRate3Readings = form.watch("electricityRate3Readings");
  const gasReadings = form.watch("gasReadings");

  function calculateDifferences(readings?: BurnsTestFormValues[keyof Pick<BurnsTestFormValues, "electricityRate1Readings" | "electricityRate2Readings" | "electricityRate3Readings" | "gasReadings">]): { daily: DailyDifference[], total: number } {
    const newDifferences: DailyDifference[] = initialDailyDifferences();
    let total = 0;
    if (readings) {
      const dayValues = dayKeysArray.map(key => readings[key]);
      const numericReadings = dayValues.map(val => {
        const num = parseFloat(String(val));
        return isNaN(num) ? undefined : num;
      });

      for (let i = 0; i < 6; i++) {
        if (numericReadings[i+1] !== undefined && numericReadings[i] !== undefined && numericReadings[i+1]! >= numericReadings[i]!) {
          const diff = numericReadings[i+1]! - numericReadings[i]!;
          newDifferences[i].difference = `${diff.toFixed(0)} kWh`;
          total += diff;
        } else {
          newDifferences[i].difference = "N/A";
        }
      }
    } else {
       newDifferences.forEach(d => d.difference = "N/A");
    }
    return { daily: newDifferences, total };
  }

  const r1Calcs = calculateDifferences(electricityRate1Readings);
  const r2Calcs = calculateDifferences(electricityRate2Readings);
  const r3Calcs = calculateDifferences(electricityRate3Readings);
  const gasCalcs = calculateDifferences(gasReadings);

  React.useEffect(() => {
    const groups: ResultsSection[][] = [];
    const hasData = [electricityRate1Readings, electricityRate2Readings, electricityRate3Readings, gasReadings]
      .some(r => r && Object.values(r).some(v => v !== ''));

    if (!hasData) {
      setResults(null);
      return;
    }

    const addRateResults = (name: string, calcs: { daily: DailyDifference[], total: number }) => {
      const hasRateData = calcs.daily.some(d => d.difference !== "N/A" && d.difference !== "0 kWh") || calcs.total !== 0;
      if (!hasRateData) return;

      const group: ResultsSection[] = [
        { label: `${name} - Total`, value: `${calcs.total.toFixed(0)} kWh`, highlight: true },
        ...calcs.daily.map(d => ({ label: d.day, value: d.difference })),
      ];
      groups.push(group);
    };

    if (fuelType === 'electric' || fuelType === 'both') {
      addRateResults("Electricity Rate 1", r1Calcs);
      if (numElectricRates >= 2) addRateResults("Electricity Rate 2", r2Calcs);
      if (numElectricRates === 3) addRateResults("Electricity Rate 3", r3Calcs);
    }
    if (fuelType === 'gas' || fuelType === 'both') {
      addRateResults("Gas", gasCalcs);
    }

    if (groups.length > 0) {
      setResults({ title: "Burns Test", groups });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electricityRate1Readings, electricityRate2Readings, electricityRate3Readings, gasReadings, fuelType, numElectricRates, setResults]);

  function renderReadingFields(rateKey: keyof BurnsTestFormValues, rateLabel: string) {
    const content = (
      <div className="space-y-4 mb-6 p-4 border rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-primary">{rateLabel}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {dayKeysArray.map((dayKey: DayKey) => (
            <FormField
              key={`${String(rateKey)}.${dayKey}`}
              control={form.control}
              name={`${String(rateKey)}.${dayKey}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day {dayKey.substring(3)}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    );
    return content;
  }

  const showElectricFields = fuelType === 'electric' || fuelType === 'both';
  const showGasFields = fuelType === 'gas' || fuelType === 'both';

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Burns Test Calculator</CardTitle>
            <CardDescription>Enter 7 daily meter readings to calculate consumption. All reading inputs are optional.</CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-xl">Meter Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                  <FormLabel>Select Fuel Type</FormLabel>
                  <RadioGroup value={fuelType} onValueChange={(value) => setFuelType(value as 'electric' | 'gas' | 'both')} className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="electric" id="bt-electric" /><Label htmlFor="bt-electric">Electricity Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="gas" id="bt-gas" /><Label htmlFor="bt-gas">Gas Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="bt-both" /><Label htmlFor="bt-both">Gas & Electricity</Label></div>
                  </RadioGroup>
                </FormItem>
                {showElectricFields && (
                  <FormItem>
                    <FormLabel>Number of Electricity Rates</FormLabel>
                    <RadioGroup value={String(numElectricRates)} onValueChange={(value) => setNumElectricRates(Number(value) as 1 | 2 | 3)} className="flex flex-col sm:flex-row sm:space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="bt-rate-1" /><Label htmlFor="bt-rate-1">1 Rate</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="bt-rate-2" /><Label htmlFor="bt-rate-2">2 Rates</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="bt-rate-3" /><Label htmlFor="bt-rate-3">3 Rates</Label></div>
                    </RadioGroup>
                  </FormItem>
                )}
              </CardContent>
            </Card>

            {showElectricFields && renderReadingFields("electricityRate1Readings", "Electricity Rate 1")}
            {showElectricFields && numElectricRates >= 2 && renderReadingFields("electricityRate2Readings", "Electricity Rate 2")}
            {showElectricFields && numElectricRates === 3 && renderReadingFields("electricityRate3Readings", "Electricity Rate 3")}
            {showGasFields && renderReadingFields("gasReadings", "Gas")}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
