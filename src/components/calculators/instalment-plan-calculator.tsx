
"use client";

import type * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InstalmentPlanSchema, type InstalmentPlanFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, addMonths, addDays, getDay, parseISO, startOfDay } from "date-fns";
import { useResults, type ResultsSection } from "@/lib/results-context";

export function InstalmentPlanCalculator() {
  const { setResults } = useResults();

  const form = useForm<InstalmentPlanFormValues>({
    resolver: zodResolver(InstalmentPlanSchema),
    defaultValues: {
      currentBalance: '', 
      startDate: "", 
      usageAmount: '', 
      instalmentAmount: '', 
    },
  });

  useEffect(() => {
    const defaultStartDate = startOfDay(addDays(new Date(), 15));
    form.setValue("startDate", format(defaultStartDate, "yyyy-MM-dd"));
  }, [form]);

  const watchedBalance = form.watch("currentBalance");
  const watchedUsageAmount = form.watch("usageAmount");
  const watchedStartDate = form.watch("startDate");
  const watchedInstalmentAmount = form.watch("instalmentAmount");

  useEffect(() => {
    const balance = typeof watchedBalance === 'string' ? parseFloat(watchedBalance) : watchedBalance;
    const usage = typeof watchedUsageAmount === 'string' ? parseFloat(watchedUsageAmount) : watchedUsageAmount;
    const instalmentAmount = typeof watchedInstalmentAmount === 'string' ? parseFloat(watchedInstalmentAmount) : watchedInstalmentAmount;

    const hasData = watchedBalance !== '' || watchedUsageAmount !== '' || watchedInstalmentAmount !== '';

    if (!hasData) {
      setResults(null);
      return;
    }

    const groups: ResultsSection[][] = [];
    const groupTitles: (string | undefined)[] = [];

    if (!isNaN(balance) && balance > 0) {
      const suggestedGroup: ResultsSection[] = [];
      [12, 18, 24].forEach(months => {
        const monthlyInstalment = balance / months;
        const total = !isNaN(usage) ? monthlyInstalment + usage : monthlyInstalment;
        suggestedGroup.push({
          label: `${months} Months`,
          value: `£${total.toFixed(2)}/mo`,
        });
      });
      groups.push(suggestedGroup);
      groupTitles.push("Recommended Repayment Plans");
    }

    if (watchedStartDate && !isNaN(balance) && !isNaN(usage) && !isNaN(instalmentAmount) && instalmentAmount > 0 && balance > 0) {
      const startDate = parseISO(watchedStartDate);
      if (startDate.toString() !== 'Invalid Date') {
        const totalMonthlyPayment = usage + instalmentAmount;
        const numberOfInstalments = Math.ceil(balance / instalmentAmount);

        let endDate = numberOfInstalments > 0 ? addMonths(startDate, numberOfInstalments - 1) : startDate;

        if (numberOfInstalments > 0) {
          let dayOfWeek = getDay(endDate);
          if (dayOfWeek === 6) {
            endDate = addDays(endDate, 2);
          } else if (dayOfWeek === 0) {
            endDate = addDays(endDate, 1);
          }
        }

        let finalPaymentAmount = balance % instalmentAmount;
        if (finalPaymentAmount === 0 && numberOfInstalments > 0) {
          finalPaymentAmount = instalmentAmount;
        } else if (numberOfInstalments === 1 && balance > 0) {
          finalPaymentAmount = balance;
        }

        groups.push([
          { label: "Usage Amount", value: `£${usage.toFixed(2)}` },
          { label: "Instalment Amount", value: `£${instalmentAmount.toFixed(2)}` },
          { label: "Total Monthly Payment", value: `£${totalMonthlyPayment.toFixed(2)}`, highlight: true },
          { label: "Number of Instalments", value: `${numberOfInstalments}` },
          { label: "Start Date", value: format(startDate, "dd-MM-yyyy") },
          { label: "End Date", value: format(endDate, "dd-MM-yyyy") },
          { label: "Final Payment", value: `£${finalPaymentAmount.toFixed(2)}` },
        ]);
        groupTitles.push(undefined);
      }
    }

    setResults({ title: "Instalment Plan", groups, groupTitles });
  }, [watchedBalance, watchedUsageAmount, watchedStartDate, watchedInstalmentAmount, setResults]);

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Make sure to discuss the following with the customer:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-disc space-y-1 pl-5">
              <li>We offer multiple payment methods to suit their needs (DD, PP, RCM).</li>
              <li>Let them know that they can make additional payments at any time to reduce the balance.</li>
              <li>Can they clear the balance or make a partial payment today?</li>
              <li>Do these payments may impact other essential/priority bills?</li>
              <li>Free debt advice is available from Step Change, and they may be eligible for help from the Scottish Power Hardship Fund.</li>
              <li>Provide energy efficiency advice to help reduce their future bills.</li>
              <li>When setting up an Instalment plan over 12 months, we will notify Credit Reference Agencies and it may affect their credit score.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Balance Details &amp; Suggestions</CardTitle>
            <CardDescription>Enter your current balance to see suggested plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance (£)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1200" {...field} onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? '' : parseFloat(value));
                    }}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="usageAmount" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typical Monthly Usage Amount (£)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? '' : parseFloat(value));
                    }}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter the details for your instalment plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(parseISO(field.value), "dd-MM-yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(date) => {
                           if(date) field.onChange(format(startOfDay(date), "yyyy-MM-dd"));
                        }}
                        disabled={(date) =>
                          date < startOfDay(new Date(new Date().setDate(new Date().getDate()))) 
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instalmentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount for Instalment Plan (£)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? '' : parseFloat(value));
                    }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Calculate Plan</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
