
"use client";

import type * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnergyTariffComparisonSchema, type EnergyTariffComparisonFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import { useResults, type ResultsSection } from "@/lib/results-context";

const DAYS_IN_YEAR = 365.25; 
const MONTHS_IN_YEAR = 12;

export function EnergyTariffComparisonTool() {
  const { setResults } = useResults();
  const [fuelType, setFuelType] = useState<'electric' | 'gas' | 'both'>('both');
  const [numElectricRates, setNumElectricRates] = useState<1 | 2 | 3>(1);

  const form = useForm<EnergyTariffComparisonFormValues>({
    resolver: zodResolver(EnergyTariffComparisonSchema),
    defaultValues: {
      usageData: { electricityUsage1: '', electricityUsage2: '', electricityUsage3: '', gasUsage: '' },
      tariffs: [{ name: "", electricityStandingCharge: '', electricityUnitRate1: '', electricityUnitRate2: '', electricityUnitRate3: '', gasStandingCharge: '', gasUnitRate: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tariffs",
  });

  useEffect(() => {
    if (fuelType === 'gas') {
      form.resetField("usageData.electricityUsage1");
      form.resetField("usageData.electricityUsage2");
      form.resetField("usageData.electricityUsage3");
    } else if (fuelType === 'electric') {
      form.resetField("usageData.gasUsage");
    }
    if (numElectricRates < 3) form.resetField("usageData.electricityUsage3");
    if (numElectricRates < 2) form.resetField("usageData.electricityUsage2");

    fields.forEach((_field, index) => {
      if (fuelType === 'gas') {
        form.setValue(`tariffs.${index}.electricityStandingCharge`, '' as any);
        form.setValue(`tariffs.${index}.electricityUnitRate1`, '' as any);
        form.setValue(`tariffs.${index}.electricityUnitRate2`, '' as any);
        form.setValue(`tariffs.${index}.electricityUnitRate3`, '' as any);
      } else if (fuelType === 'electric') {
        form.setValue(`tariffs.${index}.gasStandingCharge`, '' as any);
        form.setValue(`tariffs.${index}.gasUnitRate`, '' as any);
      }
      if (numElectricRates < 3) form.setValue(`tariffs.${index}.electricityUnitRate3`, '' as any);
      if (numElectricRates < 2) form.setValue(`tariffs.${index}.electricityUnitRate2`, '' as any);
    });
    setResults(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelType, numElectricRates, form.resetField, form.setValue, fields.length]);

  const watchedUsageData = JSON.stringify(form.watch("usageData"));
  const watchedTariffs = JSON.stringify(form.watch("tariffs"));

  useEffect(() => {
    const usageData = JSON.parse(watchedUsageData);
    const tariffs = JSON.parse(watchedTariffs) || [];

    const hasAnyData = [usageData?.electricityUsage1, usageData?.electricityUsage2, usageData?.electricityUsage3, usageData?.gasUsage].some(v => v !== '' && v !== undefined) ||
      tariffs?.some(t => t.name || t.electricityStandingCharge || t.electricityUnitRate1 || t.gasStandingCharge || t.gasUnitRate);

    if (!hasAnyData) {
      setResults(null);
      return;
    }

    const calculatedResults: { name: string; annualCost: number; monthlyCost: number }[] = tariffs.map(tariff => {
      let annualElecUsageCost = 0, annualElecSC = 0, totalAnnualElecCost = 0;
      let annualGasUsageCost = 0, annualGasSC = 0, totalAnnualGasCost = 0;

      if (fuelType === 'electric' || fuelType === 'both') {
        const elecUsage1 = parseFloat(String(usageData?.electricityUsage1)) || 0;
        const elecSCRate = (parseFloat(String(tariff.electricityStandingCharge)) || 0) / 100;
        const elecRate1 = (parseFloat(String(tariff.electricityUnitRate1)) || 0) / 100;
        annualElecSC = elecSCRate * DAYS_IN_YEAR;
        annualElecUsageCost += (elecUsage1 * elecRate1);

        if (numElectricRates >= 2) {
          const elecUsage2 = parseFloat(String(usageData?.electricityUsage2)) || 0;
          const elecRate2 = (parseFloat(String(tariff.electricityUnitRate2)) || 0) / 100;
          annualElecUsageCost += (elecUsage2 * elecRate2);
        }
        if (numElectricRates === 3) {
          const elecUsage3 = parseFloat(String(usageData?.electricityUsage3)) || 0;
          const elecRate3 = (parseFloat(String(tariff.electricityUnitRate3)) || 0) / 100;
          annualElecUsageCost += (elecUsage3 * elecRate3);
        }
        totalAnnualElecCost = annualElecSC + annualElecUsageCost;
      }
      
      if (fuelType === 'gas' || fuelType === 'both') {
        const gasUsageVal = parseFloat(String(usageData?.gasUsage)) || 0;
        const gasSCRate = (parseFloat(String(tariff.gasStandingCharge)) || 0) / 100;
        const gasRateVal = (parseFloat(String(tariff.gasUnitRate)) || 0) / 100;
        annualGasSC = gasSCRate * DAYS_IN_YEAR;
        annualGasUsageCost = gasUsageVal * gasRateVal;
        totalAnnualGasCost = annualGasSC + annualGasUsageCost;
      }
      
      const totalAnnualCost = totalAnnualElecCost + totalAnnualGasCost;
      const monthlyCost = totalAnnualCost / MONTHS_IN_YEAR;

      return { name: tariff.name, annualCost: totalAnnualCost, monthlyCost: monthlyCost };
    });

    const sorted = [...calculatedResults].sort((a, b) => a.annualCost - b.annualCost);

    const group: ResultsSection[] = sorted.map((res, index) => ({
      label: res.name || `Tariff ${index + 1}`,
      value: `£${res.monthlyCost.toFixed(2)}/mo · £${res.annualCost.toFixed(2)}/yr`,
      highlight: index === 0 && sorted.length > 1,
    }));

    if (sorted.length > 1) {
      const cheapest = sorted[0];
      const mostExpensive = sorted[sorted.length - 1];
      const saving = mostExpensive.annualCost - cheapest.annualCost;
      if (saving > 0) {
        group.push({
          label: "Potential Saving",
          value: `£${saving.toFixed(2)}/yr`,
          highlight: true,
        });
      }
    }

    setResults({ title: "Tariff Comparison", groups: [group] });
  }, [watchedUsageData, watchedTariffs, fuelType, numElectricRates, setResults]);

  const addNewTariff = () => {
    append({ name: "", electricityStandingCharge: '', electricityUnitRate1: '', electricityUnitRate2: '', electricityUnitRate3: '', gasStandingCharge: '', gasUnitRate: '' });
  };

  const showElectricFields = fuelType === 'electric' || fuelType === 'both';
  const showGasFields = fuelType === 'gas' || fuelType === 'both';

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Energy Tariff Comparison</CardTitle>
        <CardDescription>Compare different energy tariffs based on your annual usage data. Enter rates in pence. All fuel/rate inputs are optional.</CardDescription>
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
                    <div className="flex items-center space-x-2"><RadioGroupItem value="electric" id="tc-electric" /><Label htmlFor="tc-electric">Electricity Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="gas" id="tc-gas" /><Label htmlFor="tc-gas">Gas Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="tc-both" /><Label htmlFor="tc-both">Gas & Electricity</Label></div>
                  </RadioGroup>
                </FormItem>
                {showElectricFields && (
                  <FormItem>
                    <FormLabel>Number of Electricity Rates (for usage input)</FormLabel>
                    <RadioGroup value={String(numElectricRates)} onValueChange={(value) => setNumElectricRates(Number(value) as 1 | 2 | 3)} className="flex flex-col sm:flex-row sm:space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="tc-rate-1" /><Label htmlFor="tc-rate-1">1 Rate</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="tc-rate-2" /><Label htmlFor="tc-rate-2">2 Rates</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="tc-rate-3" /><Label htmlFor="tc-rate-3">3 Rates</Label></div>
                    </RadioGroup>
                  </FormItem>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-xl">Annual Usage Data</CardTitle><CardDescription>Enter your estimated annual energy consumption.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {showElectricFields && (<FormField control={form.control} name="usageData.electricityUsage1" render={({ field }) => (<FormItem><FormLabel>Elec. Usage R1 (kWh/yr)</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., 2000" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />)}
                {showElectricFields && numElectricRates >= 2 && (<FormField control={form.control} name="usageData.electricityUsage2" render={({ field }) => (<FormItem><FormLabel>Elec. Usage R2 (kWh/yr)</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., 500" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />)}
                {showElectricFields && numElectricRates === 3 && (<FormField control={form.control} name="usageData.electricityUsage3" render={({ field }) => (<FormItem><FormLabel>Elec. Usage R3 (kWh/yr)</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., 200" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />)}
                {showGasFields && (<FormField control={form.control} name="usageData.gasUsage" render={({ field }) => (<FormItem><FormLabel>Gas Usage (kWh/yr)</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., 12000" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-xl">Tariff Details</CardTitle><CardDescription>Add one or more tariffs to compare. All rate/charge fields are optional.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                {fields.map((item, index) => (
                  <Card key={item.id} className="p-4 relative border shadow-md">
                    <CardHeader className="p-2"><CardTitle className="text-lg flex justify-between items-center">Tariff {index + 1}
                        {fields.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive"><Trash2 className="h-4 w-4" /></Button>)}
                      </CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-2">
                      <FormField control={form.control} name={`tariffs.${index}.name`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Tariff Name</FormLabel><FormControl><Input placeholder="e.g., Standard Saver" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      {showElectricFields && (<>
                        <FormField control={form.control} name={`tariffs.${index}.electricityStandingCharge`} render={({ field }) => (<FormItem><FormLabel>Elec. Standing Charge (p/day)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`tariffs.${index}.electricityUnitRate1`} render={({ field }) => (<FormItem><FormLabel>Elec. Unit Rate 1 (p/kWh)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="e.g., 25.2" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
                        {numElectricRates >= 2 && <FormField control={form.control} name={`tariffs.${index}.electricityUnitRate2`} render={({ field }) => (<FormItem><FormLabel>Elec. Unit Rate 2 (p/kWh)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="e.g., 20.1" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />}
                        {numElectricRates === 3 && <FormField control={form.control} name={`tariffs.${index}.electricityUnitRate3`} render={({ field }) => (<FormItem><FormLabel>Elec. Unit Rate 3 (p/kWh)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="e.g., 18.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />}
                      </>)}
                      {showGasFields && (<>
                        <FormField control={form.control} name={`tariffs.${index}.gasStandingCharge`} render={({ field }) => (<FormItem><FormLabel>Gas Standing Charge (p/day)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 29.0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`tariffs.${index}.gasUnitRate`} render={({ field }) => (<FormItem><FormLabel>Gas Unit Rate (p/kWh)</FormLabel><FormControl><Input type="number" step="0.001" placeholder="e.g., 7.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/></FormControl><FormMessage /></FormItem>)} />
                      </>)}
                    </CardContent>
                  </Card>))}
                <Button type="button" variant="outline" onClick={addNewTariff} className="mt-4 w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Another Tariff</Button>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter><Button type="submit" className="w-full">Compare Tariffs</Button></CardFooter>
        </form>
      </Form>
    </Card>);
}
