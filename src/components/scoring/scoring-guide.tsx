
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CatLevelBadge = ({ level }: { level: number | string }) => {
  const levelNum = typeof level === 'string' ? parseFloat(level) : level;
  const getVariant = () => {
    if (levelNum < 3) return "destructive";
    if (levelNum < 4) return "secondary";
    if (levelNum < 5) return "default";
    return "outline";
  };
  const getClassName = () => {
    if (levelNum >= 5) return "bg-green-500 text-white";
    if (levelNum >= 4) return "bg-yellow-500 text-black";
    if (levelNum === 2.5) return "bg-orange-500 text-white";
    return "";
  }
  return <Badge variant={getVariant()} className={cn("ml-2", getClassName())}>{`CAT ${level}`}</Badge>;
}


const ScoringStep = ({ id, title, catLevel, children }: { id: string, title: string, catLevel?: number | string, children: React.ReactNode }) => (
    <AccordionItem value={id}>
        <AccordionTrigger>
            <div className="flex items-center text-left">
                <span className="font-semibold">{id}. {title}</span>
                {catLevel && <CatLevelBadge level={catLevel} />}
            </div>
        </AccordionTrigger>
        <AccordionContent className="prose prose-sm max-w-none text-muted-foreground space-y-3">
            {children}
        </AccordionContent>
    </AccordionItem>
);

const SectionHeader = ({ title, description }: { title: string, description?: string }) => (
  <CardHeader className="p-0 text-left">
    <CardTitle>{title}</CardTitle>
    {description && <CardDescription>{description}</CardDescription>}
  </CardHeader>
);

const SubsectionHeader = ({ title }: { title: string }) => (
    <div className="mt-4 mb-3">
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        <hr className="mt-1 border-border"/>
    </div>
);


