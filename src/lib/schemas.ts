
import { z } from "zod";
import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';

// Schema for the updated Instalment Plan Calculator
export const InstalmentPlanSchema = z.object({
  currentBalance: z.coerce.number().positive({ message: "Current balance must be a positive number." }).optional().or(z.literal('')),
  startDate: z.string().refine((date) => date && isValid(parseISO(date)), { message: "Please enter a valid start date."}),
  usageAmount: z.coerce.number().min(0, { message: "Usage amount cannot be negative." }).optional().or(z.literal('')),
  instalmentAmount: z.coerce.number().min(0, { message: "Instalment amount must be non-negative." }).optional().or(z.literal('')),
});
export type InstalmentPlanFormValues = z.infer<typeof InstalmentPlanSchema>;

const SingleTariffSchema = z.object({
  name: z.string().min(1, { message: "Tariff name is required." }).optional().or(z.literal('')),
  electricityStandingCharge: z.coerce.number().min(0, "Cannot be negative (p/day).").optional().or(z.literal('')),
  electricityUnitRate1: z.coerce.number().min(0, "Cannot be negative (p/kWh).").optional().or(z.literal('')),
  electricityUnitRate2: z.coerce.number().min(0, "Cannot be negative (p/kWh).").optional().or(z.literal('')),
  electricityUnitRate3: z.coerce.number().min(0, "Cannot be negative (p/kWh).").optional().or(z.literal('')),
  gasStandingCharge: z.coerce.number().min(0, "Cannot be negative (p/day).").optional().or(z.literal('')),
  gasUnitRate: z.coerce.number().min(0, "Cannot be negative (p/kWh).").optional().or(z.literal('')),
});

export const EnergyTariffComparisonSchema = z.object({
  usageData: z.object({
    electricityUsage1: z.coerce.number().min(0, "Cannot be negative (kWh/year).").optional().or(z.literal('')),
    electricityUsage2: z.coerce.number().min(0, "Cannot be negative (kWh/year).").optional().or(z.literal('')),
    electricityUsage3: z.coerce.number().min(0, "Cannot be negative (kWh/year).").optional().or(z.literal('')),
    gasUsage: z.coerce.number().min(0, "Cannot be negative (kWh/year).").optional().or(z.literal('')),
  }),
  tariffs: z.array(SingleTariffSchema).min(1, "At least one tariff is required for comparison.").optional(),
});

export type EnergyTariffComparisonFormValues = z.infer<typeof EnergyTariffComparisonSchema>;
export type SingleTariffFormValues = z.infer<typeof SingleTariffSchema>;

