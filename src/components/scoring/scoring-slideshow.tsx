
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const CatLevelBadge = ({ level }: { level: number | string }) => {
  const levelNum = typeof level === 'string' ? parseFloat(level) : level;
  const getBackgroundColor = () => {
    if (levelNum < 2.5) return "bg-red-500 hover:bg-red-600"; // CAT 2
    if (levelNum < 3) return "bg-orange-500 hover:bg-orange-600"; // CAT 2.5
    if (levelNum < 4) return "bg-amber-500 hover:bg-amber-600"; // CAT 3
    if (levelNum < 5) return "bg-yellow-500 hover:bg-yellow-600"; // CAT 4
    return "bg-green-500 hover:bg-green-600"; // CAT 5
  };
  return <Badge className={cn("ml-2 shrink-0 border-transparent text-white", getBackgroundColor())}>{`CAT ${level}`}</Badge>;
}

const Checklist = ({ items, isFullscreen }: { items: string[], isFullscreen: boolean }) => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const handleCheck = (item: string) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(item)) {
                newSet.delete(item);
            } else {
                newSet.add(item);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item} className="flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-accent/50">
                    <Checkbox 
                        id={`checklist-${item}`} 
                        checked={checkedItems.has(item)}
                        onCheckedChange={() => handleCheck(item)}
                    />
                    <Label 
                        htmlFor={`checklist-${item}`}
                        className={cn(
                          "font-medium leading-none cursor-pointer",
                          isFullscreen ? "text-lg" : "text-base",
                          checkedItems.has(item) && "line-through text-muted-foreground"
                        )}
                    >
                        {item}
                    </Label>
                </div>
            ))}
        </div>
    );
};

