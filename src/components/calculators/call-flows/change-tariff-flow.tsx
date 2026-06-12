
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, getDay, isWeekend } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

export interface ChangeTariffState {
  tariffName?: string;
  usagePaymentAmount?: string;
  instalmentPaymentAmount?: string;
  paymentDate?: Date;
  summary?: string;
}

interface ChangeTariffFlowProps {
  onStateChange: (state: ChangeTariffState) => void;
}

const tariffSteps = [
    { id: 1, title: "Initiate in UI5" },
    { id: 2, title: "Ask Key Questions" },
    { id: 3, title: "Advise on Quotes" },
    { id: 4, title: "Present Tariff Options" },
    { id: 5, title: "Explain Payment Calculation" },
    { id: 6, title: "Read Important Information" },
    { id: 7, title: "Explain DD Calculation" },
    { id: 8, title: "Read Smart Script (if applicable)" },
    { id: 9, title: "Confirm Bank Details" },
    { id: 10, title: "Read Final Statement" },
    { id: 11, title: "Final Confirmation" },
    { id: 12, title: "Confirm on UI5" },
];

export function ChangeTariffFlow({ onStateChange }: ChangeTariffFlowProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    
    // State for inputs
    const [tariffName, setTariffName] = useState("");
    const [usagePaymentAmount, setUsagePaymentAmount] = useState("");
    const [instalmentPaymentAmount, setInstalmentPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState<Date | undefined>();


    useEffect(() => {
        let summary = "Details pending...";
        const usageNum = parseFloat(usagePaymentAmount);
        const ipNum = parseFloat(instalmentPaymentAmount) || 0;
        const totalPayment = (isNaN(usageNum) ? 0 : usageNum) + ipNum;

        if (tariffName || totalPayment > 0 || paymentDate) {
            let parts: string[] = [];
            if (tariffName) {
                parts.push(`Tariff changed to '${tariffName}'`);
            }
            if (totalPayment > 0) {
                 let paymentSummary = `with a monthly payment of £${totalPayment.toFixed(2)}`;
                if (ipNum > 0 && !isNaN(usageNum)) {
                    paymentSummary += ` (£${usagePaymentAmount} usage + £${instalmentPaymentAmount} IP).`;
                } else {
                    paymentSummary += '.';
                }
                parts.push(paymentSummary);
            }
            if (paymentDate) {
                parts.push(`First payment on ${format(paymentDate, "dd-MM-yyyy")}.`);
            }
            summary = parts.join(' ');
        }
        
        onStateChange({ tariffName, usagePaymentAmount, instalmentPaymentAmount, paymentDate, summary });
    }, [tariffName, usagePaymentAmount, instalmentPaymentAmount, paymentDate, onStateChange]);

    const handleStepCompletion = (stepId: number) => {
        setCompletedSteps(prev => new Set(prev).add(stepId));
        if (currentStep < tariffSteps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const getFirstAvailableDate = () => {
        let date = new Date();
        let workingDaysAdded = 0;
        // Start from today and add 10 working days
        while (workingDaysAdded < 10) {
            date = addDays(date, 1);
            if (!isWeekend(date)) { // isWeekend checks for Saturday or Sunday
                // Note: This simple check doesn't account for bank holidays.
                // A more robust solution would require a list of bank holidays.
                workingDaysAdded++;
            }
        }
        return date;
    };

    const firstAvailableDate = getFirstAvailableDate();


    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <p>In the UI5 menu, click on <strong>Change Tariff</strong>.</p>
                        <Button type="button" className="mt-4" onClick={() => handleStepCompletion(1)}>Mark as Complete</Button>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-4">
                        <p>Ask the customer the following questions:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li>What is most important to you: Cheapest Price, Green Electricity, or price certainty to protect against rising wholesale costs?</li>
                            <li>Are you a home owner?</li>
                            <li>Are you over the age of 18?</li>
                            <li>Do you have an electric vehicle that you charge at home over night?</li>
                        </ul>
                        <Button type="button" onClick={() => handleStepCompletion(2)}>Mark as Complete</Button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-3">
                        <p className="italic text-muted-foreground">"The quotes I am about to go through are based on your energy usage over the last 12 months and do not include the credit/outstanding balance on the account, this will be calculated once a tariff has been chosen."</p>
                        <Button type="button" onClick={() => handleStepCompletion(3)}>Mark as Complete</Button>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <p>Advise the customer of the current tariff options including:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Tariff Name</li>
                            <li>Fixed, Flexi, or Variable</li>
                            <li>End Date</li>
                            <li>Exit Fees</li>
                            <li>Extras (e.g., Supports Cancer Research UK, Boiler Care)</li>
                            <li>Online or Offline</li>
                        </ul>
                        <p className="font-semibold text-destructive">YOU CAN NOT ADVISE CUSTOMER WHICH TARIFF TO SELECT.</p>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="tariffName">Selected Tariff Name</Label>
                            <Input id="tariffName" value={tariffName} onChange={e => setTariffName(e.target.value)} placeholder="Enter the tariff name customer selected..."/>
                        </div>
                        <Button type="button" onClick={() => handleStepCompletion(4)}>Mark as Complete</Button>
                    </div>
                );
            case 5:
                 return (
                    <div className="space-y-3">
                        <p>Once the customer has selected a tariff, explain the calculation:</p>
                        <p className="italic text-muted-foreground">"We base your estimated annual consumption on your energy usage over the last 12 months, this was [xxxx kWh]. We then multiply this by the unit rate of [xx.xxx p/kWh] and add the daily standing charge of [xx.xxx p/day]. This gives us an estimated annual cost of [£xxxx.xx], which when divided by 12 gives your predicted monthly Electricity/Gas cost of [£xxx.xx]."</p>
                        <p className="text-sm">(Repeat for each fuel).</p>
                        <Button type="button" className="mt-4" onClick={() => handleStepCompletion(5)}>Mark as Complete</Button>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-3">
                        <p>Read out the <strong>important information</strong> at the bottom of the screen.</p>
                        <Button type="button" onClick={() => handleStepCompletion(6)}>Mark as Complete</Button>
                    </div>
                );
            case 7:
                 return (
                    <div className="space-y-3">
                        <p>Explain how the Direct Debit is calculated with the current balance:</p>
                        <p className="italic text-muted-foreground">"The system will now calculate how much your Direct Debit will be based on your current balance. If in credit, the balance will be divided by 12 and then taken off the DD amount. If the account is in debt, the balance will be divided by 12 and then added to the DD."</p>
                        <p className="text-sm">If this amount is not affordable, use the <strong>Instalment Plan Calculator</strong> to help the customer. If the plan is over 24 months, set up the tariff as if clearing within 12 months and then (with auth from pod) raise a promise to have the IP set up correctly.</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="usagePaymentAmount">Payment for Usage (£)</Label>
                                <Input id="usagePaymentAmount" type="number" value={usagePaymentAmount} onChange={e => setUsagePaymentAmount(e.target.value)} placeholder="e.g. 100.00" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="instalmentPaymentAmount">Payment for Instalment Plan (£)</Label>
                                <Input id="instalmentPaymentAmount" type="number" value={instalmentPaymentAmount} onChange={e => setInstalmentPaymentAmount(e.target.value)} placeholder="e.g. 20.00 (optional)" />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label>First Payment Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {paymentDate ? format(paymentDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={paymentDate} 
                                        onSelect={setPaymentDate} 
                                        disabled={(date) => date < firstAvailableDate || date.getDate() > 28}
                                        initialFocus 
                                    />
                                </PopoverContent>
                            </Popover>
                            <Alert className="mt-2">
                                <Lightbulb className="h-4 w-4" />
                                <AlertDescription className="text-xs space-y-1">
                                    <p><strong>Date Rules:</strong> Payments can only be set between the 1st and 28th of the month. It takes 10 working days to update a Direct Debit. Payments in the next 10 days will remain at the current amount.</p>
                                    <p><strong>Non-Working Days:</strong> If a payment date falls on a weekend or bank holiday, it will be taken the next working day.</p>
                                    <p><strong>Failed Payments:</strong> If a payment fails, we will re-attempt it twice more, each attempt being 5 working days apart.</p>
                                </AlertDescription>
                            </Alert>
                        </div>
                        <Button type="button" className="mt-4" onClick={() => handleStepCompletion(7)}>Mark as Complete</Button>
                    </div>
                );
            case 8:
                 return (
                    <div className="space-y-3">
                        <p>If the customer has smart meters installed, read out the <strong>smart script</strong>.</p>
                        <Button type="button" onClick={() => handleStepCompletion(8)}>Mark as Complete</Button>
                    </div>
                );
            case 9:
                return (
                    <div className="space-y-3">
                        <p>Confirm the bank details on the account.</p>
                        <p className="font-semibold text-destructive">Make sure these are confirmed with the bank account holder if they do not belong to the caller.</p>
                        <Button type="button" onClick={() => handleStepCompletion(9)}>Mark as Complete</Button>
                    </div>
                );
            case 10:
                return (
                    <div className="space-y-3">
                        <p>Read out the <strong>final statement</strong>.</p>
                        <Button type="button" onClick={() => handleStepCompletion(10)}>Mark as Complete</Button>
                    </div>
                );
            case 11:
                const usageNum = parseFloat(usagePaymentAmount);
                const ipNum = parseFloat(instalmentPaymentAmount) || 0;
                const totalPayment = (isNaN(usageNum) ? 0 : usageNum) + ipNum;
                return (
                    <div className="space-y-4">
                        <p>Finally, confirm the following details with the customer:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>The new tariff name: <span className="font-semibold text-foreground">{tariffName || "..."}</span></li>
                            <li>The final monthly payment amount: <span className="font-semibold text-foreground">£{totalPayment > 0 ? totalPayment.toFixed(2) : "..."}</span></li>
                            <li>The payment date: <span className="font-semibold text-foreground">{paymentDate ? format(paymentDate, "dd-MM-yyyy") : "..."}</span></li>
                        </ul>
                        <p>Advise a welcome pack will be sent to them in the next 10 working days.</p>
                        <Button type="button" onClick={() => handleStepCompletion(11)}>Mark as Complete</Button>
                    </div>
                );
            case 12:
                return (
                    <div className="space-y-3">
                        <p>Confirm the tariff change on UI5.</p>
                        <Button type="button" onClick={() => handleStepCompletion(12)}>Mark as Complete</Button>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Process Flow: Change Tariff</CardTitle>
                <CardDescription>Follow these steps to successfully change a customer's tariff.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
                {/* Stepper Navigation */}
                <div className="flex md:flex-col gap-2 md:gap-4 md:border-r md:pr-4 overflow-x-auto pb-2 md:pb-0">
                   {tariffSteps.map(step => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            className={cn(
                                "flex items-center gap-2 text-left p-2 rounded-md transition-colors w-full text-sm",
                                currentStep === step.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                                completedSteps.has(step.id) && currentStep !== step.id && "text-muted-foreground"
                            )}
                        >
                            {completedSteps.has(step.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <Circle className={cn("h-5 w-5", currentStep === step.id ? "text-primary-foreground/70" : "text-muted-foreground/50")} />
                            )}
                            <span className="shrink-0">{step.title}</span>
                        </button>
                    ))}
                </div>
                {/* Step Content */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-4">{tariffSteps.find(s => s.id === currentStep)?.title}</h3>
                    {renderStepContent()}
                </div>
            </CardContent>
        </Card>
    )
}