// Schema for Energy Usage Calculator (Meter Readings / Direct kWh)
export const EnergyUsageSchema = z.object({
  startDate: z.string().refine((date) => date && isValid(parseISO(date)), { message: "Valid start date is required." }).optional().or(z.literal('')),
  endDate: z.string().refine((date) => date && isValid(parseISO(date)), { message: "Valid end date is required." }).optional().or(z.literal('')),
  
  inputMode: z.enum(["readings", "direct"]),

  // Fields for "readings" mode
  electricStartReading1: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  electricEndReading1: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  electricStartReading2: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  electricEndReading2: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  electricStartReading3: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  electricEndReading3: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  gasStartReading: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  gasEndReading: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  gasUnitType: z.enum(["metric", "imperial"]).optional(),

  // Fields for "direct" mode
  electricUnits1: z.coerce.number().min(0, "Units must be non-negative.").optional().or(z.literal('')),
  electricUnits2: z.coerce.number().min(0, "Units must be non-negative.").optional().or(z.literal('')),
  electricUnits3: z.coerce.number().min(0, "Units must be non-negative.").optional().or(z.literal('')),
  gasUnits: z.coerce.number().min(0, "Units must be non-negative.").optional().or(z.literal('')),
  
  // Common rate and standing charge fields
  electricRate1: z.coerce.number().min(0, "Rate must be non-negative.").optional().or(z.literal('')),
  electricRate2: z.coerce.number().min(0, "Rate must be non-negative.").optional().or(z.literal('')),
  electricRate3: z.coerce.number().min(0, "Rate must be non-negative.").optional().or(z.literal('')),
  electricStandingCharge: z.coerce.number().min(0, "Charge must be non-negative.").optional().or(z.literal('')),
  gasRate: z.coerce.number().min(0, "Rate must be non-negative.").optional().or(z.literal('')),
  gasStandingCharge: z.coerce.number().min(0, "Charge must be non-negative.").optional().or(z.literal('')),

}).superRefine((data, ctx) => {
  if (data.startDate && data.endDate && isValid(parseISO(data.startDate)) && isValid(parseISO(data.endDate))) {
    const startDate = parseISO(data.startDate);
    const endDate = parseISO(data.endDate);
    if (endDate < startDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date cannot be before start date.", path: ["endDate"] });
    }
    if (differenceInCalendarDays(endDate, startDate) < 0) { 
       ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Number of days must be non-negative.", path: ["endDate"] });
    }
  }

  const checkReadingOrder = (startReading: any, endReading: any, path: string, label: string) => {
    const start = typeof startReading === 'string' && startReading !== '' ? parseFloat(startReading) : startReading;
    const end = typeof endReading === 'string' && endReading !== '' ? parseFloat(endReading) : endReading;
    if (typeof start === 'number' && typeof end === 'number' && !isNaN(start) && !isNaN(end) && end < start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} end reading must be >= start reading.`, path: [path] });
    }
  };

  if (data.inputMode === "readings") {
    checkReadingOrder(data.electricStartReading1, data.electricEndReading1, "electricEndReading1", "Electricity Rate 1");
    checkReadingOrder(data.electricStartReading2, data.electricEndReading2, "electricEndReading2", "Electricity Rate 2");
    checkReadingOrder(data.electricStartReading3, data.electricEndReading3, "electricEndReading3", "Electricity Rate 3");
    checkReadingOrder(data.gasStartReading, data.gasEndReading, "gasEndReading", "Gas");
  }
});

export type EnergyUsageFormValues = z.infer<typeof EnergyUsageSchema>;


// Schema for Agreed Reads Calculator
export const AgreedReadsSchema = z.object({
  startDate: z.string().refine(val => val && isValid(parseISO(val)), { message: "Valid start date is required." }).optional().or(z.literal('')),
  endDate: z.string().refine(val => val && isValid(parseISO(val)), { message: "Valid end date is required." }).optional().or(z.literal('')),
  proposedDate: z.string().refine(val => val && isValid(parseISO(val)), { message: "Valid proposed date is required." }).optional().or(z.literal('')),

  startReading1: z.coerce.number().optional().or(z.literal('')),
  endReading1: z.coerce.number().optional().or(z.literal('')),

  startReading2: z.coerce.number().optional().or(z.literal('')),
  endReading2: z.coerce.number().optional().or(z.literal('')),

  startReading3: z.coerce.number().optional().or(z.literal('')),
  endReading3: z.coerce.number().optional().or(z.literal('')),

  startReadingGas: z.coerce.number().optional().or(z.literal('')),
  endReadingGas: z.coerce.number().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  const { startDate: sDateStr, endDate: eDateStr, proposedDate: pDateStr } = data;

  if (sDateStr && !isValid(parseISO(sDateStr))) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid start date.", path: ["startDate"] });
  if (eDateStr && !isValid(parseISO(eDateStr))) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid end date.", path: ["endDate"] });
  if (pDateStr && !isValid(parseISO(pDateStr))) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid proposed date.", path: ["proposedDate"] });
  
  if (sDateStr && eDateStr && isValid(parseISO(sDateStr)) && isValid(parseISO(eDateStr))) {
    const startDate = parseISO(sDateStr);
    const endDate = parseISO(eDateStr);
    if (endDate <= startDate) { 
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date.", path: ["endDate"] });
    }
  }
  
  const checkReadingPairOrder = (startVal: any, endVal: any, rateName: string, endFieldPath: string) => {
    const startNum = typeof startVal === 'string' && startVal !== '' ? parseFloat(startVal) : typeof startVal === 'number' ? startVal : NaN;
    const endNum = typeof endVal === 'string' && endVal !== '' ? parseFloat(endVal) : typeof endVal === 'number' ? endVal : NaN;

    if (!isNaN(startNum) && !isNaN(endNum) && endNum < startNum) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `End reading for ${rateName} must be >= start reading.`, path: [endFieldPath] });
    }
  };

  checkReadingPairOrder(data.startReading1, data.endReading1, "Rate 1", "endReading1");
  checkReadingPairOrder(data.startReading2, data.endReading2, "Rate 2", "endReading2");
  checkReadingPairOrder(data.startReading3, data.endReading3, "Rate 3", "endReading3");
  checkReadingPairOrder(data.startReadingGas, data.endReadingGas, "Gas", "endReadingGas");
});

export type AgreedReadsFormValues = z.infer<typeof AgreedReadsSchema>;


// Schema for Burns Test Calculator
const BurnsTestDayReadingsSchema = z.object({
  day1: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  day2: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  day3: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  day4: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  day5: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  day6: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
  day7: z.coerce.number().min(0, "Reading must be non-negative.").optional().or(z.literal('')),
});

export const BurnsTestSchema = z.object({
  electricityRate1Readings: BurnsTestDayReadingsSchema.optional(),
  electricityRate2Readings: BurnsTestDayReadingsSchema.optional(),
  electricityRate3Readings: BurnsTestDayReadingsSchema.optional(),
  gasReadings: BurnsTestDayReadingsSchema.optional(),
}).superRefine((data, ctx) => {
  const readingSets = [
    { readings: data.electricityRate1Readings, pathPrefix: "electricityRate1Readings", name: "Electricity Rate 1" },
    { readings: data.electricityRate2Readings, pathPrefix: "electricityRate2Readings", name: "Electricity Rate 2" },
    { readings: data.electricityRate3Readings, pathPrefix: "electricityRate3Readings", name: "Electricity Rate 3" },
    { readings: data.gasReadings, pathPrefix: "gasReadings", name: "Gas" },
  ];

  readingSets.forEach(set => {
    if (set.readings) {
      const days = ["day1", "day2", "day3", "day4", "day5", "day6", "day7"] as const;
      for (let i = 0; i < days.length - 1; i++) {
        const dayAVal = set.readings[days[i]];
        const dayBVal = set.readings[days[i+1]];
        
        const dayANum = (typeof dayAVal === 'string' && dayAVal !== '') ? parseFloat(dayAVal) : typeof dayAVal === 'number' ? dayAVal : NaN;
        const dayBNum = (typeof dayBVal === 'string' && dayBVal !== '') ? parseFloat(dayBVal) : typeof dayBVal === 'number' ? dayBVal : NaN;

        if (!isNaN(dayANum) && !isNaN(dayBNum) && dayBNum < dayANum) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${set.name} Day ${i + 2} reading cannot be less than Day ${i + 1} reading.`,
            path: [`${set.pathPrefix}.${days[i+1]}`],
          });
        }
      }
    }
  });
});

export type BurnsTestFormValues = z.infer<typeof BurnsTestSchema>;

// Schema for Dual Fuel Calculator
export const DualFuelSchema = z.object({
  ongoingElecUsage: z.coerce.number().min(0, "Usage must be a positive number.").optional().or(z.literal('')),
  elecBalance: z.coerce.number().optional().or(z.literal('')),
  ongoingGasUsage: z.coerce.number().min(0, "Usage must be a positive number.").optional().or(z.literal('')),
  gasBalance: z.coerce.number().optional().or(z.literal('')),
});
export type DualFuelFormValues = z.infer<typeof DualFuelSchema>;