const sections = [
  {
    title: "Introduction",
    subsections: [
        { id: 'A1', title: 'Call Introduction', catLevel: 4, content: (
            <>
                <p>Greet the customer, state your name, and represent Scottish Power and your location. Understand why they are calling before doing any security checks.</p>
                <blockquote className="border-l-4 pl-4 italic">"Good Morning/Afternoon/Evening, thank you for calling Scottish Power. My name is [Name] at Scottish Power [Location]. Can I take your name please?"</blockquote>
            </>
        )},
        { id: 'A2', title: 'Outbound Introduction', catLevel: 3, content: (
            <>
                <p>For outbound calls, state who you are and why you're calling, and inform the customer the call is being recorded.</p>
                <blockquote className="border-l-4 pl-4 italic">"Hello it's [Name] calling from Scottish Power [Location], the reason for my call is…"</blockquote>
                <blockquote className="border-l-4 pl-4 italic">"Before we continue I just need to make you aware calls may be recorded for training and quality purposes."</blockquote>
            </>
        )},
        { id: 'A3A', title: 'Data Protection (DPA)', catLevel: 2, content: (
            <>
                <p>Before discussing any personal information, you must verify you are speaking to the account holder. This applies to all calls with existing customers.</p>
                <blockquote className="border-l-4 pl-4 italic">"The security of your personal information is really important to us, before I access your account can I just complete a security check for you"</blockquote>
                <blockquote className="border-l-4 pl-4 italic">"Can you confirm that you are the account holder or named as an additional contact on the account?"</blockquote>
            </>
        )},
        { id: 'A3B', title: 'DPA - Address', catLevel: 2, content: <p>Ask the customer for the first line of their address and their postcode.</p> },
        { id: 'A4', title: 'DPA - DOB & Phone', catLevel: 4, content: <p>Ask the customer for their date of birth and telephone number.</p> },
        { id: 'A5', title: 'DPA - Alternatives', catLevel: 2, content: (
            <>
                <p>If they can't confirm the above, ask alternative questions:</p>
                <ul className="list-disc pl-5">
                    <li>How do you pay your bills?</li>
                    <li>What is your instalment/payment amount?</li>
                    <li>When did you make your last payment?</li>
                    <li>What is your email address?</li>
                </ul>
            </>
        )},
        { id: 'A6', title: 'Capture Phone Number', catLevel: 5, content: (
            <>
                <p>If there's no phone number on the account, you must try to capture one.</p>
                <blockquote className="border-l-4 pl-4 italic">"To ensure your records are up to date can you please provide us with your telephone number? This will help us route you to the right team if you need to call us in the future."</blockquote>
            </>
        )},
        { id: 'A7', title: 'Capture Email', catLevel: 5, content: (
            <>
                <p>If there's no email on the account, ask the customer if they have one and if you can add it. This helps keep them updated and can be used for security.</p>
                <blockquote className="border-l-4 pl-4 italic">"To ensure your records are up to date and that we can get in touch with you regarding your energy account can you please provide us with your email address?"</blockquote>
            </>
        )},
        { id: 'A8', title: 'Narratives', catLevel: 5, content: <p>A clear, concise narrative must be added to the account for specific actions (e.g., manual refunds, recording reads not used for billing, promise reference numbers, failed appointments, etc.). The narrative should accurately reflect the customer interaction without jargon.</p> },
        { id: 'A9', title: 'Value Add', catLevel: 4, content: (
            <>
                <p>Proactively offer additional services like Boiler Care or discuss the benefits of a Smart Meter. Go beyond the initial query to see how else you can help.</p>
                <blockquote className="border-l-4 pl-4 italic">"While I'm speaking to you today I’ll also check you're getting the best value from your Scottish Power account with us... But first let's resolve your query."</blockquote>
            </>
        )},
        { id: 'IntroSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Greeting",
                "Calls are recorded (for outbound calls)",
                "First Line of Address and Post Code",
                "Date of Birth and Telephone Number",
                "Are they speaking Account Holder?",
                "Alternate Questions",
                "Capture Phone Number",
                "Capture Email",
                "Narratives (notes)",
                "Value Add"
            ]}/>
        )}
    ]
  },
  {
    title: "Tariff Changes",
    subsections: [
        { id: 'B1', title: 'Consumption', catLevel: 3, content: <p>Inform the customer that quotes are based on their annual kWh consumption from their account history. If possible, take fresh meter reads to ensure accuracy.</p> },
        { id: 'C1-C3', title: 'Needs Analysis', catLevel: 3, content: (
            <>
                <p>Understand the customer's needs. Ask what's important to them (e.g., price, green energy), whether they prefer an online (email) or offline (post) tariff, and confirm they are over 18 and a homeowner if relevant. Present options that meet their stated needs.</p>
                <p className="mt-2 text-destructive font-semibold">You must not advise the customer which tariff to select.</p>
            </>
        )},
        { id: 'C4-C10', title: 'Quote Details', catLevel: 3, content: (
             <>
                <p>When providing a quote, you must clearly state:</p>
                <ul className="list-disc pl-5">
                    <li>The tariff name, end date, and any special features.</li>
                    <li>Any savings or increases in cost compared to their current tariff, in pounds (£).</li>
                    <li>The new monthly and annual costs for each fuel.</li>
                    <li>The daily standing charge and unit rates (p/day and p/kWh).</li>
                    <li>Any cancellation fees in pounds (£), explaining they only apply if leaving Scottish Power.</li>
                </ul>
            </>
        )},
        { id: 'D1-D2', title: 'T&Cs and Agreement', catLevel: 2, content: (
            <>
                <p>Provide the product's key facts and T&Cs, following the UI5 script. You must offer to read the full terms or send them to the customer.</p>
                <p className="mt-2">If setting up a new Direct Debit, confirm bank details with the bank account holder and advise them they are covered by the Direct Debit Guarantee.</p>
                <p className="mt-2 font-semibold">Crucially, you must get a clear "Yes" from the customer to confirm they are entering into a contract.</p>
            </>
        )},
        { id: 'D3', title: 'Marketing Consent', catLevel: 3, content: <p>You must check if the customer's marketing preferences have been updated in the last 12 months and ask if they wish to make any changes.</p> },
        { id: 'ConversionSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Informed consumption basis for quote",
                "Conducted needs analysis",
                "Confirmed if customer prefers Online or Offline tariff",
                "Provided full quote details (name, costs, rates, fees)",
                "Explained T&Cs and Cooling Off period",
                "Gained explicit consent to proceed (verbal contract)",
                "Confirmed bank details and DD Guarantee",
                "Checked/Updated Marketing Consent"
            ]}/>
        )}
    ]
  },
  {
    title: "Vulnerability",
    subsections: [
        { id: 'PSR-5-Steps', title: 'PSR - 5 Step Method', catLevel: 2.5, content: (
            <>
                <p>Follow this 5-step process for every call to correctly manage the Priority Services Register. The process starts with confirming the customer's existing status.</p>
                <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Confirm:</strong> Check what PSR flags are currently on the account. Inform the customer what is recorded.</li>
                    <li><strong>Inquire:</strong> Go through all four vulnerability categories (Health, Age, Children, Financial) and ask if there have been any changes or if anything new needs to be added.</li>
                    <li><strong>Update:</strong> Accurately update the PSR boxes and add specific details in the notes as required.</li>
                    <li><strong>Script:</strong> Use the correct scripts to explain data sharing and gain consent for PSR services.</li>
                    <li><strong>Note:</strong> Leave a clear narrative on the account detailing the PSR review and any changes made.</li>
                </ol>
            </>
        )},
        { id: 'E2C', title: 'PSR Consent', catLevel: 2.5, content: <p>Explain that for certain vulnerabilities, we will share their information with relevant third parties (like the network operator) to assist during emergencies, and gain the customer's permission to do so for non-shareable information.</p> },
        { id: 'VulnerabilitySummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Advise customer of the Priority Service Register",
                "Make them aware of the categories AND the Current flags on the account (including any notes)",
                "Check all categories of vulnerability (Health, Aged over 65, Children under the age of 16 or financial Difficulties) for any changes",
                "Gain Consent for PSR Data Sharing"
            ]}/>
        )}
    ]
  },
  {
    title: "Ability to Pay",
     subsections: [
        { id: 'F1A', title: 'Payment Options', catLevel: 2.5, content: (
            <>
                <p>If a customer has payment difficulties, offer a wide choice of payment methods (Direct Debit, Monthly Cash, Instalment Plan, Prepayment, Fuel Direct) and explain the differences.</p>
                <p>Always base the repayment plan on the customer's ability to pay, not on pre-defined minimums or maximums.</p>
                <p className="mt-2 font-semibold">Prompt: If financial vulnerability is identified, has this been added to the Priority Service Register?</p>
            </>
        )},
        { id: 'F1B-F2B', title: 'Explaining Plans', catLevel: 2, content: (
            <>
                <p>Fully explain how the chosen payment method works, ensuring the customer understands. For instalment plans, confirm the amount, how it covers usage and arrears, and when the debt will be cleared.</p>
                <blockquote className="border-l-4 pl-4 italic">"So to confirm, we have set-up a payment arrangement of £X per month. This covers both your ongoing usage of £Y and £Z towards the arrears on your account. This plan will run for [number] of months and your final payment will be on [date]."</blockquote>
                <p>You must set up an affordable plan based on what the customer says they can repay.</p>
            </>
        )},
        { id: 'F1C', title: 'Energy Efficiency', catLevel: 2.5, content: (
            <>
                <p>Provide the customer with information on how to use their energy more efficiently to help reduce their charges, either by giving tips or signposting them to resources.</p>
                <blockquote className="border-l-4 pl-4 italic">"For help in reducing your usage, you can use the Energy Efficiency toolkit on our website or go direct to the Energy Savings Trust."</blockquote>
            </>
        )},
        { id: 'F1D-F4', title: 'Debt Advice', catLevel: 2.5, content: (
            <>
                <p>In every case where a customer is struggling to pay, you must signpost them to independent debt advice charities like StepChange and mention the Scottish Power Hardship Fund.</p>
                <blockquote className="border-l-4 pl-4 italic">"If you are struggling to pay at any time, free debt advice is available through StepChange. You can also apply for help through the SP hardship fund..."</blockquote>
                <p>You must also ask if the agreed payment will affect their ability to pay other household bills.</p>
            </>
        )},
        { id: 'AbilityToPaySummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Offered a range of payment methods",
                "Set up an affordable plan based on customer's ability to pay",
                "Confirm ongoing payment amount, Final payment date and Final Payment Amount",
                "Provided energy efficiency advice",
                "Signposted to StepChange and Hardship Fund",
                "Asked if payment affects other bills"
            ]}/>
        )}
    ]
  },
  {
    title: "Pre-Payment",
     subsections: [
        { id: 'G1A', title: 'Explaining Prepayment', catLevel: 2.5, content: (
            <>
                <p>When offering a Pre-Payment meter, you must explain the advantages and disadvantages.</p>
                <p><strong>Advantages:</strong> Helps with budgeting, can be set to repay debt at a fixed amount, has an emergency credit facility.</p>
                <p><strong>Disadvantages:</strong> Requires topping up to keep power on, may need more credit in winter, might not be suitable for customers with certain special needs.</p>
            </>
        )},
        { id: 'G1B', title: 'Safe & Practicable', catLevel: 2.5, content: (
            <>
                <p>You must complete the "Safe & Practicable" assessment by asking the following questions to determine if it is safe and reasonably practicable to install a Pre-Payment meter.</p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>Is there anyone in the household who requires a constant supply for health reasons?</li>
                    <li>Are there any circumstances that prevent the household from safely or reasonably using the prepayment meter?</li>
                    <li>Have you carried out an assessment of the customer circumstances, including PSR?</li>
                    <li>Can the customer Top-Up without frequent or prolonged periods of self-disconnection that would cause them significant harm?</li>
                    <li>Is there someone living permanently within the household who is able to understand how to operate a prepayment meter?</li>
                    <li>Is there someone within the household who can physically buy tup-ups for a prepayment meter, e.g. through the app or at a nearby payment outlet?</li>
                    <li>Is the meter located in a safe position that is easily accessible at any time of the day?</li>
                    <li>Is a Member if this household able to physically able to update this meter if needed?</li>
                </ul>
                <blockquote className="border-l-4 pl-4 italic mt-4">"I need to ask you some questions to make sure a prepayment meter is the best option for you and that it's safe and practicable for you to have one installed."</blockquote>
            </>
        )},
        { id: 'PrePaymentSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Explained advantages and disadvantages of prepayment meters",
                "Is constant supply needed for health reasons?",
                "Any circumstances preventing safe use?",
                "Customer circumstances (PSR) assessed?",
                "Can top up without causing harm?",
                "Someone understands how to operate the meter?",
                "Someone can physically buy top-ups?",
                "Meter is in a safe, accessible location?",
                "Someone can physically update the meter if needed?"
            ]}/>
        )}
    ]
  },
  {
    title: "D&G Sales",
    subsections: [
        { id: 'H1', title: 'Eligibility', catLevel: 4, content: (
            <>
                <p>You must read all eligibility questions in full to ensure the customer qualifies for the Boiler or Appliance Care product.</p>
                <p><strong>Key checks include:</strong> Home ownership, boiler age (under 15 years), no pre-existing faults, and appliance is for domestic use.</p>
                <p className="mt-2 font-semibold">Note: Boiler Care can only be offered to homeowners. If the customer rents, you can still offer Appliance Cover, but you must first ask if the landlord provides their appliances, as if so we can not provide cover for these either.</p>
            </>
        )},
        { id: 'H2-H3', title: 'Key Facts & Terms', catLevel: 4, content: (
            <>
                <p>You must read all product key facts and principal terms in full, including:</p>
                <ul className="list-disc pl-5">
                    <li>What's included and main exclusions.</li>
                    <li>Monthly and annual costs.</li>
                    <li>Plan duration.</li>
                    <li>The 30-day wait before a claim can be made.</li>
                    <li>Cancellation rights and renewal process.</li>
                </ul>
            </>
        )},
        { id: 'H5-H6', title: 'Agent Conduct', catLevel: 4, content: (
            <>
                <p>You must behave professionally and avoid prohibited sales tactics:</p>
                <ul className="list-disc pl-5">
                    <li>Do not refer to the plan as "insurance" or use insurance terms (e.g., policy, premium).</li>
                    <li>Do not call it a "special offer" or suggest the price is only available today.</li>
                    <li>Do not sell on the cancellation period; sell on features and benefits.</li>
                    <li>Do not guarantee any part of the plan.</li>
                    <li>Do not use pressure selling or scare tactics.</li>
                </ul>
            </>
        )},
        { id: 'D&GSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
             <Checklist isFullscreen={isFullscreen} items={[
                "Customer owns the property (for Boiler Care)",
                "Boiler is less than 15 years old / Appliance is less than 8 years old",
                "Boiler/Appliance has no pre-existing faults",
                "Boiler is mains gas (not LPG, oil, etc.)",
                "Boiler/Appliance is out of manufacturer's Guarantee"
            ]}/>
        )}
    ]
  },
  {
    title: "Complaints",
    subsections: [
        { id: 'I1', title: 'Handling Standards', catLevel: 3, content: (
            <>
                <p>If a customer expresses dissatisfaction, a complaint must be raised. You must follow the official Complaint Handling Standards.</p>
                <ul className="list-disc pl-5">
                    <li>Acknowledge the customer's dissatisfaction.</li>
                    <li>Attempt to resolve the issue on the call if possible (RATOC).</li>
                    <li>If unable to resolve complaint reach out to Pod Support to get advice and authorisation for NR.</li>
                    <li>When raising a complaint go through each question and section with the customer and make sure the customer is aware of next steps, time frames. they are aware of where they can access the Complaints Handling Procedures.</li>
                </ul>
            </>
        )},
        { id: 'RATOC', title: 'Resolving at Time of Call (RATOC)', catLevel: 3, content: (
            <>
                <p>An essential part of the SLC (Standard Licence Conditions) is recognising complaints or dissatisfaction. If you are able to fully resolve the customer's issue during the call, you must still raise a RATOC.</p>
                <p>This process formally logs the initial dissatisfaction and its successful resolution, ensuring we have a record of the interaction and have met our regulatory obligations.</p>
                <p className="font-semibold">Do not assume that because the customer is happy at the end of the call, a complaint record is not needed. If dissatisfaction was expressed, it must be logged.</p>
                <p className="font-bold">If a customer mentions Ofgem or the Ombudsman, you MUST log a complaint. If you are able to resolve the customer complaints and they have mentioned Ofgem or the Ombudsman you can raise this as a RATOC.</p>
            </>
        )},
        { id: 'ComplaintsSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Acknowledged any dissatisfaction",
                "Attempted to resolve at time of call (RATOC)",
                "Followed correct UI5 process for logging",
                "Managed expectations for unresolved complaints"
            ]}/>
        )}
    ]
  },
  {
    title: "Conduct",
    subsections: [
        { id: 'J1', title: 'Honesty & Transparency', catLevel: 2, content: (
            <>
                <p>Your conduct throughout the call must be fair, professional, honest, and transparent.</p>
                <ul className="list-disc pl-5">
                    <li>Do not mislead the customer in any way.</li>
                    <li>Do not use pressure selling tactics.</li>
                    <li>Do not speak negatively about other companies.</li>
                    <li>Provide information that is accurate and easy to understand.</li>
                </ul>
            </>
        )},
        { id: 'J2', title: 'Professionalism', catLevel: 2.5, content: (
            <>
                <p>You must maintain a professional manner throughout the call.</p>
                 <ul className="list-disc pl-5">
                    <li>Listen to the customer to understand their individual circumstances.</li>
                    <li>Communicate in plain and simple language, adapting your style to the caller.</li>
                    <li>Ensure all information you provide is complete and accurate.</li>
                </ul>
            </>
        )},
        { id: 'ConductSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Remained honest and transparent",
                "Did not mislead or use pressure tactics",
                "Remained professional and did not speak negatively of others",
                "Communicated clearly and accurately"
            ]}/>
        )}
    ]
  },
  {
    title: "Consolidation",
    subsections: [
        { id: 'K1', title: 'Recap & Close', catLevel: 4, content: (
            <>
                <p>At the end of the call, you must provide a full recap of the actions taken and confirm the customer understands everything discussed.</p>
                <blockquote className="border-l-4 pl-4 italic">"So, what I’ve done for you today is..., do you understand everything we have discussed? Do you have any further questions? What will happen next is... Can I help you with anything else? Perfect, thank you for your call today, goodbye."</blockquote>
            </>
        )},
        { id: 'ConsolidationSummary', title: 'Summary Checklist', type: 'summary', content: ({ isFullscreen }: { isFullscreen: boolean }) => (
            <Checklist isFullscreen={isFullscreen} items={[
                "Recapped all actions taken on the call",
                "Confirmed customer understanding",
                "Asked if there was anything else to help with",
                "Provided a professional closing"
            ]}/>
        )}
    ]
  },
];

