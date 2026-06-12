
"use client";

import type * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnergyUsageSchema, type EnergyUsageFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, differenceInCalendarDays, addDays, startOfDay, isValid } from "date-fns";
import { useResults, type ResultsSection } from "@/lib/results-context";

const IMPERIAL_FT3_TO_M3_FACTOR = 0.0283168;
const VOLUME_CORRECTION_FACTOR = 1.02264;
const CALORIFIC_VALUE = 40.0;
const KWH_CONVERSION_DIVISOR = 3.6;
const AVG_DAYS_IN_MONTH = 30.4375;

export function EnergyUsageCalculator() {
  const { setResults } = useResults();
  const [fuelType, setFuelType] = useState<'electric' | 'gas' | 'both'>('both');
  const [numElectricRates, setNumElectricRates] = useState<1 | 2 | 3>(1);
  const [inputMode, setInputMode] = useState<'readings' | 'direct'>('readings');
  const [numberOfDays, setNumberOfDays] = useState<number | null>(null);

  const form = useForm<EnergyUsageFormValues>({
    resolver: zodResolver(EnergyUsageSchema),
    defaultValues: {
      startDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
      endDate: format(startOfDay(addDays(new Date(), 30)), "yyyy-MM-dd"),
      inputMode: "readings",
      electricRate1: '', electricStartReading1: '', electricEndReading1: '', electricUnits1: '',
      electricRate2: '', electricStartReading2: '', electricEndReading2: '', electricUnits2: '',
      electricRate3: '', electricStartReading3: '', electricEndReading3: '', electricUnits3: '',
      electricStandingCharge: '',
      gasStartReading: '', gasEndReading: '', gasUnitType: undefined, gasUnits: '',
      gasRate: '', gasStandingCharge: '',
    },
  });

  const startDateWatcher = form.watch("startDate");
  const endDateWatcher = form.watch("endDate");
  const currentInputMode = form.watch("inputMode");

  useEffect(() => {
    if (startDateWatcher && endDateWatcher) {
      try {
        const start = parseISO(startDateWatcher);
        const end = parseISO(endDateWatcher);
        if (isValid(start) && isValid(end) && end >= start) {
          setNumberOfDays(differenceInCalendarDays(end, start) + 1);
        } else { setNumberOfDays(null); }
      } catch (e) { setNumberOfDays(null); }
    } else { setNumberOfDays(null); }
  }, [startDateWatcher, endDateWatcher]);

  useEffect(() => {
    const resetElectricFields = () => {
      form.resetField("electricRate1"); form.resetField("electricStartReading1"); form.resetField("electricEndReading1"); form.resetField("electricUnits1");
      form.resetField("electricRate2"); form.resetField("electricStartReading2"); form.resetField("electricEndReading2"); form.resetField("electricUnits2");
      form.resetField("electricRate3"); form.resetField("electricStartReading3"); form.resetField("electricEndReading3"); form.resetField("electricUnits3");
      form.resetField("electricStandingCharge");
    };
    const resetGasFields = () => {
      form.resetField("gasStartReading"); form.resetField("gasEndReading"); form.resetField("gasUnitType"); form.resetField("gasUnits");
      form.resetField("gasRate"); form.resetField("gasStandingCharge");
    };

    if (fuelType === 'gas') resetElectricFields();
    else if (fuelType === 'electric') resetGasFields();
    
    if (numElectricRates < 3) { 
      form.resetField("electricRate3"); form.resetField("electricStartReading3"); form.resetField("electricEndReading3"); form.resetField("electricUnits3");
    }
    if (numElectricRates < 2) {
      form.resetField("electricRate2"); form.resetField("electricStartReading2"); form.resetField("electricEndReading2"); form.resetField("electricUnits2");
    }
    setResults(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelType, numElectricRates, form.resetField]);

  useEffect(() => {
    if (currentInputMode === "readings") {
      form.resetField("electricUnits1"); form.resetField("electricUnits2"); form.resetField("electricUnits3");
      form.resetField("gasUnits");
    } else if (currentInputMode === "direct") {
      form.resetField("electricStartReading1"); form.resetField("electricEndReading1");
      form.resetField("electricStartReading2"); form.resetField("electricEndReading2");
      form.resetField("electricStartReading3"); form.resetField("electricEndReading3");
      form.resetField("gasStartReading"); form.resetField("gasEndReading"); form.resetField("gasUnitType");
    }
    setResults(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInputMode, form.resetField]);

  const allWatchedValues = JSON.stringify(form.watch());

  useEffect(() => {
    const parsed = JSON.parse(allWatchedValues);
    if (numberOfDays === null || numberOfDays <= 0) {
      const hasAnyInput = Object.values(parsed).some(v => v !== '' && v !== undefined);
      if (hasAnyInput) {
        setResults({ title: "Energy Usage", groups: [[{ label: "Error", value: "Invalid date range", highlight: true }]] });
      }
      return;
    }

    const data = parsed;

    let electricUsage1 = 0, electricCost1 = 0, electricUsage2 = 0, electricCost2 = 0, electricUsage3 = 0, electricCost3 = 0;
    let totalElectricStandingCharge = 0, totalElectricCost = 0;
    let rawGasUsage = 0, convertedGasUsage = 0, gasCost = 0, totalGasStandingCharge = 0, totalGasCost = 0;

    if (fuelType === 'electric' || fuelType === 'both') {
      const elRate1 = (parseFloat(String(data.electricRate1)) || 0) / 100;
      const elStandingCharge = (parseFloat(String(data.electricStandingCharge)) || 0) / 100;

      if (data.inputMode === "readings") {
        const elStart1 = parseFloat(String(data.electricStartReading1)) || 0;
        const elEnd1 = parseFloat(String(data.electricEndReading1)) || 0;
        electricUsage1 = (data.electricStartReading1 && data.electricEndReading1 && elEnd1 >= elStart1) ? (elEnd1 - elStart1) : 0;
      } else {
        electricUsage1 = parseFloat(String(data.electricUnits1)) || 0;
      }
      electricCost1 = electricUsage1 * elRate1;

      if (numElectricRates >= 2) {
        const elRate2 = (parseFloat(String(data.electricRate2)) || 0) / 100;
        if (data.inputMode === "readings") {
          const elStart2 = parseFloat(String(data.electricStartReading2)) || 0;
          const elEnd2 = parseFloat(String(data.electricEndReading2)) || 0;
          electricUsage2 = (data.electricStartReading2 && data.electricEndReading2 && elEnd2 >= elStart2) ? (elEnd2 - elStart2) : 0;
        } else {
          electricUsage2 = parseFloat(String(data.electricUnits2)) || 0;
        }
        electricCost2 = electricUsage2 * elRate2;
      }
      if (numElectricRates === 3) {
        const elRate3 = (parseFloat(String(data.electricRate3)) || 0) / 100;
         if (data.inputMode === "readings") {
          const elStart3 = parseFloat(String(data.electricStartReading3)) || 0;
          const elEnd3 = parseFloat(String(data.electricEndReading3)) || 0;
          electricUsage3 = (data.electricStartReading3 && data.electricEndReading3 && elEnd3 >= elStart3) ? (elEnd3 - elStart3) : 0;
        } else {
          electricUsage3 = parseFloat(String(data.electricUnits3)) || 0;
        }
        electricCost3 = electricUsage3 * elRate3;
      }
      totalElectricStandingCharge = elStandingCharge * numberOfDays;
      totalElectricCost = electricCost1 + electricCost2 + electricCost3 + totalElectricStandingCharge;
    }

    if (fuelType === 'gas' || fuelType === 'both') {
      const gasRateVal = (parseFloat(String(data.gasRate)) || 0) / 100;
      const gasStandingChargeVal = (parseFloat(String(data.gasStandingCharge)) || 0) / 100;

      if (data.inputMode === "readings") {
        const gasStart = parseFloat(String(data.gasStartReading)) || 0;
        const gasEnd = parseFloat(String(data.gasEndReading)) || 0;
        rawGasUsage = (data.gasStartReading && data.gasEndReading && gasEnd >= gasStart) ? (gasEnd - gasStart) : 0;
        
        if (data.gasUnitType && rawGasUsage > 0) { 
          if (data.gasUnitType === "metric") {
            convertedGasUsage = rawGasUsage * VOLUME_CORRECTION_FACTOR * CALORIFIC_VALUE / KWH_CONVERSION_DIVISOR;
          } else {
            convertedGasUsage = rawGasUsage * IMPERIAL_FT3_TO_M3_FACTOR * VOLUME_CORRECTION_FACTOR * CALORIFIC_VALUE / KWH_CONVERSION_DIVISOR;
          }
        }
      } else {
        convertedGasUsage = parseFloat(String(data.gasUnits)) || 0;
        rawGasUsage = 0;
      }
      gasCost = convertedGasUsage * gasRateVal;
      totalGasStandingCharge = gasStandingChargeVal * numberOfDays;
      totalGasCost = gasCost + totalGasStandingCharge;
    }

    const totalCostForPeriod = totalElectricCost + totalGasCost;
    const dailyCost = totalCostForPeriod / numberOfDays;
    const monthlyCost = dailyCost * AVG_DAYS_IN_MONTH;
    const yearlyCost = dailyCost * 365.25;

    const groups: ResultsSection[][] = [];

    const hasAnyElectricData = fuelType !== 'gas' && (
      data.electricRate1 || data.electricStartReading1 || data.electricEndReading1 || data.electricUnits1 ||
      data.electricStandingCharge
    );
    const hasAnyGasData = fuelType !== 'electric' && (
      data.gasRate || data.gasStartReading || data.gasEndReading || data.gasUnits ||
      data.gasStandingCharge
    );

    if (hasAnyElectricData) {
      groups.push([
        { label: "Period", value: `${numberOfDays} days` },
        { label: "Rate 1 Usage", value: `${electricUsage1.toFixed(2)} kWh` },
        { label: "Rate 1 Cost", value: `£${electricCost1.toFixed(2)}` },
        ...(numElectricRates >= 2 ? [
          { label: "Rate 2 Usage", value: `${electricUsage2.toFixed(2)} kWh` },
          { label: "Rate 2 Cost", value: `£${electricCost2.toFixed(2)}` },
        ] : []),
        ...(numElectricRates === 3 ? [
          { label: "Rate 3 Usage", value: `${electricUsage3.toFixed(2)} kWh` },
          { label: "Rate 3 Cost", value: `£${electricCost3.toFixed(2)}` },
        ] : []),
        { label: "Standing Charge", value: `£${totalElectricStandingCharge.toFixed(2)}` },
        { label: "Total Electricity", value: `£${totalElectricCost.toFixed(2)}`, highlight: true },
      ]);
    }

    if (hasAnyGasData) {
      groups.push([
        { label: "Raw Gas Usage", value: `${rawGasUsage.toFixed(2)} units` },
        { label: "Converted Usage", value: `${convertedGasUsage.toFixed(2)} kWh` },
        { label: "Gas Cost", value: `£${gasCost.toFixed(2)}` },
        { label: "Standing Charge", value: `£${totalGasStandingCharge.toFixed(2)}` },
        { label: "Total Gas", value: `£${totalGasCost.toFixed(2)}`, highlight: true },
      ]);
    }

    if (hasAnyElectricData || hasAnyGasData) {
      groups.push([
        { label: "Total Cost", value: `£${totalCostForPeriod.toFixed(2)}`, highlight: true },
        { label: "Daily Cost", value: `£${dailyCost.toFixed(2)}` },
        { label: "Monthly Cost", value: `£${monthlyCost.toFixed(2)}` },
        { label: "Yearly Cost", value: `£${yearlyCost.toFixed(2)}` },
      ]);
    }

    if (hasAnyElectricData || hasAnyGasData) {
      setResults({ title: "Energy Usage", groups });
    } else {
      setResults(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWatchedValues, numberOfDays, fuelType, numElectricRates, setResults]);

  const renderElectricTier = (tier: 1 | 2 | 3) => {
    const rateName = `electricRate${tier}` as keyof EnergyUsageFormValues;
    const startReadingName = `electricStartReading${tier}` as keyof EnergyUsageFormValues;
    const endReadingName = `electricEndReading${tier}` as keyof EnergyUsageFormValues;
    const unitsName = `electricUnits${tier}` as keyof EnergyUsageFormValues;

    return (
      <div className="space-y-3 p-3 border rounded-md">
        <FormLabel>Electricity Rate {tier}</FormLabel>
        {currentInputMode === "readings" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <FormField control={form.control} name={startReadingName} render={({ field }) => (<FormItem><FormLabel className="text-xs">Start (kWh)</FormLabel><FormControl><Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={endReadingName} render={({ field }) => (<FormItem><FormLabel className="text-xs">End (kWh)</FormLabel><FormControl><Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={rateName} render={({ field }) => (<FormItem><FormLabel className="text-xs">Rate (p/kWh)</FormLabel><FormControl><div className="flex items-center">
                      <Input type="number" step="0.01" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                      <span className="ml-2 text-sm text-muted-foreground">p</span></div></FormControl><FormMessage /></FormItem>)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
            <FormField control={form.control} name={unitsName} render={({ field }) => (<FormItem><FormLabel className="text-xs">Units Used (kWh)</FormLabel><FormControl><Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name={rateName} render={({ field }) => (<FormItem><FormLabel className="text-xs">Rate (p/kWh)</FormLabel><FormControl><div className="flex items-center">
                      <Input type="number" step="0.01" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                      <span className="ml-2 text-sm text-muted-foreground">p</span></div></FormControl><FormMessage /></FormItem>)} />
          </div>
        )}
      </div>);
  };

  const showElectricFields = fuelType === 'electric' || fuelType === 'both';
  const showGasFields = fuelType === 'gas' || fuelType === 'both';

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Energy Usage & Cost Calculator</CardTitle>
        <CardDescription>Calculate usage from meter readings or enter usage directly to estimate costs. Rates in pence. Optional inputs are ignored if left blank.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-xl">Meter Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                  <FormLabel>Select Fuel Type</FormLabel>
                  <RadioGroup value={fuelType} onValueChange={(value) => setFuelType(value as 'electric' | 'gas' | 'both')} className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="electric" id="euc-electric" /><Label htmlFor="euc-electric">Electricity Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="gas" id="euc-gas" /><Label htmlFor="euc-gas">Gas Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="euc-both" /><Label htmlFor="euc-both">Gas & Electricity</Label></div>
                  </RadioGroup>
                </FormItem>
                {showElectricFields && (
                  <FormItem>
                    <FormLabel>Number of Electricity Rates</FormLabel>
                    <RadioGroup value={String(numElectricRates)} onValueChange={(value) => setNumElectricRates(Number(value) as 1 | 2 | 3)} className="flex flex-col sm:flex-row sm:space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="euc-rate-1" /><Label htmlFor="euc-rate-1">1 Rate</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="euc-rate-2" /><Label htmlFor="euc-rate-2">2 Rates</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="euc-rate-3" /><Label htmlFor="euc-rate-3">3 Rates</Label></div>
                    </RadioGroup>
                  </FormItem>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle className="text-xl">Date Range</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value && isValid(parseISO(field.value)) ? format(parseISO(field.value), "dd-MM-yyyy") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(startOfDay(date), "yyyy-MM-dd") : "")} initialFocus /></PopoverContent>
                      </Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value && isValid(parseISO(field.value)) ? format(parseISO(field.value), "dd-MM-yyyy") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(startOfDay(date), "yyyy-MM-dd") : "")} disabled={(date) => startDateWatcher && isValid(parseISO(startDateWatcher)) ? date < parseISO(startDateWatcher) : false} initialFocus /></PopoverContent>
                      </Popover><FormMessage /></FormItem>)} />
                <FormItem className="flex flex-col">
                  <FormLabel>Number of Days</FormLabel>
                  <Input type="number" value={numberOfDays ?? ""} readOnly placeholder="Calculated" />
                </FormItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-xl">Usage Input Method</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="inputMode"
                  render={({ field }) => (
                    <FormItem>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setInputMode(value as 'readings' | 'direct');
                        }}
                        value={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="readings" id="euc-input-readings" />
                          <Label htmlFor="euc-input-readings">Calculate from Meter Readings</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="direct" id="euc-input-direct" />
                          <Label htmlFor="euc-input-direct">Enter Usage Directly (kWh)</Label>
                        </div>
                      </RadioGroup>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showElectricFields && (
                <Card>
                  <CardHeader><CardTitle className="text-xl">Electricity Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {renderElectricTier(1)}
                    {numElectricRates >= 2 && renderElectricTier(2)}
                    {numElectricRates === 3 && renderElectricTier(3)}
                    <FormField control={form.control} name="electricStandingCharge" render={({ field }) => (
                        <FormItem className="border p-3 rounded-md"><FormLabel>Standing Charge (p/day)</FormLabel><FormControl>
                           <div className="flex items-center">
                            <Input type="number" step="0.01" placeholder="Charge" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                            <span className="ml-2 text-sm text-muted-foreground">p</span></div></FormControl>
                        <FormMessage /></FormItem>)} />
                  </CardContent>
                </Card>
              )}

              {showGasFields && (
                <Card>
                  <CardHeader><CardTitle className="text-xl">Gas Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {currentInputMode === "readings" && (
                      <>
                        <div className="space-y-3 p-3 border rounded-md"><FormLabel>Gas Readings</FormLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
                            <FormField control={form.control} name="gasStartReading" render={({ field }) => (<FormItem><FormLabel className="text-xs">Start (units)</FormLabel><FormControl><Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="gasEndReading" render={({ field }) => (<FormItem><FormLabel className="text-xs">End (units)</FormLabel><FormControl><Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                        </div>
                        <FormField control={form.control} name="gasUnitType" render={({ field }) => (
                            <FormItem className="border p-3 rounded-md"><FormLabel>Gas Unit Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""} defaultValue="">
                                <FormControl><SelectTrigger><SelectValue placeholder="Select unit type" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="metric">Metric (m³)</SelectItem><SelectItem value="imperial">Imperial (ft³)</SelectItem></SelectContent>
                              </Select>
                              <FormMessage /></FormItem>)} />
                      </>
                    )}
                    {currentInputMode === "direct" && (
                        <FormField control={form.control} name="gasUnits" render={({ field }) => (<FormItem className="border p-3 rounded-md">
                            <FormLabel>Gas Units Used (kWh)</FormLabel><FormControl>
                            <div className="flex items-center">
                                <Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                                <span className="ml-2 text-sm text-muted-foreground">kWh</span>
                            </div></FormControl><FormMessage /></FormItem>)} />
                    )}
                    <FormField control={form.control} name="gasRate" render={({ field }) => (<FormItem className="border p-3 rounded-md"><FormLabel>Gas Rate (p/kWh)</FormLabel><FormControl>
                          <div className="flex items-center">
                            <Input type="number" step="0.01" placeholder="Rate" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                            <span className="ml-2 text-sm text-muted-foreground">p</span></div></FormControl>
                         <FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="gasStandingCharge" render={({ field }) => ( <FormItem className="border p-3 rounded-md"> <FormLabel>Standing Charge (p/day)</FormLabel><FormControl>
                          <div className="flex items-center">
                            <Input type="number" step="0.01" placeholder="Charge" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                            <span className="ml-2 text-sm text-muted-foreground">p</span></div></FormControl>
                        <FormMessage /></FormItem>)} />
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Calculate Energy Usage & Cost</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
