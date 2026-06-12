
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, isValid } from "date-fns";

export interface SmartMeterAppointmentState {
  appointmentDate?: Date;
  appointmentTimeSlot?: string;
  summary?: string;
}

interface BookSmartMeterAppointmentFlowProps {
  onStateChange: (state: SmartMeterAppointmentState) => void;
}

const timeSlots = ["8-12", "10-2", "12-4", "2-6"];

export function BookSmartMeterAppointmentFlow({ onStateChange }: BookSmartMeterAppointmentFlowProps) {
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('');

  useEffect(() => {
    let summary = 'No appointment details entered.';
    if (appointmentDate && appointmentTimeSlot) {
      summary = `Appointment booked for ${format(appointmentDate, "dd-MM-yyyy")} at ${appointmentTimeSlot}.`;
    } else if (appointmentDate) {
      summary = `Appointment date selected: ${format(appointmentDate, "dd-MM-yyyy")}, time slot pending.`;
    } else if (appointmentTimeSlot) {
        summary = `Appointment time slot selected: ${appointmentTimeSlot}, date pending.`
    }

    onStateChange({
      appointmentDate,
      appointmentTimeSlot,
      summary,
    });
  }, [appointmentDate, appointmentTimeSlot, onStateChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Flow: Book Smart Meter Appointment</CardTitle>
        <CardDescription>
          Select the date and time for the smart meter installation appointment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>Appointment Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !appointmentDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appointmentDate ? format(appointmentDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar 
                        mode="single" 
                        selected={appointmentDate} 
                        onSelect={setAppointmentDate} 
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                        initialFocus 
                    />
                </PopoverContent>
            </Popover>
        </div>
        
        <div className="space-y-2">
            <Label>Appointment Time Slot</Label>
            <RadioGroup value={appointmentTimeSlot} onValueChange={setAppointmentTimeSlot} className="grid grid-cols-2 gap-4">
              {timeSlots.map(slot => (
                <div key={slot} className="flex items-center space-x-2">
                  <RadioGroupItem value={slot} id={`slot-${slot}`} />
                  <Label htmlFor={`slot-${slot}`}>{slot}</Label>
                </div>
              ))}
            </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}

    