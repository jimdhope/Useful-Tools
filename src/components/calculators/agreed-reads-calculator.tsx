
"use client";

import type * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgreedReadsSchema, type AgreedReadsFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, differenceInCalendarDays, isValid, startOfDay } from "date-fns";
import { useResults, type ResultsSection } from "@/lib/results-context";

export function AgreedReadsCalculator() {
  const { setResults } = useResults();
  const [numberOfDays, setNumberOfDays] = useState<string>("N/A");

  const [fuelType, setFuelType] = useState<'electric' | 'gas' | 'both'>('both');
  const [numElectricRates, setNumElectricRates] = useState<1 | 2 | 3>(1);

  const form = useForm<AgreedReadsFormValues>({
    resolver: zodResolver(AgreedReadsSchema),
    defaultValues: {
      startDate: "", endDate: "", proposedDate: "",
      startReading1: '', endReading1: '',
      startReading2: '', endReading2: '',
      startReading3: '', endReading3: '',
      startReadingGas: '', endReadingGas: '',
    },
  });

  const sDateStr = form.watch("startDate");
  const eDateStr = form.watch("endDate");
  const pDateStr = form.watch("proposedDate");
  const startReading1 = form.watch("startReading1");
  const endReading1 = form.watch("endReading1");
  const startReading2 = form.watch("startReading2");
  const endReading2 = form.watch("endReading2");
  const startReading3 = form.watch("startReading3");
  const endReading3 = form.watch("endReading3");
  const startReadingGas = form.watch("startReadingGas");
  const endReadingGas = form.watch("endReadingGas");

  useEffect(() => {
    if (fuelType === 'gas') {
      form.resetField("startReading1");
      form.resetField("endReading1");
      form.resetField("startReading2");
      form.resetField("endReading2");
      form.resetField("startReading3");
      form.resetField("endReading3");
    } else { 
      if (numElectricRates < 3) {
        form.resetField("startReading3");
        form.resetField("endReading3");
      }
      if (numElectricRates < 2) {
        form.resetField("startReading2");
        form.resetField("endReading2");
      }
    }
    if (fuelType === 'electric') {
      form.resetField("startReadingGas");
      form.resetField("endReadingGas");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelType, numElectricRates, form.resetField]);

  useEffect(() => {
    let newNumDays = "N/A";
    let numDaysForCalc: number | null = null;

    if (sDateStr && eDateStr && isValid(parseISO(sDateStr)) && isValid(parseISO(eDateStr))) {
      const startDateObj = parseISO(sDateStr);
      const endDateObj = parseISO(eDateStr);
      if (endDateObj > startDateObj) {
        numDaysForCalc = differenceInCalendarDays(endDateObj, startDateObj);
        newNumDays = numDaysForCalc.toString();
      }
    }
    setNumberOfDays(newNumDays);

    const groups: ResultsSection[][] = [];
    const hasData = sDateStr || eDateStr || pDateStr ||
      startReading1 || endReading1 || startReading2 || endReading2 ||
      startReading3 || endReading3 || startReadingGas || endReadingGas;

    const groupTitles: (string | undefined)[] = [];

    if (numDaysForCalc !== null && numDaysForCalc > 0) {
      groups.push([
        { label: "Billing Period", value: `${numDaysForCalc} days` },
      ]);
      groupTitles.push(undefined);
    }

    if (numDaysForCalc !== null && numDaysForCalc > 0 && pDateStr && isValid(parseISO(pDateStr)) && sDateStr && isValid(parseISO(sDateStr)) && eDateStr && isValid(parseISO(eDateStr))) {
      const endDateObj = parseISO(eDateStr);
      const proposedDateObj = parseISO(pDateStr);
      
      const daysFromProposedToEnd = differenceInCalendarDays(endDateObj, proposedDateObj);
      const totalDaysInPeriod = numDaysForCalc;

      const buildRateGroup = (startValStr: any, endValStr: any) => {
        const startNum = parseFloat(String(startValStr));
        const endNum = parseFloat(String(endValStr));
        if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
          const unitsUsed = endNum - startNum;
          const dailyAverage = unitsUsed / totalDaysInPeriod;
          const proposedReading = endNum - (dailyAverage * daysFromProposedToEnd);
          return { unitsUsed, dailyAverage, proposedReading };
        }
        return null;
      };

      if (fuelType === 'electric' || fuelType === 'both') {
        if (startReading1 || endReading1) {
          const result = buildRateGroup(startReading1, endReading1);
          if (result) {
            groups.push([
              { label: "Units Used", value: `${result.unitsUsed.toFixed(2)} kWh` },
              { label: "Daily Average", value: `${result.dailyAverage.toFixed(2)} kWh/day` },
              { label: "Proposed Reading", value: result.proposedReading.toFixed(2) },
            ]);
            groupTitles.push("Electricity Rate 1");
          }
        }
        if (numElectricRates >= 2 && (startReading2 || endReading2)) {
          const result = buildRateGroup(startReading2, endReading2);
          if (result) {
            groups.push([
              { label: "Units Used", value: `${result.unitsUsed.toFixed(2)} kWh` },
              { label: "Daily Average", value: `${result.dailyAverage.toFixed(2)} kWh/day` },
              { label: "Proposed Reading", value: result.proposedReading.toFixed(2) },
            ]);
            groupTitles.push("Electricity Rate 2");
          }
        }
        if (numElectricRates === 3 && (startReading3 || endReading3)) {
          const result = buildRateGroup(startReading3, endReading3);
          if (result) {
            groups.push([
              { label: "Units Used", value: `${result.unitsUsed.toFixed(2)} kWh` },
              { label: "Daily Average", value: `${result.dailyAverage.toFixed(2)} kWh/day` },
              { label: "Proposed Reading", value: result.proposedReading.toFixed(2) },
            ]);
            groupTitles.push("Electricity Rate 3");
          }
        }
      }
      if (fuelType === 'gas' || fuelType === 'both') {
        if (startReadingGas || endReadingGas) {
          const result = buildRateGroup(startReadingGas, endReadingGas);
          if (result) {
            groups.push([
              { label: "Units Used", value: `${result.unitsUsed.toFixed(2)} units` },
              { label: "Daily Average", value: `${result.dailyAverage.toFixed(2)} units/day` },
              { label: "Proposed Reading", value: result.proposedReading.toFixed(2) },
            ]);
            groupTitles.push("Gas");
          }
        }
      }
    }

    if (hasData && groups.length > 0) {
      setResults({ title: "Agreed Reads", groups, groupTitles });
    } else {
      setResults(null);
    }

  }, [
      sDateStr, eDateStr, pDateStr,
      startReading1, endReading1,
      startReading2, endReading2,
      startReading3, endReading3,
      startReadingGas, endReadingGas,
      fuelType, numElectricRates, setResults
    ]);

  const renderDateField = (name: keyof AgreedReadsFormValues, label: string, disabledDateFn?: (date: Date) => boolean) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                  {field.value && isValid(parseISO(field.value)) ? format(parseISO(field.value), "dd-MM-yyyy") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined}
                onSelect={(date) => field.onChange(date ? format(startOfDay(date), "yyyy-MM-dd") : "")}
                disabled={disabledDateFn}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderReadingField = (name: keyof AgreedReadsFormValues, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} (Optional)</FormLabel>
          <FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const showElectricFields = fuelType === 'electric' || fuelType === 'both';
  const showGasFields = fuelType === 'gas' || fuelType === 'both';

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Agreed Reads Calculator</CardTitle>
          <CardDescription>Estimate meter readings for a proposed date based on historical usage. All reading inputs are optional.</CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <div className="space-y-6">
            <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Meter Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormItem>
                <FormLabel>Select Fuel Type</FormLabel>
                <RadioGroup value={fuelType} onValueChange={(value) => setFuelType(value as 'electric' | 'gas' | 'both')} className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="electric" id="r-electric" />
                    <Label htmlFor="r-electric">Electricity Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gas" id="r-gas" />
                    <Label htmlFor="r-gas">Gas Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="r-both" />
                    <Label htmlFor="r-both">Gas & Electricity</Label>
                    </div>
                </RadioGroup>
                </FormItem>
                {showElectricFields && (
                <FormItem>
                    <FormLabel>Number of Electricity Rates</FormLabel>
                    <RadioGroup value={String(numElectricRates)} onValueChange={(value) => setNumElectricRates(Number(value) as 1 | 2 | 3)} className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="r-rate-1" />
                        <Label htmlFor="r-rate-1">1 Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="r-rate-2" />
                        <Label htmlFor="r-rate-2">2 Rates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="r-rate-3" />
                        <Label htmlFor="r-rate-3">3 Rates</Label>
                    </div>
                    </RadioGroup>
                </FormItem>
                )}
            </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                <CardHeader><CardTitle className="text-xl">Start Readings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {renderDateField("startDate", "Start Date")}
                    {showElectricFields && renderReadingField("startReading1", "Electricity Rate 1")}
                    {showElectricFields && numElectricRates >= 2 && renderReadingField("startReading2", "Electricity Rate 2")}
                    {showElectricFields && numElectricRates === 3 && renderReadingField("startReading3", "Electricity Rate 3")}
                    {showGasFields && renderReadingField("startReadingGas", "Gas")}
                </CardContent>
                </Card>
                <Card>
                <CardHeader><CardTitle className="text-xl">End Readings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {renderDateField("endDate", "End Date", (date) => {
                        if (!sDateStr || !isValid(parseISO(sDateStr))) return false;
                        return date <= parseISO(sDateStr);
                    })}
                    {showElectricFields && renderReadingField("endReading1", "Electricity Rate 1")}
                    {showElectricFields && numElectricRates >= 2 && renderReadingField("endReading2", "Electricity Rate 2")}
                    {showElectricFields && numElectricRates === 3 && renderReadingField("endReading3", "Electricity Rate 3")}
                    {showGasFields && renderReadingField("endReadingGas", "Gas")}
                </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-xl">Proposed Reading Date</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderDateField("proposedDate", "Proposed Reading Date", () => {
                            if (!sDateStr || !eDateStr || !isValid(parseISO(sDateStr)) || !isValid(parseISO(eDateStr))) {
                                return true; 
                            }
                            const sDateObj = parseISO(sDateStr);
                            const eDateObj = parseISO(eDateStr);
                            if (eDateObj <= sDateObj) {
                                return true; 
                            }
                            return false;
                        })}
                        <FormItem className="flex flex-col">
                            <FormLabel>Number of Days (Billing Period)</FormLabel>
                            <Input type="text" value={numberOfDays} readOnly />
                        </FormItem>
                    </div>
                </CardContent>
            </Card>
        </div>
      </Form>
    </div>
  );
}
