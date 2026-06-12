
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowRight, Copy, ClipboardList, PlusCircle, MinusCircle, User, CreditCard, Wand2, RotateCcw, FileText } from "lucide-react";
import { format, parseISO, isValid, startOfDay, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SubmitMeterReadingsFlow, type MeterReadingsState } from "./call-flows/submit-meter-readings-flow";
import { BookSmartMeterAppointmentFlow, type SmartMeterAppointmentState } from "./call-flows/book-smart-meter-appointment-flow";
import { ChangeTariffFlow, type ChangeTariffState } from "./call-flows/change-tariff-flow";
import { InstalmentPlanFlow, type InstalmentPlanState } from "./call-flows/instalment-plan-flow";
import { PrePaymentMeterFlow, type PrePaymentMeterState } from "./call-flows/prepayment-meter-flow";


const callFlowSteps = [
  { id: "opening", title: "Opening / Greeting" },
  { id: "reason", title: "Reason for call" },
  { id: "dpa", title: "DPA Checks" },
  { id: "psr", title: "Updating the Priority Service Register" },
  { id: "marketing", title: "Updating Marketing Permission" },
  { id: "es-upsell", title: "ES Upsell" },
  { id: "smart-meter", title: "Smart Meter Appointment" },
  { id: "review", title: "Account Review" },
  { id: "enquiry", title: "Address customer's enquiry" },
  { id: "complaints", title: "Raise any Complaints" },
  { id: "summarise", title: "Summarise Call" },
  { id: "closing", title: "Closing the Call" },
];

const dpaQuestions = [
    { id: 'address', label: 'First line of address' },
    { id: 'postcode', label: 'Postcode' },
    { id: 'dob', label: 'Date of Birth' },
    { id: 'phone', label: 'Telephone number' },
];
const alternativeDpaQuestions = [
    { id: 'email', label: 'Email address' },
    { id: 'paymentMethod', label: 'How they pay their Energy Bill' },
    { id: 'lastPaymentAmount', label: 'Last payment amount made' },
]

const dpaUpdateOptions = [
    { id: 'Captured Phone', label: 'Captured Phone' },
    { id: 'Captured Email', label: 'Captured Email' },
    { id: 'Captured DOB', label: 'Captured DOB' },
];

type DpaChecksState = { [key: string]: boolean };
type ComplaintStatus = "none" | "ratoc" | "non-ratoc";
type AccountHolderStatus = 'unanswered' | 'yes' | 'no';
type ThirdPartyStatus = null | 'named' | 'permission_granted' | 'unauthorized_informant';
type ActiveFlow = 'submitMeterReadings' | 'bookSmartMeterAppointment' | 'changeTariff' | 'instalmentPlan' | 'prePaymentMeter';
type ActionsTakenState = { [problem: string]: string };
type SmartMeterStatus = 'pending' | 'not-ready' | 'refused' | 'booked';


const initialState = {
    openAccordionItem: "item-0",
    callerName: "",
    accountHolderStatus: 'unanswered' as AccountHolderStatus,
    thirdPartyStatus: null as ThirdPartyStatus,
    problemNotes: "",
    actionsTaken: {} as ActionsTakenState,
    dpaChecks: {} as DpaChecksState,
    automatedDpaPassed: false,
    dpaUpdates: [] as string[],
    psrUpdatedWithinMonth: null,
    psrHasFinancialFlags: null,
    psrFinancial: "",
    psrAge: "",
    psrChildren: "",
    psrHealth: "",
    marketingPermissionCompleted: false,
    esUpsellCompleted: false,
    smartMeterStatus: 'pending' as SmartMeterStatus,
    accountReviewCompleted: false,
    complaintStatus: "none" as ComplaintStatus,
    ratocReason: "",
    ratocActions: "",
    ratocRef: "",
    nonRatocReason: "",
    nonRatocAgentActions: "",
    nonRatocCustomerResolution: "",
    nonRatocRef: "",
    nonRatocDate: undefined as Date | undefined,
    nonRatocTime: "",
    activeFlows: [] as ActiveFlow[],
    meterReadingsState: {} as MeterReadingsState,
    smartMeterAppointmentState: {} as SmartMeterAppointmentState,
    changeTariffState: {} as ChangeTariffState,
    instalmentPlanState: {} as InstalmentPlanState,
    prePaymentMeterState: { assessmentAnswers: {} } as PrePaymentMeterState,
    scratchpadNotes: "",
};