export function ScoringSlideshow({ isFullscreen = false }: { isFullscreen?: boolean }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentSubsection, setCurrentSubsection] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isFullscreen) {
      // Apply styles for full-screen mode
      htmlElement.style.fontSize = '125%';
    } else {
      // Revert styles when exiting full-screen mode
      htmlElement.style.fontSize = '';
    }
    // Cleanup function to reset style on component unmount
    return () => {
      htmlElement.style.fontSize = '';
    };
  }, [isFullscreen]);


  const activeSection = sections[currentSection];
  const nextSectionTitle = sections[currentSection + 1]?.title;
  const prevSectionTitle = sections[currentSection - 1]?.title;

  const activeSubsection = activeSection.subsections[currentSubsection];
  const nextSubsectionTitle = activeSection.subsections[currentSubsection + 1]?.title;
  const prevSubsectionTitle = activeSection.subsections[currentSubsection - 1]?.title;


  const handleSetSection = (index: number) => {
    if (index === currentSection) return;
    setDirection(index > currentSection ? 1 : -1);
    setCurrentSection(index);
    setCurrentSubsection(0); // Reset subsection when changing main section
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      handleSetSection(currentSection + 1);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      handleSetSection(currentSection - 1);
    }
  };

  const handleNextSubsection = () => {
    if (currentSubsection < activeSection.subsections.length - 1) {
        setDirection(1);
        setCurrentSubsection(currentSubsection + 1);
    } else {
        handleNext(); // Move to next main section if at the end of subsections
    }
  };

  const handlePrevSubsection = () => {
    if (currentSubsection > 0) {
        setDirection(-1);
        setCurrentSubsection(currentSubsection - 1);
    }
  };


  const slideVariants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction > 0 ? "100%" : "-100%" }),
    visible: { opacity: 1, x: "0%" },
    exit: (direction: number) => ({ opacity: 0, x: direction < 0 ? "100%" : "-100%" }),
  };

  const subslideVariants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction > 0 ? "20%" : "-20%" }),
    visible: { opacity: 1, x: "0%" },
    exit: (direction: number) => ({ opacity: 0, x: direction < 0 ? "20%" : "-20%" }),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stepper Navigation */}
      <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4 p-2 border-b rounded-t-lg bg-card shadow-sm">
        {sections.map((section, index) => (
          <button
            key={section.title}
            onClick={() => handleSetSection(index)}
            className={cn(
              "flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 rounded-md transition-all",
              currentSection === index
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
               currentSection > index && "bg-green-600/20 text-green-800 dark:text-green-300"
            )}
          >
             {currentSection > index ? <Check className="h-4 w-4" /> : (
              <span className={cn("h-4 w-4 rounded-full flex items-center justify-center text-xs", currentSection === index ? "bg-primary-foreground text-primary" : "bg-background")}>
                {index + 1}
              </span>
            )}
            <span className="hidden sm:inline">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Slide Content */}
      <div className="relative overflow-hidden flex-1">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSection}
            custom={direction}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Card className="w-full h-full border-t-0 rounded-t-none flex flex-col">
              <CardHeader>
                <CardTitle className={cn("font-bold text-primary", isFullscreen ? "text-3xl" : "text-2xl")}>{activeSection.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                {/* Sub-navigation */}
                <div className={cn(
                  "w-full space-y-2 border-b md:border-b-0 md:border-r md:pr-4 overflow-y-auto pb-2 md:pb-0",
                  isFullscreen ? "md:w-1/4" : "md:w-1/3"
                  )}>
                  {activeSection.subsections.map((sub, index) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setDirection(index > currentSubsection ? 1 : -1);
                        setCurrentSubsection(index);
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-md transition-colors",
                         isFullscreen ? "text-base" : "text-sm",
                        currentSubsection === index ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent/50",
                        sub.type === 'summary' && "font-bold mt-2 border-t pt-3"
                      )}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
                {/* Subsection Content */}
                <div className={cn(
                    "w-full flex flex-col overflow-y-auto",
                    isFullscreen ? "md:w-3/4" : "md:w-2/3"
                  )}>
                    <div className="flex-1">
                       <AnimatePresence initial={false} custom={direction}>
                         <motion.div
                            key={`${currentSection}-${currentSubsection}`}
                            custom={direction}
                            variants={subslideVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "ease", duration: 0.2 }}
                            className="space-y-4"
                         >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className={cn("font-semibold", isFullscreen ? "text-2xl" : "text-xl")}>{activeSubsection.title}</h4>
                                {activeSubsection.catLevel && <CatLevelBadge level={activeSubsection.catLevel} />}
                            </div>
                            <div className={cn("prose max-w-none text-muted-foreground space-y-3", isFullscreen ? "prose-lg" : "prose-base")}>
                                {typeof activeSubsection.content === 'function' ? activeSubsection.content({ isFullscreen }) : activeSubsection.content}
                            </div>
                        </motion.div>
                       </AnimatePresence>
                    </div>
                     <div className="mt-6 flex justify-between">
                        <Button onClick={handlePrevSubsection} disabled={currentSubsection === 0} variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {prevSubsectionTitle && <span>{prevSubsectionTitle}</span>}
                        </Button>
                        <Button onClick={handleNextSubsection} disabled={currentSubsection === activeSection.subsections.length - 1}>
                            {nextSubsectionTitle && <span>{nextSubsectionTitle}</span>}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev/Next Buttons */}
       <div className="flex justify-between items-center p-4 border-t bg-card rounded-b-lg">
        <Button onClick={handlePrev} disabled={currentSection === 0} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {prevSectionTitle || 'Previous Section'}
        </Button>
        <span className="text-sm text-muted-foreground">
          Section {currentSection + 1} of {sections.length}
        </span>
        <Button onClick={handleNext} disabled={currentSection === sections.length - 1}>
          {nextSectionTitle || 'Finish'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

    