export function ScoringGuide() {
  return (
    <>
    <Accordion type="multiple" defaultValue={["section-intro"]} className="w-full space-y-4">
      
      <AccordionItem value="section-intro" asChild>
        <Card>
           <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader 
                title="Introduction, Service & Security"
                description="This section covers the opening of the call, customer verification, and initial service offerings."
              />
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <ScoringStep id="A1" title="Call Introduction" catLevel={4}>
                        <p>Advisor greets customer, states their name, represents Scottish Power, and mentions their location. They must confirm the reason for the call or listen to understand the contact reason before completing any Data Protection checks.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "Good Morning/Afternoon/Evening, thank you for calling Scottish Power. My name is [Name] at Scottish Power [Location]. Can I take your name please?"
                        </blockquote>
                    </ScoringStep>

                    <ScoringStep id="A2" title="Call Introduction (Outbound)" catLevel={3}>
                        <blockquote className="border-l-4 pl-4 italic">
                            "Hello it's [Name] calling from Scottish Power [Location], the reason for my call is…"
                        </blockquote>
                        <blockquote className="border-l-4 pl-4 italic">
                            "Before we continue I just need to make you aware calls may be recorded for training and quality purposes."
                        </blockquote>
                    </ScoringStep>
                    
                    <ScoringStep id="A3A" title="Data Protection" catLevel={2}>
                        <p>If any personal information is going to be discussed, the Advisor must first confirm that they are speaking to the Account Holder (or a person listed on the account) and complete Data Protection checks. This applies to both inbound and outbound calls for existing customers.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "The security of your personal information is really important to us, before I access your account can I just complete a security check for you"
                            <br />
                            "Can you confirm the name on the account?"
                        </blockquote>
                    </ScoringStep>

                    <ScoringStep id="A3B" title="Data Protection" catLevel={2}>
                        <p>Customer to provide first line of their address and postcode.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "Can you confirm the first line of address and post code?"
                        </blockquote>
                    </ScoringStep>

                    <ScoringStep id="A4" title="Data Protection" catLevel={4}>
                        <p>Customer to provide date of birth and telephone number.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "Can you confirm the date of birth and telephone number?"
                        </blockquote>
                    </ScoringStep>

                    <ScoringStep id="A5" title="Data Protection (Alternative)" catLevel={2}>
                        <p>If the customer cannot confirm all of the above, ask additional questions:</p>
                        <ul className="list-disc pl-5">
                            <li>How do you currently pay for your bills?</li>
                            <li>Can you confirm your instalment/payment  amount?</li>
                            <li>Can you confirm the last payment date?</li>
                        </ul>
                        <blockquote className="border-l-4 pl-4 italic">
                            "As you were unable to confirm x, can you now confirm…"
                        </blockquote>
                    </ScoringStep>

                    <ScoringStep id="A6" title="Telephone number collection" catLevel={5}>
                        <p>Where we currently hold no contact telephone number for the customer, we need to make sure we have an up-to-date contact number on the account. Follow the Ui5 script provided.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "To ensure your records are up to date can you please provide us with your telephone number?"
                            <br/>
                            "This will help us to route you to the right team if you need to call us in the future / allows us to keep you updated on anything related to your energy account"
                        </blockquote>
                    </ScoringStep>

                    <ScoringStep id="A7" title="Email Collection" catLevel={5}>
                        <p>Where we currently hold no email address, our Advisor should ask the customer if they have one. If they do, ask if we can collect it. This helps keep the customer updated and can be used for future security checks. When an email is collected, validate that it is accurately updated on the account. Follow the Ui5 script provided.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "To ensure your records are up to date and that we can get in touch with you regarding your energy account can you please provide us with your email address?"
                        </blockquote>
                        <p>When an email address is collected:</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "Thanks very much for providing your additional contact details, this will help us to keep you updated and can be used as a future security check too."
                        </blockquote>
                        <p>Additional scripting when appropriate:</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            "As you have an email address did you know you can register to manage your account online or via the app; where you can enter meter reads, make payments and make changes to your account giving your more control over you energy?"
                        </blockquote>
                    </ScoringStep>
                    
                    <ScoringStep id="A8" title="Narratives" catLevel={5}>
                        <p>The narrative is clear, concise, and contains no jargon. It clearly reflects the information gathered from the customer contact. A narrative must be left in the following situations:</p>
                        <ul className="list-disc pl-5">
                            <li>To record customer reads that aren’t being used to bill the account.</li>
                            <li>To record meter details that we don’t yet have updated on the account.</li>
                            <li>Manual refund as requested by the customer (narrative must include the promise reference number).</li>
                            <li>Meter readings or starting meter readings (COS) that can’t be entered online (narrative must include the promise reference number if you have asked for these to be amended).</li>
                            <li>To record the Warm Home Discount reference number.</li>
                            <li>To record details of a failed metering appointment.</li>
                            <li>To record a promise reference number where you have agreed to call a customer back, or where they have requested a call back.</li>
                            <li>To record details of a failed metering appointment, if unable to raise a failed metering appointment via CRM.</li>
                            <li>To record an appointment date to fit a 2-pole isolator, and the reasons why the customer requested the appointment.</li>
                            <li>To record a promise reference number for details of a 3rd Party account consent if unable to add the 3rd Party.</li>
                            <li>When there is an issue updating reads and a promise is raised.</li>
                            <li>If you add a SNEED marker for a vulnerable customer, you need to advise why and for whom, as this may not always be the account holder.</li>
                            <li>If any action has been taken in relation to Warrant activity.</li>
                            <li>When you add a Promise to Pay.</li>
                            <li>When you signpost to a 3rd Party.</li>
                            <li>When you book an ECO.</li>
                            <li>When you give an RTI.</li>
                            <li>When you give an advance of credit.</li>
                            <li>When you send a manual gas flow.</li>
                            <li>When you take action by calling Itron if you cannot do it through the system.</li>
                        </ul>
                    </ScoringStep>

                    <ScoringStep id="A9" title="Promotion of Value Add" catLevel={4}>
                        <p>Offer the customer Additional services such as Appliance Cover and/or Boiler Care. Customer must be over 18 and a homeowner for Boiler Care. Exceed customer expectation by offering to look at other products or tariffs that could benefit the customer, not just dealing with their query.</p>
                        <blockquote className="border-l-4 pl-4 italic">
                        "While I'm speaking to you today I’ll also check you're getting the best value from your Scottish Power account with us, as there may be additional products of interest to you, or changing to a smart meter to give you a better understanding of your usage helping put you in control of your energy. But first let's resolve your query."
                        </blockquote>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>
      
      <AccordionItem value="section-slc25" asChild>
          <Card>
             <AccordionTrigger className="p-6 hover:no-underline">
                <SectionHeader 
                  title="SLC25 - Product Conversions"
                />
              </AccordionTrigger>
              <AccordionContent asChild>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                      <SubsectionHeader title="Customer Current Supplier Information"/>
                       <ScoringStep id="B1" title="Previous consumption" catLevel={3}>
                          <p>Prepopulated by system, advisor must inform annual kWh's used to calculate costs. For existing customers comparison will be made based on historical account information.</p>
                          <blockquote className="border-l-4 pl-4 italic">Estimated annual consumption for Elec is xxxx kWh and Gas is xxxxx kWh.</blockquote>
                          <p>Where appropriate did agent capture and record accurate meter reads from the customer. This will ensure accuracy of comparison provided.</p>
                      </ScoringStep>
                      <ScoringStep id="B2" title="Green Deal" catLevel={3}>
                          <p>This requirement is covered in key terms and B2 should be scored N/A.</p>
                      </ScoringStep>
                      
                      <SubsectionHeader title="Comparison Prices"/>
                      <ScoringStep id="C1" title="Needs analysis" catLevel={3}>
                          <p>Advisor establishes if customer is a homeowner and if they are over 18 years of age.</p>
                          <p>Customer is made aware of the available option or options at the time of the contact. Determines if customer has internet access and has an active email address and if they are happy to manage account online.</p>
                      </ScoringStep>
                      <ScoringStep id="C2" title="Needs analysis" catLevel={3}>
                          <p>In periods where a product range is available (E.G. online and offline, one year and 2-year, Cancer Research aligned) agent to confirm what is important to the customer.</p>
                          <p>In periods where product range is restricted or limited (EG online one year only) the agent should confirm that customer is eligible (EG – can manage an online account and has an active email address) and that they are presented with any options that might meet customer needs.</p>
                      </ScoringStep>
                      <ScoringStep id="C3" title="Needs analysis" catLevel={2}>
                          <p>Did the agent react appropriately and offer a tariff to meet the customer needs.</p>
                      </ScoringStep>
                      <ScoringStep id="C4" title="Features and Benefits" catLevel={3}>
                          <p>When SVT is the only available product this should be scored N/A. When promoting the tariff the agent must advise of tariff name, end date and features of the tariff.</p>
                      </ScoringStep>
                      <ScoringStep id="C5" title="Details of quote" catLevel={3}>
                          <p>For DF customers Advisor to ask customer how they would like the quote details presents.</p>
                      </ScoringStep>
                      <ScoringStep id="C6" title="Details of quote" catLevel={3}>
                          <p>When SVT is the only available product this should be scored N/A. Gas saving (+/-) elec saving (+/-) Savings must be given in £'s. Agent ensures transparency if SP is more expensive.</p>
                      </ScoringStep>
                      <ScoringStep id="C7" title="Details of quote" catLevel={3}>
                          <p>New gas cost, new elec cost, new total cost and new gas DD, elec DD and total DD amount, if applicable.</p>
                      </ScoringStep>
                      <ScoringStep id="C8" title="Details of quote" catLevel={3}>
                          <p>This should be scored N/A when SVT is the only available product. Inform customer of all monetary (£) G&E and or online discounts (if applicable).</p>
                      </ScoringStep>
                      <ScoringStep id="C9" title="Details of quote" catLevel={3}>
                          <p>Agent to advise customer of daily standing charge (pence per day) & unit rates for SP (pence per kWh), provided in full (all rates for Economy 7/White meter/ product specific) If agent comparing other supplier unit rates all must be provided.</p>
                      </ScoringStep>
                      <ScoringStep id="C10" title="Details of quote" catLevel={2}>
                          <p>This should be scored N/A when SVT is our only product. Customer advised of SP cancellation fees (if applicable) at the point of the comparison and when the agent presents the product key facts. (Must be given in £'s as displayed on Tariff breakdown and comparison screen).</p>
                      </ScoringStep>
                      
                      <SubsectionHeader title="Product Specific T&C's"/>
                      <ScoringStep id="D1A" title="Terms and Conditions" catLevel={2}>
                          <p>If the customer does not ask about fix term products – there is no compliance requirement to present the Must- read statement. Advisor provides product specific Terms and Conditions / Key Facts in full. Advisor follows UI5 script aligned to option to hear full T&Cs or have them sent to customer. Agent to read quote accuracy and VAT statement in full.</p>
                      </ScoringStep>
                      <ScoringStep id="D1B" title="Terms and Conditions" catLevel={2}>
                          <p>If customer wishes full key terms these must be read.</p>
                      </ScoringStep>
                      <ScoringStep id="D1C" title="Terms and Conditions" catLevel={2}>
                          <p>Advisor must gain a clear yes that the customer wants to go ahead with the contract.</p>
                      </ScoringStep>
                      <ScoringStep id="D2A" title="Bank or card details" catLevel={2}>
                          <p>Bank details provided by customer; account name, sort code & bank account number (applicable for all sales G&E, standalone EnergyServices). Must be provided/confirmed by bank account holder. At initial set up the customer will provide name on bank account, name of bank, sort code and account number or full card number, expiry date and CVV code. Where existing bank details are active - the bank account holders permission will be sought to use these in respect of any new product of service.</p>
                      </ScoringStep>
                      <ScoringStep id="D2B" title="Bank or card details" catLevel={2}>
                          <p>The agent must advise the customer they are covered by direct debit guarantee if the customer is moving to DD payment method from another, if this is a new DD customer, or if customer requests full terms and conditions to be read. Not required for existing DD customer switching tariffs but remaining on DD.</p>
                      </ScoringStep>
                      <ScoringStep id="D2C" title="Bank or card details" catLevel={2}>
                          <p>Applicable for all sales - Did the agent obtain authority from the customer if using third party details?</p>
                      </ScoringStep>
                      <ScoringStep id="D3" title="Marketing Consent" catLevel={3}>
                          <p>This is not a compliance requirement and should be scored N/A – please only score against quality requirement.</p>
                          <p>Where appropriate advisor must capture Marketing Consent. Marketing Consent must be captured or validated when processing a new sale, move in or product conversion. If marketing consent has been updated inside of the last 12 months the customer should be presented with the option to update. "I can see we recently checked your marketing preferences on (insert date presented via UI5) are they still relevant or would you like me to change anything today"</p>
                      </ScoringStep>
                  </Accordion>
                </CardContent>
              </AccordionContent>
          </Card>
      </AccordionItem>

       <AccordionItem value="section-slc26" asChild>
        <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader title="SLC 26 - Vulnerabilities"/>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                     <ScoringStep id="E1A" title="Vulnerability" catLevel={2}>
                        <p>Did the agent actively recognise or take appropriate steps to sensitively check with the customer if they are impacted by any vulnerable circumstances?</p>
                        <ul className="list-disc pl-5">
                            <li>Where vulnerability already recorded is this still relevant</li>
                            <li>At COT/Gain determine if any vulnerability/special circumstances</li>
                            <li>Where customer proactively demonstrates this during contact</li>
                            <li>Update narrative to evidence recognition/questioning</li>
                        </ul>
                        <blockquote className="border-l-4 pl-4 italic">
                            “OK, as you’ve mentioned that you have encountered some difficulties lately due to your health, let’s take a few moments to chat through that to be sure we capture any relevant information on your account relating to either temporary or long term changes in circumstances”.
                        </blockquote>
                    </ScoringStep>
                    <ScoringStep id="E1B" title="Vulnerability (Financial)" catLevel={2}>
                        <p>Did the agent actively recognise or take appropriate steps to sensitively check with the customer if they were having any payment difficulties?</p>
                        <blockquote className="border-l-4 pl-4 italic">
                            “OK, as you’ve mentioned that you’re struggling with your bills, let’s take a few moments to chat through what’s affordable for you and any additional payment options or support we may be able to provide”.
                        </blockquote>
                    </ScoringStep>
                     <ScoringStep id="E2A" title="SNEEDS" catLevel="2.5">
                        <SubsectionHeader title="Compliance Assessment" />
                        <p>Did the agent take appropriate action and/or act accordingly, fully updating the customers record to reflect any changes or new information gathered?</p>
                        <div className="space-y-2 mt-2">
                           <Label htmlFor="e2a-compliance-comment">Please enter comment</Label>
                           <Textarea id="e2a-compliance-comment" />
                        </div>
                        <SubsectionHeader title="Quality Assessment -- Requirements/Expectations" />
                        <p>Advisor should explain what this would mean for the customer ensuring accurate information is provided.</p>
                        <div className="space-y-2 mt-2">
                           <Label htmlFor="e2a-quality-comment">Please enter comment</Label>
                           <Textarea id="e2a-quality-comment" />
                        </div>
                    </ScoringStep>
                    <ScoringStep id="E2B" title="PSR" catLevel="2.5">
                        <SubsectionHeader title="Compliance Assessment" />
                        <p>Did the agent take all reasonable steps to promote the existence of the Priority Services Register and the Priority Services which may be available to the customer?</p>
                        <div className="space-y-2 mt-2">
                           <Label htmlFor="e2b-compliance-comment">Please enter comment</Label>
                           <Textarea id="e2b-compliance-comment" />
                        </div>
                        <SubsectionHeader title="Quality Assessment -- Requirements/Expectations" />
                        <p>Advisor should ensure this is explained appropriately to the customer and that clear and accurate information is provided in regards to services and what this means for the customer.</p>
                        <blockquote className="border-l-4 pl-4 italic">"Are you aware of our Priority Services Register & the benefits it may be to you?"</blockquote>
                        <blockquote className="border-l-4 pl-4 italic">"Our PSR services include; A Password Service and Nominated Person Scheme, Advice on special controls for your gas or electrical appliances, A meter reading service where all members of your household are unable to read your meter(s), We can arrange for one of our Community Liaison Officers to visit your home to offer help/advice etc., If you’re having difficulty engaging with us in English, you can use our interpretation service"</blockquote>
                         <div className="space-y-2 mt-2">
                           <Label htmlFor="e2b-quality-comment">Please enter comment</Label>
                           <Textarea id="e2b-quality-comment" />
                        </div>
                    </ScoringStep>
                    <ScoringStep id="E2C" title="PSR Consent" catLevel="2.5">
                        <SubsectionHeader title="Compliance Assessment" />
                        <p>"Shareable Vulnerabilities" - Advisor should explain to the customer that we will update their account and share their information with relevant 3rd parties to assist during emergencies or power outages. (Data Network Operator, Water companies)</p>
                        <p>"Non-Shareable Vulnerabilities" - Did the agent gain permission to update the customers account for emergencies or power outages?</p>
                        <div className="space-y-2 mt-2">
                           <Label htmlFor="e2c-compliance-comment">Please enter comment</Label>
                           <Textarea id="e2c-compliance-comment" />
                        </div>
                        <SubsectionHeader title="Quality Assessment -- Requirements/Expectations" />
                        <p>"Shareable Vulnerabilities" - Advisor should explain to the customer that we will update their account and share their information with relevant 3rd parties to assist during emergencies or power outages. (Data Network Operator, Water companies)</p>
                        <p>"Non-Shareable Vulnerabilities" - Advisor should explain to the customer that to add the information to their account, we need to gain their permission.</p>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="section-slc27" asChild>
        <Card>
            <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader 
                title="Ability to Pay (SLC 27)"
              />
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                <ScoringStep id="F1A" title="Ability to Pay" catLevel="2.5">
                    <p>Where payment difficulty is identified did the advisor offer a wide choice of payment methods to the customer explaining any differences between methods; Direct Debit; Monthly Cash; Instalment plans(Cash/Direct Debit); Prepayment; Fuel Direct. while also informing the customer that they can make a one off payment towards any arrears if suitable to help reduce any repayment term. Advisor takes care when offering payment methods to a customer ensuring the method  is the most suitable based on their needs / circumstances.</p>
                    <blockquote className="border-l-4 pl-4 italic">“I completely understand it’s no problem for us to look at an alternate payment arrangement for you, we’ll make sure you’re on the most affordable / suitable arrangement based on your circumstances and let you know about additional support available should you need it”.</blockquote>
                    <p>Advisor should discuss what's affordable for the customer to ensure a suitable payment value and/or repayment term for any arrears is agreed (Ensure Debt is genuine). It’s important when setting up repayment arrangements for customers that consideration is given to the length of time a customer is repaying their energy debt to ensure we are not prolonging their debt repayment unnecessarily (could impact ability to switch supplier). This should always be based on customers’ ability to pay and where struggling financially you should as part of discussions sign post the customer to additional support e.g. Stepchange. "Can I just check the amount we have agreed today is affordable for you each month?"  "Have your financial circumstances changed, which are impacting your ability to pay for your ongoing energy usage?"</p>
                </ScoringStep>
                <ScoringStep id="F1B" title="Payment Methods" catLevel="2.5">
                    <p>Did the advisor fully explain how the payment method works and ensure customer understanding; e.g. If Fuel Direct is chosen the customer has been provided with an explanation of how this is calculated, processed and what timescales to expect? If Pre-Payment is chosen the DRR process has been fully explained and value agreed.</p>
                    <blockquote className="border-l-4 pl-4 italic">"So to confirm we have set-up a payment arrangement of x, with a monthly/weekly amount of £x. This covers both your ongoing usage of £x and (if applicable) £x towards the arrears on your account."</blockquote>
                    <p>Advisor should also explain when any arrears will be cleared via an instalment plan where applicable.</p>
                </ScoringStep>
                <ScoringStep id="F1C" title="Energy Efficiency" catLevel="2.5">
                    <p>Did the advisor provide the customer with information on how to use their energy more efficiently to help reduce their charges; by either providing information or signposting to information.</p>
                    <blockquote className="border-l-4 pl-4 italic">"For help in reducing your usage and getting information on energy efficiency you can use the Energy Efficiency toolkit on our website scottishpower.co.uk/energy-efficiency or you can also go direct to Energysavingstrust.org.uk"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">"If you are unable to access online information I could give you the Freephone telephone number for the energy saving advice line" (no's differ in Scotland, England & Wales - provide the relevant number to the customer)</blockquote>
                </ScoringStep>
                <ScoringStep id="F1D" title="Ability to Pay Assessment" catLevel="2.5">
                    <p>Did the advisor complete the Ability to Pay assessment (DRR/IP Call); ensuring the customer was signposted to 3rd party support where appropriate (StepChange, Hardship Fund). If applicable agent must signpost customer to StepChange/Hardship fund.</p>
                    <p>Advisor must complete the Ability to Pay assessment in full via SAP and adhere to each individual question. Over and above this the agent should provide information on 3rd party support where appropriate;</p>
                    <blockquote className="border-l-4 pl-4 italic">"If you are struggling to pay the amount at anytime there is free debt advice available through the StepChange and you can apply for help through the SP hardship fund, depending on your personal circumstances they maybe able to help clear some of the balance for you, would you like me to give you those details today?"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">"Do you have pen & paper ready as they're is quite a bit of information I need to give you that StepChange will ask for"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">"I can also provide the website details as sometimes it is difficult to get through on the phone"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">“There are also other organisations I can provide the details on, would you also like information on these, i.e. Leap".</blockquote>
                </ScoringStep>
                <ScoringStep id="F2A" title="Instalment Plans / DRR set up" catLevel={2}>
                    <p>Did the agent ask the customer what they could afford to repay?</p>
                </ScoringStep>
                <ScoringStep id="F2B" title="Instalment Plans / DRR set up" catLevel={2}>
                    <p>Did the agent react appropriately and set up an affordable IP / DRR for the customer?</p>
                </ScoringStep>
                <ScoringStep id="F2C" title="Instalment Plans / DRR set up" catLevel={2}>
                    <p>A failure is recorded if the agent made any reference to a minimum repayment amount or a maximum repayment term</p>
                </ScoringStep>
                <ScoringStep id="F3" title="Instalment Plans / DRR set up" catLevel="2.5">
                    <p>Did the agent ask if making payment will affect other household bills?</p>
                </ScoringStep>
                <ScoringStep id="F4" title="Instalment Plans / DRR set up" catLevel={2.5}>
                    <p>In every case where the customer is struggling to pay (other than when setting up an IP/changing the DRR) did the agent signpost to Stepchange/any other debt advice charities?</p>
                    <blockquote className="border-l-4 pl-4 italic">"If you are struggling to pay the amount at any time there is free debt advice available through StepChange and you can apply for help through the SP hardship fund, depending on your personal circumstances they may be able to help clear some of the balance for you, would you like me to give you those details today?"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">"Do you have pen and paper ready as there is quite a bit of information I need to give you that StepChange will ask for"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">"I can also provide the website details as sometimes it is difficult to get through on the phone"</blockquote>
                    <blockquote className="border-l-4 pl-4 italic">"There are also other organisations I can provide the details on, would you also like information on these, i.e. Leap"</blockquote>
                </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="section-slc28" asChild>
        <Card>
           <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader title="SLC 28 - PrePayment Suitability"/>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <ScoringStep id="G1A" title="Explaining Prepayment" catLevel="2.5">
                        <p>When offering Pre-Payment as a payment method to the customer did the advisor explain the advantages and disadvantages of Pre-Payment including; how and where to pay; what to do if the meter is not operating effectively; how charges are paid; procedure for removing the PPM.</p>
                        <p>Advisor needs to explain to the customer how paying by Prepayment works as well as informing the customer of advantages and disadvantages. For example "I need to make you aware of some of the advantages & disadvantages of having a PP meter; Some of the advantages include:</p>
                        <ul className="list-disc pl-5">
                            <li>“Pay As You Go” could help you budget for your energy usage</li>
                            <li>The meter can be set to pay any money you owe at a fixed amount</li>
                            <li>Emergency credit facility for genuine emergencies</li>
                        </ul>
                         <p>Some of the disadvantages include:</p>
                         <ul className="list-disc pl-5">
                            <li>You have to be able to top-up via an outlet to keep your meter in credit & power on</li>
                            <li>You are likely to need to buy more credit in winter</li>
                            <li>If you have sight difficulties or other special needs, this might not be suitable</li>
                        </ul>
                        <p>If there is a debt recovery this also needs to be explained to the customer by agreeing a DRR to be collected via the meter. Advisor should also explain when any arrears will be cleared.</p>
                    </ScoringStep>
                    <ScoringStep id="G1B" title="Safe & Practicable Assessment" catLevel="2.5">
                        <p>Did the advisor compete the Safe & Practicable assessment; ensuring a clear assessment and consideration has been made as to whether it is safe and reasonably practicable to install a Pre-Payment meter in the customers home.</p>
                        <p>Advisor must complete the Safe & Practicable assessment in full via SAP and adhere to each individual question; "I need to ask you some questions to make sure a PP meter is the best option for you & that it's safe and practicable for you to have one installed?" (Consideration should be given to meters above head height, restricted access or temporary health circumstances)</p>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="section-dandg" asChild>
        <Card>
           <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader title="Domestic & General Boiler & Appliance Care Product Sales"/>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <ScoringStep id="H1" title="Did the agent read the eligibility questions in full?" catLevel={4}>
                        <p>Eligibility Questions Are:</p>
                        <ul className="list-disc pl-5">
                            <li>Does the agent confirm the customer owns the property?</li>
                            <li>Does the agent confirm the customers Boiler is less than 15 years old?</li>
                            <li>Does the agent confirm the customer has NO pre-existing faults?</li>
                            <li>Does the agent confirm the customers Boiler is mains gas and not (LPG, OIL, etc)?</li>
                            <li>Does the agent confirm the customers Boiler is out with manufactures guarantee?</li>
                        </ul>
                        <p>Appliance Care</p>
                        <ul className="list-disc pl-5">
                            <li>Does the agent confirm the make of the appliance?</li>
                            <li>Does the agent confirm the age of the appliance?</li>
                            <li>Does the agent confirm the appliance cost at the time of purchase?</li>
                            <li>Does the agent confirm that it is a domestic appliance and that is in good working order?</li>
                            <li>Does the agent confirm the customers appliance is out with manufactures guarantee?</li>
                        </ul>
                    </ScoringStep>
                    <ScoringStep id="H2A" title="Did the agent read the product keys facts in full?" catLevel={4}>
                         <ul className="list-disc pl-5">
                            <li>Does agent read "What's included" in full?</li>
                            <li>Did the agent advise there will be no extra costs associated with the replacement?</li>
                            <li>Did the agent set up the plan without advising pre-existing faults would be covered?</li>
                        </ul>
                    </ScoringStep>
                    <ScoringStep id="H2B" title="Did the agent read the product keys facts in full?" catLevel={4}>
                        <ul className="list-disc pl-5">
                            <li>Does agent give Monthly and Annual Costs to customer?</li>
                            <li>Does agent read "Main Exclusions" in full?</li>
                            <li>Did agent advise of plan duration?</li>
                        </ul>
                    </ScoringStep>
                    <ScoringStep id="H3A" title="Did the agent read the principal terms / compliance statements in full?" catLevel={4}>
                         <p>Did the agent correctly advise of 30 day wait prior to taking payment?</p>
                    </ScoringStep>
                     <ScoringStep id="H3B" title="Did the agent read the principal terms / compliance statements in full?" catLevel={4}>
                        <p>Did the agent correctly advise cancellation rights prior to taking payment?</p>
                    </ScoringStep>
                    <ScoringStep id="H3C" title="Did the agent read the principal terms / compliance statements in full?" catLevel={4}>
                        <p>Did the agent advise the correct payment renewal process to the customer prior to taking payment?</p>
                    </ScoringStep>
                    <ScoringStep id="H3D" title="Did the agent read the principal terms / compliance statements in full?" catLevel={4}>
                        <p>Did the agent advise the correct first payment date?</p>
                    </ScoringStep>
                    <ScoringStep id="H3E" title="Did the agent read the principal terms / compliance statements in full?" catLevel={4}>
                        <p>Did the agent complete any required actions to ensure the customer is not dual covered by D&G?</p>
                    </ScoringStep>
                    <ScoringStep id="H4" title="Did the agent enter the correct boiler make into the system?" catLevel={4}>
                        <p>(Does agent ask customer to confirm boiler type?)</p>
                        <p>Boiler Make - If unknown agent must read part of screen re explaining needs to get info or product may become void.</p>
                    </ScoringStep>
                    <ScoringStep id="H5A" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent answer any questions asked by the customer to the best of their ability?</p>
                    </ScoringStep>
                    <ScoringStep id="H5B" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent set up the plan without referring to the plan as insurance and without using insurance terms? e.g.. FSA, FCA, PRA, premium & policy</p>
                    </ScoringStep>
                     <ScoringStep id="H5C" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent set up the plan without referring to 'one off', 'special offer' or 'offer'?</p>
                    </ScoringStep>
                     <ScoringStep id="H5D" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent set up the plan without the suggesting to the customer must take up the plan today to secure the price?</p>
                    </ScoringStep>
                     <ScoringStep id="H5E" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent complete the sale using features and benefits rather than selling on cancellation period?</p>
                    </ScoringStep>
                     <ScoringStep id="H5F" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent set up the plan without advising the customer that there is no commitment/contract/tie-in? Development point, feedback only</p>
                    </ScoringStep>
                    <ScoringStep id="H5G" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent set up the plan without referring to the plan as a 'guarantee' and without guaranteeing or promising any part of the plan?</p>
                    </ScoringStep>
                    <ScoringStep id="H5H" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent complete any commitments made to the customer on the call?</p>
                    </ScoringStep>
                    <ScoringStep id="H5I" title="Agent behaviour & terminology" catLevel={4}>
                         <p>Did the agent set up the plan without suggesting any part of the plan or service is free of charge? Development point, feedback only</p>
                    </ScoringStep>
                    <ScoringStep id="H6" title="(Pressure selling) Customer Detriment" catLevel={4}>
                        <p>Did the agent conduct themselves in a professional manner through progressive contact handling (good call flow without persistent re-presenting where the customer has already declined / rejected offer)? Did the agent avoid presenting a time sensitive offer or special offer? Did the agent set up the sale using accurate information (avoiding scare tactics such as inflated repair costs above those that the plan would cover / product inefficiency without this cover) and without selling on cancellation rights?</p>
                    </ScoringStep>
                    <ScoringStep id="H7" title="Remediation" catLevel={4}>
                         <p>Is the call free from failed compliance elements which require remediation?</p>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="section-complaints" asChild>
        <Card>
           <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader title="Complaint Handling Standards"/>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <ScoringStep id="I1" title="Complaint Handling Standards" catLevel={3}>
                        <p>Only to be scored where complaint has been raised or where no complaint has been raised despite the customer having expressed dissatisfaction. Did the advisor follow and comply with ScottishPower Complaint Handling Standards?</p>
                        <ul className="list-disc pl-5">
                            <li>Genuine Complaint</li>
                            <li>Acknowledgement/Recognition</li>
                            <li>Signposting</li>
                            <li>Managing Expectations</li>
                            <li>Next Steps</li>
                            <li>Resolving where possible via RATOC</li>
                            <li>Adhere to UI5 processes</li>
                        </ul>
                         <p>If at any time a customer mentions OMB; Ofgem; CA etc. you must log a complaint, and where possible RATOC. If you are unable to resolve the customers complaint you must follow Ui5 in full ensuring the customer is signposted to our website and offered a postal copy of our standards if needed. If a customer has not mentioned OMB; Ofgem; CA etc. and there are signs of dissatisfaction, ask the number if they would like you to raise a complaint to resolve their issue. Remember if there is an action needed on the customers account this does not mean it is a complaint.</p>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="section-conduct" asChild>
        <Card>
           <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader title="Standards of Conduct"/>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <ScoringStep id="J1A" title="Standards of Conduct: Customer Detriment" catLevel={2}>
                        <p>Agent must not mislead the customer in any way. Agent must not use pressure selling tactics e.g. advising tariffs are bespoke. Agent must remain open, honest and transparent throughout call.</p>
                        <p>Advisor MUST demonstrate good standards of conduct;</p>
                         <ul className="list-disc pl-5">
                            <li>Being fair, appropriate, professional, honest and transparent in every interaction we have with the customer</li>
                            <li>Providing the customer with information that is accurate, simple, straightforward, correct and in a suitable format for their need</li>
                            <li>Providing a level of service to meet the customers needs and where possible make managing your account easier</li>
                        </ul>
                        <p>Advisor must not use pressure tactics during the call.</p>
                    </ScoringStep>
                    <ScoringStep id="J1B" title="Standards of Conduct: Customer Detriment" catLevel={2}>
                        <p>Agent must not talk negatively about other companies.</p>
                        <p>It is expected that advisors do not portray other energy suppliers in a negative light to favour ScottishPower in an attempt to sign a customer up to a product or service. Advisors must be professional at all times and understand that we can only speak to the service we aim to provide to our customers.</p>
                    </ScoringStep>
                    <ScoringStep id="J1C" title="Standards of Conduct: Customer Detriment" catLevel={2}>
                        <p>J1C should be scored N/A when SVT is our only product – please also score quality requirement as N/A.</p>
                        <p>Customer aware they are not signing for information only and/or Agent has not sold on cooling off period and the Customer is happy to proceed.</p>
                        <p>Advisor must ensure that they have followed the required scripting though out this process and are not misleading the customer in any way in regards to what they are signing up to. Advisors should not refer to this in any way as information only e.g. ‘I can send you some information on that product’ etc. this must be clear to the customer re the actions being taken and is clear the customer understands.</p>
                    </ScoringStep>
                    <ScoringStep id="J2A" title="Standards of Conduct: No Customer Detriment" catLevel="2.5">
                        <p>Did the agent provide inaccurate/incomplete information however no clearly identifiable customer detriment (training required).</p>
                        <p>Advisor MUST demonstrate Treating Customers Fairly;</p>
                        <ul className="list-disc pl-5">
                            <li>Listen to each customer as an individual, to understand their circumstances and deliver solutions that meet their needs</li>
                            <li>Communicating with our customers in plain and simple language; Advisor maintains an acceptable pace and tone throughout call. They do not use slang or negative language and adapt their style to suit the caller. Language is clear and understandable.</li>
                            <li>Ensuring all information we give our customers is complete and accurate</li>
                        </ul>
                    </ScoringStep>
                    <ScoringStep id="J2B" title="Standards of Conduct: No Customer Detriment" catLevel="2.5">
                        <p>Did the agent conduct themselves in a professional manner, maintaining an acceptable pace and tone, and answering customer questions throughout the call, ensuring full customer understanding?</p>
                        <p>Advisor MUST demonstrate Treating Customers Fairly;</p>
                        <ul className="list-disc pl-5">
                            <li>Listen to each customer as an individual, to understand their circumstances and deliver solutions that meet their needs</li>
                            <li>Communicating with our customers in plain and simple language; Advisor maintains an acceptable pace and tone throughout call. They do not use slang or negative language and adapt their style to suit the caller. Language is clear and understandable.</li>
                            <li>Ensuring all information we give our customers is complete and accurate</li>
                        </ul>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="section-consolidation" asChild>
        <Card>
           <AccordionTrigger className="p-6 hover:no-underline">
              <SectionHeader title="Consolidation"/>
            </AccordionTrigger>
            <AccordionContent asChild>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <ScoringStep id="K1" title="Consolidation / Recap" catLevel={4}>
                        <p>Please score this compliance condition as N/A – please only score the Quality Assessment – Requirements / Expectations.</p>
                        <p>Advisor recaps the call confirming what actions were taken, checking all the customers questions have been answered e.g. flat request resolved, new product agreed etc. checking if we can do anything else for the customer.</p>
                        <p>Advisor adheres to the structure of recap, checking the customer is happy with the summary and offering to clarify any points by asking the customer if they have any questions and or/if there is anything else they can help the customer with.</p>
                        <blockquote className="border-l-4 pl-4 italic">For example “What I’ve done for you today is...., do you understand everything we have discussed today? Do you have any further questions? Great so what will happen next is..., Can I help you with anything else? Perfect ok thanks very much for your call today, goodbye”.</blockquote>
                    </ScoringStep>
                </Accordion>
              </CardContent>
            </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
    </>
  );
}