export function CallFlow() {
  const { toast } = useToast();
  const [openAccordionItem, setOpenAccordionItem] = useState(initialState.openAccordionItem);
  const [callerName, setCallerName] = useState(initialState.callerName);
  const [accountHolderStatus, setAccountHolderStatus] = useState<AccountHolderStatus>(initialState.accountHolderStatus);
  const [thirdPartyStatus, setThirdPartyStatus] = useState<ThirdPartyStatus>(initialState.thirdPartyStatus);
  const [problemNotes, setProblemNotes] = useState(initialState.problemNotes);
  const [actionsTaken, setActionsTaken] = useState<ActionsTakenState>(initialState.actionsTaken);
  
  const [dpaChecks, setDpaChecks] = useState<DpaChecksState>(initialState.dpaChecks);
  const [automatedDpaPassed, setAutomatedDpaPassed] = useState(initialState.automatedDpaPassed);
  const [dpaUpdates, setDpaUpdates] = useState<string[]>(initialState.dpaUpdates);
  const [psrUpdatedWithinMonth, setPsrUpdatedWithinMonth] = useState<boolean | null>(initialState.psrUpdatedWithinMonth);
  const [psrHasFinancialFlags, setPsrHasFinancialFlags] = useState<boolean | null>(initialState.psrHasFinancialFlags);
  const [psrFinancial, setPsrFinancial] = useState(initialState.psrFinancial);
  const [psrAge, setPsrAge] = useState(initialState.psrAge);
  const [psrChildren, setPsrChildren] = useState(initialState.psrChildren);
  const [psrHealth, setPsrHealth] = useState(initialState.psrHealth);
  const [marketingPermissionCompleted, setMarketingPermissionCompleted] = useState(initialState.marketingPermissionCompleted);
  const [esUpsellCompleted, setEsUpsellCompleted] = useState(initialState.esUpsellCompleted);
  const [smartMeterStatus, setSmartMeterStatus] = useState<SmartMeterStatus>(initialState.smartMeterStatus);
  const [accountReviewCompleted, setAccountReviewCompleted] = useState(initialState.accountReviewCompleted);
  const [complaintStatus, setComplaintStatus] = useState<ComplaintStatus>(initialState.complaintStatus);
  const [ratocReason, setRatocReason] = useState(initialState.ratocReason);
  const [ratocActions, setRatocActions] = useState(initialState.ratocActions);
  const [ratocRef, setRatocRef] = useState(initialState.ratocRef);
  const [nonRatocReason, setNonRatocReason] = useState(initialState.nonRatocReason);
  const [nonRatocAgentActions, setNonRatocAgentActions] = useState(initialState.nonRatocAgentActions);
  const [nonRatocCustomerResolution, setNonRatocCustomerResolution] = useState(initialState.nonRatocCustomerResolution);
  const [nonRatocRef, setNonRatocRef] = useState(initialState.nonRatocRef);
  const [nonRatocDate, setNonRatocDate] = useState<Date | undefined>(initialState.nonRatocDate);
  const [nonRatocTime, setNonRatocTime] = useState(initialState.nonRatocTime);
  const [scratchpadNotes, setScratchpadNotes] = useState(initialState.scratchpadNotes);


  // State for active flows
  const [activeFlows, setActiveFlows] = useState<ActiveFlow[]>(initialState.activeFlows);
  const [meterReadingsState, setMeterReadingsState] = useState<MeterReadingsState>(initialState.meterReadingsState);
  const [smartMeterAppointmentState, setSmartMeterAppointmentState] = useState<SmartMeterAppointmentState>(initialState.smartMeterAppointmentState);
  const [changeTariffState, setChangeTariffState] = useState<ChangeTariffState>(initialState.changeTariffState);
  const [instalmentPlanState, setInstalmentPlanState] = useState<InstalmentPlanState>(initialState.instalmentPlanState);
  const [prePaymentMeterState, setPrePaymentMeterState] = useState<PrePaymentMeterState>(initialState.prePaymentMeterState);


  const handleResetFlow = () => {
    setOpenAccordionItem(initialState.openAccordionItem);
    setCallerName(initialState.callerName);
    setAccountHolderStatus(initialState.accountHolderStatus);
    setThirdPartyStatus(initialState.thirdPartyStatus);
    setProblemNotes(initialState.problemNotes);
    setActionsTaken(initialState.actionsTaken);
    setDpaChecks(initialState.dpaChecks);
    setAutomatedDpaPassed(initialState.automatedDpaPassed);
    setDpaUpdates(initialState.dpaUpdates);
    setPsrUpdatedWithinMonth(initialState.psrUpdatedWithinMonth);
    setPsrHasFinancialFlags(initialState.psrHasFinancialFlags);
    setPsrFinancial(initialState.psrFinancial);
    setPsrAge(initialState.psrAge);
    setPsrChildren(initialState.psrChildren);
    setPsrHealth(initialState.psrHealth);
    setMarketingPermissionCompleted(initialState.marketingPermissionCompleted);
    setEsUpsellCompleted(initialState.esUpsellCompleted);
    setSmartMeterStatus(initialState.smartMeterStatus);
    setAccountReviewCompleted(initialState.accountReviewCompleted);
    setComplaintStatus(initialState.complaintStatus);
    setRatocReason(initialState.ratocReason);
    setRatocActions(initialState.ratocActions);
    setRatocRef(initialState.ratocRef);
    setNonRatocReason(initialState.nonRatocReason);
    setNonRatocAgentActions(initialState.nonRatocAgentActions);
    setNonRatocCustomerResolution(initialState.nonRatocCustomerResolution);
    setNonRatocRef(initialState.nonRatocRef);
    setNonRatocDate(initialState.nonRatocDate);
    setNonRatocTime(initialState.nonRatocTime);
    setActiveFlows(initialState.activeFlows);
    setMeterReadingsState(initialState.meterReadingsState);
    setSmartMeterAppointmentState(initialState.smartMeterAppointmentState);
    setChangeTariffState(initialState.changeTariffState);
    setInstalmentPlanState(initialState.instalmentPlanState);
    setPrePaymentMeterState(initialState.prePaymentMeterState);
    setScratchpadNotes(initialState.scratchpadNotes);

    // Set active accordion to the first item
    setOpenAccordionItem("item-0");
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const toggleFlow = (flow: ActiveFlow) => {
    setActiveFlows(prev => 
      prev.includes(flow) 
        ? prev.filter(f => f !== flow) 
        : [...prev, flow]
    );
  };

  const handleInstalmentPlanFlowToggle = () => {
    setActiveFlows(prev => {
      const instalmentPlanActive = prev.includes('instalmentPlan');
      const flowsToToggle: ActiveFlow[] = ['instalmentPlan', 'submitMeterReadings', 'changeTariff'];
      
      if (instalmentPlanActive) {
        // If it's active, remove the group
        return prev.filter(f => !flowsToToggle.includes(f));
      } else {
        // If it's not active, add the group, avoiding duplicates
        const newFlows = new Set([...prev, ...flowsToToggle]);
        return Array.from(newFlows);
      }
    });
  };

  const toggleDpaUpdate = (update: string) => {
    setDpaUpdates(prev => 
        prev.includes(update) 
            ? prev.filter(u => u !== update) 
            : [...prev, update]
    );
  };

  const dpaPassedCount = Object.values(dpaChecks).filter(Boolean).length;
  const isDpaPassed = dpaPassedCount >= 4 || automatedDpaPassed;
  
  const advanceToNextStep = (currentStepIndex: number) => {
    let nextStepIndex = currentStepIndex + 1;
    // If automated DPA passed, skip the DPA step
    if (automatedDpaPassed && callFlowSteps[nextStepIndex]?.id === 'dpa') {
        nextStepIndex++;
    }
    if (nextStepIndex < callFlowSteps.length) {
      setOpenAccordionItem(`item-${nextStepIndex}`);
    }
  };
  
  useEffect(() => {
    // This effect is for manual DPA checks
    if (!automatedDpaPassed && dpaPassedCount >= 4 && openAccordionItem === 'item-2') {
        advanceToNextStep(2); // DPA is step 3 (index 2)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpaChecks, automatedDpaPassed, openAccordionItem]);

  useEffect(() => {
    if (marketingPermissionCompleted && openAccordionItem === 'item-4') {
        advanceToNextStep(4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketingPermissionCompleted, openAccordionItem]);

  useEffect(() => {
    if (esUpsellCompleted && openAccordionItem === 'item-5') {
        advanceToNextStep(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esUpsellCompleted, openAccordionItem]);

  useEffect(() => {
    if (accountReviewCompleted && openAccordionItem === 'item-7') {
        advanceToNextStep(7);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountReviewCompleted, openAccordionItem]);


  const handleDpaCheckChange = (id: string, checked: boolean) => {
    setDpaChecks(prev => ({ ...prev, [id]: checked }));
  }

  const handleActionChange = (problem: string, action: string) => {
    setActionsTaken(prev => ({ ...prev, [problem]: action }));
  };
  
  const getTenWorkingDaysFromNow = () => {
    let date = new Date();
    let daysAdded = 0;
    while (daysAdded < 10) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      // dayOfWeek is 0 for Sunday, 6 for Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    return date;
  };

  const tenWorkingDaysDate = format(getTenWorkingDaysFromNow(), "dd-MM-yyyy");

  const problemList = problemNotes.split('\n').filter(line => line.trim() !== '');

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    if (!text) {
      toast({
        variant: "destructive",
        title: "Nothing to Copy",
        description: `The "${fieldName}" field is empty.`,
      });
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `The content of "${fieldName}" has been copied.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
      });
    });
  };

  const renderAccordionContent = (step: typeof callFlowSteps[0], index: number) => {
    const showNextButton = index > 0 && index < callFlowSteps.length -1;

    let nextButton = showNextButton ? (
        <div className="flex justify-end mt-4">
            <Button onClick={() => advanceToNextStep(index)}>
                Next <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
        </div>
    ) : null;

    let content;

    if (step.id === "opening") {
      nextButton = null; // Remove next button from this step
      content = (
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="inbound-script">
                    <AccordionTrigger>Inbound Call Script</AccordionTrigger>
                    <AccordionContent>
                        <p className="italic text-muted-foreground">"Good Morning/Afternoon/Evening, thank you for calling Scottish Power. My name is [Name] at Scottish Power [Location]. Can I take your name please?"</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="outbound-script">
                    <AccordionTrigger>Outbound Call Script</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        <p className="italic text-muted-foreground">"Hello it's [Name] calling from Scottish Power [Location], the reason for my call is…"</p>
                        <p className="italic text-muted-foreground">"Before we continue I just need to make you aware calls may be recorded for training and quality purposes."</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          <div className="space-y-2">
            <Label htmlFor="callerName">Caller's Name</Label>
            <Input 
              id="callerName" 
              placeholder="Enter caller's name"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
            />
          </div>
          <Card className="p-4 bg-muted/50 dark:bg-muted/20">
              <div className="flex items-center space-x-2">
                  <Checkbox 
                      id="automated-dpa"
                      checked={automatedDpaPassed}
                      onCheckedChange={(checked) => {
                        const isChecked = checked as boolean;
                        setAutomatedDpaPassed(isChecked);
                        if (isChecked) {
                           setDpaChecks({});
                        }
                      }}
                  />
                  <Label htmlFor="automated-dpa">Automated DPA Passed</Label>
              </div>
          </Card>
          <div className="space-y-2">
            <Label>Is it yourself that is responsible for paying the energy bills on the account?</Label>
            <RadioGroup 
              value={accountHolderStatus} 
              onValueChange={(value) => {
                const wasUnanswered = accountHolderStatus === 'unanswered';
                const newStatus = value as 'yes' | 'no';
                setAccountHolderStatus(newStatus);
                if (newStatus === 'yes' && wasUnanswered) {
                  advanceToNextStep(index);
                }
              }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="acc-holder-yes" />
                <Label htmlFor="acc-holder-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="acc-holder-no" />
                <Label htmlFor="acc-holder-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          {accountHolderStatus === 'no' && (
            <Card className="p-4 bg-muted/50 dark:bg-muted/20 space-y-3">
              <p className="text-sm text-muted-foreground">If not the account holder, clarify their relation to the account before proceeding.</p>
              <RadioGroup value={thirdPartyStatus || ""} onValueChange={(value) => {
                const wasNull = thirdPartyStatus === null;
                setThirdPartyStatus(value as ThirdPartyStatus);
                if (wasNull) {
                  advanceToNextStep(index);
                }
              }}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="named" id="r-named" />
                  <Label htmlFor="r-named">Caller is named on the account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permission_granted" id="r-permission" />
                  <Label htmlFor="r-permission">Caller has permission for this call</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unauthorized_informant" id="r-unauthorized" />
                  <Label htmlFor="r-unauthorized">Unauthorized caller providing information only (no account changes)</Label>
                </div>
              </RadioGroup>
            </Card>
          )}
        </div>
      );
    }
    else if (step.id === "reason") {
      const isMeterReadingsActive = activeFlows.includes('submitMeterReadings');
      const isChangeTariffActive = activeFlows.includes('changeTariff');
      const isInstalmentPlanActive = activeFlows.includes('instalmentPlan');
      const isPrePaymentMeterActive = activeFlows.includes('prePaymentMeter');

      content = (
        <div className="space-y-4">
          <p>Select a process flow for common tasks, or note the customer's problem below.</p>
          <div className="flex flex-wrap gap-2">
            <Button 
                variant={isMeterReadingsActive ? "default" : "outline"} 
                size="sm" 
                onClick={() => toggleFlow('submitMeterReadings')}
            >
                {isMeterReadingsActive ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Submit Meter Readings
            </Button>
            <Button
              variant={isChangeTariffActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFlow('changeTariff')}
            >
              {isChangeTariffActive ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Change Tariff
            </Button>
            <Button
              variant={isInstalmentPlanActive ? "default" : "outline"}
              size="sm"
              onClick={handleInstalmentPlanFlowToggle}
            >
              {isInstalmentPlanActive ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Set Up Instalment Plan
            </Button>
            <Button
              variant={isPrePaymentMeterActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFlow('prePaymentMeter')}
            >
              {isPrePaymentMeterActive ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Arrange Pre-Payment Meter
            </Button>
          </div>
          <Separator/>
           <div className="space-y-2">
            <Label htmlFor="problemNotes">Notes on customer's problem(s)</Label>
            <Textarea 
              id="problemNotes" 
              placeholder="Enter each problem on a new line..."
              value={problemNotes}
              onChange={(e) => setProblemNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      );
    }
    else if (step.id === "enquiry") {
        const hasCustomProblems = problemList.length > 0;
        const hasActiveFlows = activeFlows.length > 0;

        if (!hasCustomProblems && !hasActiveFlows) {
            content = <p className="text-muted-foreground italic">No process flows or problems have been noted. Please select a reason for the call in the previous step.</p>;
        } else {
            content = (
            <div className="space-y-6">
                {/* Render active flows */}
                {activeFlows.includes('submitMeterReadings') && (
                  <SubmitMeterReadingsFlow onStateChange={setMeterReadingsState} />
                )}
                {activeFlows.includes('changeTariff') && (
                  <ChangeTariffFlow onStateChange={setChangeTariffState} />
                )}
                {activeFlows.includes('instalmentPlan') && (
                  <InstalmentPlanFlow onStateChange={setInstalmentPlanState} />
                )}
                {activeFlows.includes('prePaymentMeter') && (
                  <PrePaymentMeterFlow onStateChange={setPrePaymentMeterState} />
                )}
                
                {/* Render custom problems */}
                {hasCustomProblems && (
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Items</CardTitle>
                        <CardDescription>Address each of the customer's problems and note the actions taken.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {problemList.map((problem, index) => (
                        <div key={index}>
                        <Label htmlFor={`action-${index}`}>{problem}</Label>
                        <Textarea
                            id={`action-${index}`}
                            className="mt-2"
                            placeholder="Note actions taken..."
                            value={actionsTaken[problem] || ""}
                            onChange={(e) => handleActionChange(problem, e.target.value)}
                        />
                        </div>
                    ))}
                    </CardContent>
                </Card>
                )}
            </div>
            );
        }
    }
    else if(step.id === "dpa") {
      nextButton = null;
      content = (
        <div className="space-y-4">
            <p>Complete the necessary Data Protection Act (DPA) checks to verify the customer's identity before accessing their account.</p>
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">DPA Checklist ({dpaPassedCount}/4 needed)</h4>
                    <Badge variant={isDpaPassed ? "default" : "destructive"} className={isDpaPassed ? "bg-green-600" : ""}>
                        {isDpaPassed ? "DPA Passed" : "DPA Not Passed"}
                    </Badge>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Primary Questions</p>
                    {dpaQuestions.map(q => (
                        <div key={q.id} className="flex items-center space-x-2">
                            <Checkbox id={`dpa-${q.id}`} checked={dpaChecks[q.id] || false} onCheckedChange={(checked) => handleDpaCheckChange(q.id, checked as boolean)}/>
                            <Label htmlFor={`dpa-${q.id}`}>{q.label}</Label>
                        </div>
                    ))}
                </div>
                <Separator className="my-4" />
                 <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Alternative Questions</p>
                    {alternativeDpaQuestions.map(q => (
                        <div key={q.id} className="flex items-center space-x-2">
                            <Checkbox id={`dpa-${q.id}`} checked={dpaChecks[q.id] || false} onCheckedChange={(checked) => handleDpaCheckChange(q.id, checked as boolean)}/>
                            <Label htmlFor={`dpa-${q.id}`}>{q.label}</Label>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-4">
                <h4 className="font-semibold mb-3">DPA Updates</h4>
                <div className="flex flex-wrap gap-2">
                    {dpaUpdateOptions.map(opt => (
                        <Button 
                            key={opt.id}
                            variant={dpaUpdates.includes(opt.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDpaUpdate(opt.id)}
                        >
                            {dpaUpdates.includes(opt.id) ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </Card>
        </div>
      );
    }
    else if (step.id === "psr") {
      content = (
        <div className="space-y-4">
          <div className="space-y-3 italic text-muted-foreground">
            <p>"I can see your account is on the Priority Services Register and as an OfGem requirement we need to make sure this is up to date on every call."</p>
            <p>"The Priority Service Register offers some additional Support Services such as a Password Service, A Nominated Person Scheme, Alternate Bill formats, A Meter Reading Service, Community Liaison Visits or using our interpretation service if there's difficult with english, just to name a few."</p>
            <p>"The Priority Service Register is for customer who have any special circumstances such as being disabled, chronically ill, being of pensionable age, have children under the age of 16 or any financial difficulties."</p>
          </div>

          <div className="space-y-2">
            <Label>Was the PSR last updated within the last month?</Label>
            <RadioGroup
              value={psrUpdatedWithinMonth === null ? "" : psrUpdatedWithinMonth ? "yes" : "no"}
              onValueChange={(v) => setPsrUpdatedWithinMonth(v === "yes")}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="psr-month-yes" />
                <Label htmlFor="psr-month-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="psr-month-no" />
                <Label htmlFor="psr-month-no">No (over a month ago)</Label>
              </div>
            </RadioGroup>
          </div>

          {psrUpdatedWithinMonth === true && (
            <div className="space-y-3 italic text-muted-foreground">
              <p>"Have there been any changes in the last month?"</p>
            </div>
          )}

          {psrUpdatedWithinMonth === false && (
            <div className="space-y-4">
              <div className="space-y-3 italic text-muted-foreground">
                <p>"I can see we currently have the following flags on the account:"</p>
                <p className="font-semibold text-foreground not-italic">[Agent reads out current flags]</p>
              </div>
              <div className="space-y-3 italic text-muted-foreground">
                <p>1. <strong>Health:</strong> "Are there any changes needed to be made to the health conditions that we have on the priority service register or any additional health conditions we need to be aware of?"</p>
              </div>
              <div className="space-y-2">
                <Label>Financial flags exist on account?</Label>
                <RadioGroup
                  value={psrHasFinancialFlags === null ? "" : psrHasFinancialFlags ? "yes" : "no"}
                  onValueChange={(v) => setPsrHasFinancialFlags(v === "yes")}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="psr-financial-flags-yes" />
                    <Label htmlFor="psr-financial-flags-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="psr-financial-flags-no" />
                    <Label htmlFor="psr-financial-flags-no">No</Label>
                  </div>
                </RadioGroup>
                <div className="italic text-muted-foreground">
                  {psrHasFinancialFlags === true && (
                    <p>2. <strong>Financial:</strong> "I can see we have the [insert Flag/s] on the Priority Service Register, would you say that you are on a low income or are you facing serious challenges such as affording the essentials?"</p>
                  )}
                  {psrHasFinancialFlags === false && (
                    <p>2. <strong>Financial:</strong> "Are there any financial difficulties within the household?"</p>
                  )}
                </div>
              </div>
              <div className="space-y-3 italic text-muted-foreground">
                <p>3. <strong>Age 65+:</strong> "Is there anyone in the property over the age of 65 or 75? If so, do they receive any additional support?"</p>
                <p>4. <strong>Children:</strong> "Is there anyone in the property under the age of 16, 5, or 2 or anybody that regularly visits the property under the ages of 16, 5 or 2?"</p>
              </div>
            </div>
          )}

          <Card className="p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="psrFinancial">Financial Vulnerability</Label>
                <Textarea id="psrFinancial" placeholder="Notes on payment difficulties..." value={psrFinancial} onChange={(e) => setPsrFinancial(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="psrAge">Age-related (e.g., Pensionable Age)</Label>
                <Textarea id="psrAge" placeholder="Notes..." value={psrAge} onChange={(e) => setPsrAge(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="psrChildren">Dependant Children (Under 16)</Label>
                <Textarea id="psrChildren" placeholder="Notes..." value={psrChildren} onChange={(e) => setPsrChildren(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="psrHealth">Health / Disabilities</Label>
                <Textarea id="psrHealth" placeholder="Notes..." value={psrHealth} onChange={(e) => setPsrHealth(e.target.value)} rows={3} />
              </div>
            </div>
          </Card>
        </div>
      );
    }
    else if (step.id === "marketing") {
      nextButton = null;
      content = (
        <div className="space-y-4">
          <div className="space-y-3 italic text-muted-foreground">
            <p>"I can see that the last time we updated your marketing permissions was [date] where you said you were happy to receive marketing by Phone / Post / Text / Email. Would you like to make any changes?"</p>
            <p className="text-xs not-italic">(Agent: Remember to delete communication methods as appropriate based on customer's current permissions).</p>
          </div>
          <Card className="p-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketingPermissionCompleted" 
                checked={marketingPermissionCompleted}
                onCheckedChange={(checked) => setMarketingPermissionCompleted(checked as boolean)}
              />
              <Label htmlFor="marketingPermissionCompleted">
                Marketing permissions confirmed and updated.
              </Label>
            </div>
          </Card>
        </div>
      );
    }
    else if (step.id === "es-upsell") {
      nextButton = null;
      content = (
        <div className="space-y-4">
          <div className="space-y-3 italic text-muted-foreground">
            <p>"Did you know we also offer additional services as well as gas and Electricity such as Appliance Cover and Boiler Care. if you are interested in either of these or any other services we offer I can transfer you to one of our specialist after the call. Is this something that would be of interest to you?"</p>
          </div>
           <Card className="p-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="esUpsellCompleted" 
                checked={esUpsellCompleted}
                onCheckedChange={(checked) => setEsUpsellCompleted(checked as boolean)}
              />
              <Label htmlFor="esUpsellCompleted">
                ES Upsell offered.
              </Label>
            </div>
          </Card>
        </div>
      );
    }
     else if (step.id === "smart-meter") {
      content = (
        <div className="space-y-4">
          <p className="text-muted-foreground">Address the smart meter status with the customer.</p>
          <RadioGroup value={smartMeterStatus} onValueChange={(value) => setSmartMeterStatus(value as SmartMeterStatus)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-ready" id="sm-not-ready" />
              <Label htmlFor="sm-not-ready">Not Smart Ready</Label>
            </div>
             <div className="flex items-center space-x-2">
              <RadioGroupItem value="refused" id="sm-refused" />
              <Label htmlFor="sm-refused">Appointment Refused</Label>
            </div>
             <div className="flex items-center space-x-2">
              <RadioGroupItem value="booked" id="sm-booked" />
              <Label htmlFor="sm-booked">Book Appointment</Label>
            </div>
          </RadioGroup>
          {smartMeterStatus === 'booked' && (
            <div className="pt-4 border-t">
               <BookSmartMeterAppointmentFlow onStateChange={setSmartMeterAppointmentState} />
            </div>
          )}
        </div>
      )
    }
    else if (step.id === "review") {
      nextButton = null;
      content = (
        <div className="space-y-4">
          <p className="text-muted-foreground">Review the following items on the customer's account:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Has the customer called recently? (Check for a banner at the top of the screen)</li>
            <li>Are there any alerts on the account? (Check the top right of the screen)</li>
            <li>What is their current tariff? (Check the bottom left of the screen)</li>
            <li>Do they have Smart Meters? Are they Smart Ready? Are they interested in Smart Meters when they become available?</li>
            <li>When was the last payment and how much was it for?</li>
            <li>When was the last bill? What period did it cover, how much did it come to, and was it based on Actual or Estimated Readings?</li>
            <li>What is the current balance on the account?</li>
          </ul>
           <Card className="p-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="accountReviewCompleted" 
                checked={accountReviewCompleted}
                onCheckedChange={(checked) => setAccountReviewCompleted(checked as boolean)}
              />
              <Label htmlFor="accountReviewCompleted">
                Account review completed.
              </Label>
            </div>
          </Card>
        </div>
      );
    }
    else if (step.id === "complaints") {
      content = (
        <div className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>If the customer has shown any dissatisfaction, a complaint must be raised.</p>
            <ul className="list-disc pl-5">
              <li><strong>Resolved At Time Of Call (RATOC):</strong> Use if you have fully resolved the customer's dissatisfaction during the call.</li>
              <li><strong>Non-RATOC:</strong> Use if the issue requires escalation. You must get authorisation from POD support to raise a Non-RATOC.</li>
            </ul>
          </div>
          <Card className="p-4">
            <RadioGroup value={complaintStatus} onValueChange={(value) => setComplaintStatus(value as ComplaintStatus)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="c-none" />
                <Label htmlFor="c-none">No Dissatisfaction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ratoc" id="c-ratoc" />
                <Label htmlFor="c-ratoc">RATOC</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-ratoc" id="c-non-ratoc" />
                <Label htmlFor="c-non-ratoc">Non-RATOC</Label>
              </div>
            </RadioGroup>
            
            {complaintStatus === 'ratoc' && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="ratocReason">Reason for Complaint</Label>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(ratocReason, "Reason for Complaint")}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <Textarea id="ratocReason" value={ratocReason} onChange={(e) => setRatocReason(e.target.value)} placeholder="Note the reason for the complaint..."/>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="ratocActions">Actions Taken to Resolve</Label>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(ratocActions, "Actions Taken")}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <Textarea id="ratocActions" value={ratocActions} onChange={(e) => setRatocActions(e.target.value)} placeholder="Note the actions taken..."/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="ratocRef">RATOC Reference Number</Label>
                    <Input id="ratocRef" value={ratocRef} onChange={(e) => setRatocRef(e.target.value)} placeholder="Enter reference number..."/>
                </div>
              </div>
            )}

            {complaintStatus === 'non-ratoc' && (
              <div className="mt-4 space-y-4 border-t pt-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="nonRatocReason">Reason for Complaint</Label>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(nonRatocReason, "Reason for Complaint")}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <Textarea id="nonRatocReason" value={nonRatocReason} onChange={(e) => setNonRatocReason(e.target.value)} placeholder="Note the reason for the complaint..."/>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="nonRatocAgentActions">Actions Taken by Agent</Label>
                         <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(nonRatocAgentActions, "Actions by Agent")}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <Textarea id="nonRatocAgentActions" value={nonRatocAgentActions} onChange={(e) => setNonRatocAgentActions(e.target.value)} placeholder="Note actions taken so far..."/>
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="nonRatocCustomerResolution">Customer's Desired Resolution</Label>
                         <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(nonRatocCustomerResolution, "Desired Resolution")}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <Textarea id="nonRatocCustomerResolution" value={nonRatocCustomerResolution} onChange={(e) => setNonRatocCustomerResolution(e.target.value)} placeholder="Note what the customer wants..."/>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nonRatocRef">Non-RATOC Reference Number</Label>
                    <Input id="nonRatocRef" value={nonRatocRef} onChange={(e) => setNonRatocRef(e.target.value)} placeholder="Enter reference number..."/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Agreed Callback Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !nonRatocDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {nonRatocDate ? format(nonRatocDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={nonRatocDate} onSelect={setNonRatocDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="nonRatocTime">Agreed Callback Time</Label>
                        <Input id="nonRatocTime" value={nonRatocTime} onChange={(e) => setNonRatocTime(e.target.value)} placeholder="e.g., 2:30 PM"/>
                    </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      );
    }
    else if (step.id === "summarise") {
      content = (
        <div className="space-y-4">
          <p className="text-muted-foreground">Before ending the call, provide a clear summary for the customer:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Recap all actions taken on the call, referencing the "Actions Taken" in the summary panel.</li>
            <li>Confirm any next steps required from the business or the customer.</li>
            <li>Provide clear and accurate timeframes for any follow-up actions. For example:</li>
          </ul>
          <p className="italic pl-4 text-sm text-muted-foreground">"Just to confirm, we have [action taken]. This will be completed within 10 working days. If you haven't heard from us by the end of day on <strong>{tenWorkingDaysDate}</strong>, please give us a call back."</p>
          <Separator/>
          <p className="italic text-muted-foreground">"Is there anything I've mentioned that you would like me to go over again or anything else I can do to help you today?"</p>
        </div>
      );
    }
    else {
      content = (
        <div className="space-y-4">
            <p>End the call politely and professionally.</p>
            <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleResetFlow}
            >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Flow for Next Call
            </Button>
        </div>
      );
    }
    
    return <>
        {content}
        {nextButton}
    </>
  };
  
  const getCallerStatusText = () => {
    if (accountHolderStatus === 'yes') return "Account Holder";
    if (thirdPartyStatus === 'named') return "Named on account";
    if (thirdPartyStatus === 'permission_granted') return "Permission granted for call";
    if (thirdPartyStatus === 'unauthorized_informant') return "Unauthorized (info only)";
    return null;
  }
  
  const renderSummaryText = (text: string, defaultText: string) => {
    return text.trim() ? text : defaultText;
  }
  
  const getComplaintSummary = () => {
    if (complaintStatus === 'ratoc') {
       const summary = `RATOC Raised (ref. ${ratocRef || '...'}). Reason: ${ratocReason || '...'}. Actions: ${ratocActions || '...'}`;
       return summary;
    }
    if (complaintStatus === 'non-ratoc') {
      const dateStr = nonRatocDate ? format(nonRatocDate, "dd-MM-yyyy") : '...';
      const timeStr = nonRatocTime || '...';
      const summary = `Non-RATOC Raised (ref. ${nonRatocRef || '...'}). Reason: ${nonRatocReason || '...'}. Agent Actions: ${nonRatocAgentActions || '...'}. Desired Resolution: ${nonRatocCustomerResolution || '...'}. Callback: ${dateStr} at ${timeStr}`;
      return summary;
    }
    return "No Dissatisfaction";
  }

  const generatePsrSummaryText = () => {
    const lines = [
      "Priority Service Register",
    ];
    if (psrUpdatedWithinMonth !== null) {
      lines.push(`Last updated: ${psrUpdatedWithinMonth ? "within the last month" : "over a month ago"}`);
    }
    if (psrHasFinancialFlags !== null) {
      lines.push(`Financial flags on account: ${psrHasFinancialFlags ? "Yes" : "No"}`);
    }
    lines.push(
      `Financial: ${renderSummaryText(psrFinancial, "Nothing to update")}`,
      `Age 65+: ${renderSummaryText(psrAge, "Nothing to update")}`,
      `Children under 16: ${renderSummaryText(psrChildren, "Nothing to update")}`,
      `Health / Disabilities: ${renderSummaryText(psrHealth, "Nothing to update")}`
    );
    return lines.join("\n");
  }
  
  const getSmartMeterSummary = () => {
    switch (smartMeterStatus) {
      case 'not-ready': return "Not Smart Ready";
      case 'refused': return "Appointment Refused";
      case 'booked': return smartMeterAppointmentState.summary || "Booking details pending...";
      default: return "Pending";
    }
  }

  const generateFullSummaryText = () => {
    let summaryLines = [];
    
    // Caller Details
    let callerDetails = `${callerName || '...'}`;
    const statusText = getCallerStatusText();
    if (statusText) {
      callerDetails += ` (${statusText})`;
    }
    summaryLines.push(`Caller Details: ${callerDetails}`);
    summaryLines.push("");
  
    // DPA Status
    let dpaSummary = `DPA ${automatedDpaPassed ? 'Passed (Automated)' : isDpaPassed ? 'Passed (Manual)' : 'Not Completed'}`;
    if (dpaUpdates.length > 0) {
        dpaSummary += ` (${dpaUpdates.join(", ")})`;
    }
    summaryLines.push(dpaSummary);
    summaryLines.push("");
    
    // PSR
    summaryLines.push("Priority Service Register:");
    if (psrUpdatedWithinMonth !== null) {
      summaryLines.push(`  Last updated: ${psrUpdatedWithinMonth ? "within the last month" : "over a month ago"}`);
    }
    if (psrHasFinancialFlags !== null) {
      summaryLines.push(`  Financial flags on account: ${psrHasFinancialFlags ? "Yes" : "No"}`);
    }
    summaryLines.push(`  Financial: ${renderSummaryText(psrFinancial, "Nothing to update")}`);
    summaryLines.push(`  Age 65+: ${renderSummaryText(psrAge, "Nothing to update")}`);
    summaryLines.push(`  Children under 16: ${renderSummaryText(psrChildren, "Nothing to update")}`);
    summaryLines.push(`  Health / Disabilities: ${renderSummaryText(psrHealth, "Nothing to update")}`);
    summaryLines.push("");

    // Other statuses
    summaryLines.push(`Marketing Permissions ${marketingPermissionCompleted ? "Completed" : "Pending"}`);
    summaryLines.push(`ES Upsell ${esUpsellCompleted ? "Offered" : "Pending"}`);
    summaryLines.push(`Smart Meter: ${getSmartMeterSummary()}`);
    summaryLines.push(`Account Review ${accountReviewCompleted ? "Completed" : "Pending"}`);
    summaryLines.push("");
    
    // Actions Taken from Flows
    summaryLines.push("Actions Taken:");
    let actionsTakenText: string[] = [];
    if (activeFlows.includes('submitMeterReadings') && meterReadingsState.summary) {
        actionsTakenText.push(`Meter Readings - ${meterReadingsState.summary}`);
    }
    if (activeFlows.includes('changeTariff') && changeTariffState.summary) {
        actionsTakenText.push(`Tariff Change - ${changeTariffState.summary}`);
    }
     if (activeFlows.includes('instalmentPlan') && instalmentPlanState.summary) {
        actionsTakenText.push(`Instalment Plan - ${instalmentPlanState.summary}`);
    }
    if (activeFlows.includes('prePaymentMeter') && prePaymentMeterState.summary) {
         actionsTakenText.push(`Pre-Payment Meter - ${prePaymentMeterState.summary}`);
    }
    problemList.forEach(problem => {
        actionsTakenText.push(`${problem} - ${actionsTaken[problem] || 'No action noted.'}`);
    });
    
    if (actionsTakenText.length > 0) {
        summaryLines.push(actionsTakenText.map(action => `  ${action}`).join('\n'));
    } else {
        summaryLines.push("  No specific actions selected or noted.");
    }
    summaryLines.push("");


    // Complaint
    if (complaintStatus !== 'none') {
        summaryLines.push(`Complaint: ${getComplaintSummary()}`);
        summaryLines.push("");
    }

    // Scratchpad Notes
    if (scratchpadNotes.trim()) {
        summaryLines.push("Scratchpad Notes:");
        summaryLines.push(scratchpadNotes);
    }
  
    return summaryLines.join("\n").trim();
  }

  const handleCopyToClipboardFullSummary = (text: string, type: 'PSR' | 'Full') => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${type} summary has been copied.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy summary to clipboard.",
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Flow Guide</CardTitle>
        <CardDescription>A step-by-step guide to achieve Call Score success and ensure a consistent customer experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Accordion type="single" collapsible className="w-full" value={openAccordionItem} onValueChange={setOpenAccordionItem}>
              {callFlowSteps.map((step, index) => {
                if (step.id === 'dpa' && automatedDpaPassed) return null;
                return (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{index + 1}. {step.title}</AccordionTrigger>
                    <AccordionContent>
                      {renderAccordionContent(step, index)}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
          
          <div className="md:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                  <CardHeader>
                      <CardTitle>Scratchpad</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Textarea 
                          placeholder="Take temporary notes here..." 
                          rows={5}
                          value={scratchpadNotes}
                          onChange={(e) => setScratchpadNotes(e.target.value)}
                      />
                  </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Call Summary</CardTitle>
                  <CardDescription>Information gathered during the call.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  
                   <div>
                      <p><span className="font-semibold">Caller Details:</span> {callerName || <span className="italic text-muted-foreground">...</span>}
                      {callerName && getCallerStatusText() && (
                          <span className="text-muted-foreground"> ({getCallerStatusText()})</span>
                      )}</p>
                  </div>
                  
                  <p><span className="font-semibold">DPA:</span> {automatedDpaPassed ? 'Passed (Automated)' : isDpaPassed ? 'Passed (Manual)' : "Not Completed"}
                      {dpaUpdates.length > 0 && (
                          <span className="text-muted-foreground"> ({dpaUpdates.join(", ")})</span>
                      )}
                  </p>

                  <div>
                      <p className="font-semibold">Priority Service Register:</p>
                      <div className="pl-4 text-muted-foreground space-y-1">
                         {psrUpdatedWithinMonth !== null && (
                           <p><span className="font-medium text-foreground">Last updated:</span> {psrUpdatedWithinMonth ? "within the last month" : "over a month ago"}</p>
                         )}
                         {psrHasFinancialFlags !== null && (
                           <p><span className="font-medium text-foreground">Financial flags on account:</span> {psrHasFinancialFlags ? "Yes" : "No"}</p>
                         )}
                         <p><span className="font-medium text-foreground">Financial:</span> {renderSummaryText(psrFinancial, "Nothing to update")}</p>
                         <p><span className="font-medium text-foreground">Age 65+:</span> {renderSummaryText(psrAge, "Nothing to update")}</p>
                         <p><span className="font-medium text-foreground">Children under 16:</span> {renderSummaryText(psrChildren, "Nothing to update")}</p>
                         <p><span className="font-medium text-foreground">Health / Disabilities:</span> {renderSummaryText(psrHealth, "Nothing to update")}</p>
                      </div>
                  </div>

                   <div>
                    <p><span className="font-semibold">Marketing Permissions:</span> {marketingPermissionCompleted ? "Completed" : "Pending"}</p>
                    <p><span className="font-semibold">ES Upsell:</span> {esUpsellCompleted ? "Offered" : "Pending"}</p>
                    <p><span className="font-semibold">Smart Meter:</span> {getSmartMeterSummary()}</p>
                    <p><span className="font-semibold">Account Review:</span> {accountReviewCompleted ? "Completed" : "Pending"}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Actions Taken:</p>
                    <div className="pl-4 space-y-1 text-muted-foreground">
                      {activeFlows.includes('submitMeterReadings') && meterReadingsState.summary && (
                          <p><span className="font-medium text-foreground">Meter Readings</span> - {meterReadingsState.summary}</p>
                      )}
                      {activeFlows.includes('changeTariff') && changeTariffState.summary && (
                          <p><span className="font-medium text-foreground">Tariff Change</span> - {changeTariffState.summary}</p>
                      )}
                      {activeFlows.includes('instalmentPlan') && instalmentPlanState.summary && (
                        <p><span className="font-medium text-foreground">Instalment Plan</span> - {instalmentPlanState.summary}</p>
                      )}
                      {activeFlows.includes('prePaymentMeter') && prePaymentMeterState.summary && (
                         <p><span className="font-medium text-foreground">Pre-Payment Meter</span> - {prePaymentMeterState.summary}</p>
                      )}
                      {problemList.map((problem, idx) => (
                        <p key={idx}><span className="font-medium text-foreground">{problem}</span> - {actionsTaken[problem] || <span className="italic">No action noted.</span>}</p>
                      ))}
                       {activeFlows.length === 0 && problemList.length === 0 && (
                          <p className="italic">No actions taken yet.</p>
                      )}
                    </div>
                  </div>
                  
                  {complaintStatus !== 'none' && (
                    <p><span className="font-semibold">Complaint:</span> {getComplaintSummary()}</p>
                  )}

                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleCopyToClipboardFullSummary(generatePsrSummaryText(), 'PSR')}>
                      <ClipboardList className="mr-2 h-4 w-4" /> Copy PSR
                  </Button>
                  <Button size="sm" className="w-full" onClick={() => handleCopyToClipboardFullSummary(generateFullSummaryText(), 'Full')}>
                      <Copy className="mr-2 h-4 w-4" /> Copy Full Summary
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
