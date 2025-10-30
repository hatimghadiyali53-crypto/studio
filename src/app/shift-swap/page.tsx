
"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, setHours, setMinutes } from "date-fns";
import {
  CalendarIcon,
  Check,
  CircleDashed,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getShiftSwapSuggestions } from "./actions";
import {
  ShiftSwapOutput,
  type ShiftSwapSuggestion,
} from "@/ai/flows/shift-swap-suggestion";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import type { Employee } from "@/lib/types";

const formSchema = z.object({
  requestingEmployeeId: z.string({
    required_error: "Please select the requesting employee.",
  }),
  shiftDateTime: z.date({ required_error: "A shift date is required." }),
  shiftTime: z.string({ required_error: "A shift time is required."}),
  reason: z.string().min(10, "Reason must be at least 10 characters long."),
});

const procedureItems = [
    { id: 'proc-1', label: 'Inform Shift Lead of the approved swap.'},
    { id: 'proc-2', label: 'Verify take-home tub weight with covering employee.'},
    { id: 'proc-3', label: 'Ensure cash drawer is balanced and signed off.'},
]

export default function ShiftSwapPage() {
  const [suggestions, setSuggestions] = useState<ShiftSwapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ShiftSwapSuggestion | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const employeesQuery = useMemoFirebase(() => firestore && user ? collection(firestore, 'employees') : null, [firestore, user]);
  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);

    const [hours, minutes] = values.shiftTime.split(':').map(Number);
    const combinedDateTime = setMinutes(setHours(values.shiftDateTime, hours), minutes);

    const result = await getShiftSwapSuggestions({
      requestingEmployeeId: values.requestingEmployeeId,
      shiftDateTime: combinedDateTime.toISOString(),
      reason: values.reason,
    });

    if (result.success) {
      setSuggestions(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsLoading(false);
  }
  
  const handleConfirmSwap = () => {
    toast({
        title: "Swap Confirmed!",
        description: `${selectedSuggestion?.name} will now cover the shift.`,
    });
    setSelectedSuggestion(null);
    setSuggestions(null);
    form.reset();
  }

  return (
    <>
      <PageHeader
        title="Shift Swap"
        description="Request a shift swap and get AI-powered suggestions for replacements."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request a Swap</CardTitle>
            <CardDescription>
              Fill out the form to find a suitable replacement for your shift.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="requestingEmployeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requesting Employee</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={employeesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shiftDateTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Shift Date</FormLabel>
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
                                    format(field.value, "PPP")
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
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
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
                      name="shiftTime"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shift Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Swap</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Family emergency, doctor's appointment..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading || employeesLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Find Suggestions
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> AI Suggestions
            </CardTitle>
            <CardDescription>
              Suitable candidates based on availability and qualifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
            {isLoading && (
              <div className="space-y-2">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">
                  Analyzing schedules...
                </p>
              </div>
            )}
            {!isLoading && !suggestions && !selectedSuggestion && (
              <div className="space-y-2">
                <CircleDashed className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Suggestions will appear here once you submit a request.
                </p>
              </div>
            )}
            {suggestions && !selectedSuggestion && (
              <div className="w-full space-y-4">
                {suggestions.suggestions.map((s) => (
                  <div
                    key={s.suggestedEmployeeId}
                    className="rounded-lg border p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{s.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Suitability: {s.suitabilityScore}/100
                        </p>
                      </div>
                       <Button size="sm" onClick={() => setSelectedSuggestion(s)}>Confirm</Button>
                    </div>
                    <p className="mt-2 text-sm">{s.reason}</p>
                  </div>
                ))}
              </div>
            )}
            {selectedSuggestion && (
                 <div className="w-full text-left space-y-4">
                    <h3 className="text-lg font-semibold">Finalize Swap with {selectedSuggestion.name}</h3>
                    <p className="text-sm text-muted-foreground">Please complete the following procedures to finalize the shift swap.</p>
                    <div className="space-y-3 rounded-lg border p-4">
                        {procedureItems.map(item => (
                             <div key={item.id} className="flex items-center space-x-3">
                                <Checkbox id={item.id} />
                                <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {item.label}
                                </label>
                            </div>
                        ))}
                    </div>
                     <div className="flex gap-2">
                        <Button onClick={handleConfirmSwap}>
                            <Check className="mr-2 h-4 w-4" />
                            Complete Swap
                        </Button>
                        <Button variant="ghost" onClick={() => setSelectedSuggestion(null)}>Back</Button>
                     </div>
                 </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    