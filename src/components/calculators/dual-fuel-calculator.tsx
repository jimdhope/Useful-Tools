
"use client";

import type * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DualFuelSchema, type DualFuelFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResults } from "@/lib/results-context";

export function DualFuelCalculator() {
  const { setResults } = useResults();

  const form = useForm<DualFuelFormValues>({
    resolver: zodResolver(DualFuelSchema),
    defaultValues: {
      ongoingElecUsage: '',
      elecBalance: '',
      ongoingGasUsage: '',
      gasBalance: '',
    },
  });

  const ongoingElecUsage = form.watch("ongoingElecUsage");
  const elecBalance = form.watch("elecBalance");
  const ongoingGasUsage = form.watch("ongoingGasUsage");
  const gasBalance = form.watch("gasBalance");

  useEffect(() => {
    const ongoingElecNum = Number(ongoingElecUsage) || 0;
    const elecBalanceNum = Number(elecBalance) || 0;
    const ongoingGasNum = Number(ongoingGasUsage) || 0;
    const gasBalanceNum = Number(gasBalance) || 0;

    const hasData = ongoingElecUsage !== '' || ongoingGasUsage !== '' || elecBalance !== '' || gasBalance !== '';

    if (!hasData) {
      setResults(null);
      return;
    }

    const totalOngoingUsage = ongoingElecNum + ongoingGasNum;
    const totalBalance = elecBalanceNum + gasBalanceNum;

    let debitClearanceAmount: number | null = null;
    let creditSpreadAmount: number | null = null;

    if (totalBalance < 0) {
      debitClearanceAmount = Math.abs(totalBalance) / 12;
    } else if (totalBalance > 0) {
      creditSpreadAmount = totalBalance / 12;
    }

    const groups = [
      [
        { label: "Total Usage", value: `£${totalOngoingUsage.toFixed(2)}` },
        { label: "Combined Balance", value: `£${totalBalance.toFixed(2)}`, highlight: true },
      ],
    ];

    if (debitClearanceAmount !== null) {
      groups.push([
        { label: "Debit Clearance (12mo)", value: `£${debitClearanceAmount.toFixed(2)}/mo` },
        { label: "New Monthly Payment", value: `£${(totalOngoingUsage + debitClearanceAmount).toFixed(2)}`, highlight: true },
      ]);
    }

    if (creditSpreadAmount !== null) {
      groups.push([
        { label: "Credit Spread (12mo)", value: `£${creditSpreadAmount.toFixed(2)}/mo` },
        { label: "Suggested Payment", value: `£${(Math.max(0, totalOngoingUsage - creditSpreadAmount)).toFixed(2)}`, highlight: true },
      ]);
    }

    setResults({ title: "Dual Fuel", groups });
  }, [ongoingElecUsage, elecBalance, ongoingGasUsage, gasBalance, setResults]);

  const renderInputField = (name: keyof DualFuelFormValues, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center">
              <span className="mr-2 text-muted-foreground">£</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={e => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : parseFloat(value));
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Dual Fuel Calculator</CardTitle>
        <CardDescription>
          Combine electricity and gas costs to see your total usage, balance, and a suggested payment plan for any outstanding debt.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Electricity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderInputField("ongoingElecUsage", "Ongoing Monthly Usage")}
                  {renderInputField("elecBalance", "Current Account Balance")}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Gas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderInputField("ongoingGasUsage", "Ongoing Monthly Usage")}
                  {renderInputField("gasBalance", "Current Account Balance")}
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Calculate</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
