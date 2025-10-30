
"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord, Employee, RosterShift } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { employees as staticEmployees, attendance as staticAttendance, roster as staticRoster } from '@/lib/data';


const formSchema = z.object({
  employeeId: z.string({
    required_error: "Please select an employee.",
  }),
});

const ITEMS_PER_PAGE = 5;

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>(staticEmployees);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>(staticAttendance);
  const [roster, setRoster] = useState<RosterShift[]>(staticRoster);

  const employeesLoading = false;
  const attendanceLoading = false;
  const rosterLoading = false;

  const employeeMap = useMemo(() => {
    if (!employees) return {};
    return employees.reduce((acc, emp) => {
        acc[emp.id] = emp;
        return acc;
    }, {} as Record<string, Employee>);
  }, [employees]);

  const totalPages = Math.ceil((attendanceLog?.length ?? 0) / ITEMS_PER_PAGE);
  const paginatedLog = useMemo(() => {
    if (!attendanceLog) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return [...attendanceLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.clockInTime.localeCompare(a.clockInTime)).slice(startIndex, endIndex);
  }, [attendanceLog, currentPage]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleClockIn = async (values: z.infer<typeof formSchema>) => {
    const employeeId = values.employeeId;
    const today = format(new Date(), "yyyy-MM-dd");

    const existingEntry = attendanceLog?.find(
      (record) => record.employeeId === employeeId && record.status === 'Clocked In'
    );

    if (existingEntry) {
      toast({
        variant: "destructive",
        title: "Already Clocked In",
        description: `${employeeMap[employeeId]?.name} is already clocked in for today.`,
      });
      return;
    }
    
    const clockInTime = format(new Date(), "HH:mm");
    const employeeRoster = roster?.find(r => r.employeeId === employeeId);
    const shiftStartTime = employeeRoster?.shifts[format(new Date(), 'EEEE')]?.split('-')[0] || "09AM";
    
    let shiftHour = parseInt(shiftStartTime.match(/\d+/)?.[0] || '9');
    if (shiftStartTime.includes('PM') && shiftHour !== 12) shiftHour += 12;
    
    const [clockInHour, clockInMinute] = clockInTime.split(':').map(Number);
    
    const isLate = clockInHour > shiftHour || (clockInHour === shiftHour && clockInMinute > 5);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      date: today,
      clockInTime,
      clockOutTime: null,
      status: isLate ? 'Late' : 'Clocked In',
    };

    setAttendanceLog(prev => [newRecord, ...prev]);
    toast({
      title: "Clocked In!",
      description: `${employeeMap[employeeId]?.name} clocked in at ${clockInTime}.`,
    });
    form.reset();
  };

  const handleClockOut = async (values: z.infer<typeof formSchema>) => {
    const employeeId = values.employeeId;
    
    const recordToUpdate = attendanceLog?.find(
      (record) => record.employeeId === employeeId && record.status !== 'Clocked Out'
    );

    if (!recordToUpdate) {
      toast({
        variant: "destructive",
        title: "Not Clocked In",
        description: `${employeeMap[employeeId]?.name} has not clocked in today or has already clocked out.`,
      });
      return;
    }

    const clockOutTime = format(new Date(), "HH:mm");
    
    setAttendanceLog(currentLog => currentLog.map(rec => 
        rec.id === recordToUpdate.id 
        ? { ...rec, clockOutTime: clockOutTime, status: 'Clocked Out' } 
        : rec
    ));

    toast({
      title: "Clocked Out!",
      description: `${employeeMap[employeeId]?.name} clocked out at ${clockOutTime}.`,
    });
    form.reset();
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  return (
    <>
      <PageHeader
        title="Attendance"
        description="Clock in/out and view the daily attendance log."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Time Clock</CardTitle>
              <CardDescription>Select your name to clock in or out.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                <p className="text-4xl font-bold font-mono">
                  {format(currentTime, "hh:mm:ss a")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(currentTime, "EEEE, MMMM do, yyyy")}
                </p>
              </div>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger disabled={employeesLoading}>
                              <SelectValue placeholder="Select your name" />
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" onClick={form.handleSubmit(handleClockIn)}>Clock In</Button>
                    <Button type="button" variant="destructive" onClick={form.handleSubmit(handleClockOut)}>Clock Out</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Log</CardTitle>
              <CardDescription>
                Recent clock-in and clock-out records.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(attendanceLoading || employeesLoading) && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48"/></TableCell>
                        <TableCell><Skeleton className="h-4 w-16"/></TableCell>
                        <TableCell><Skeleton className="h-4 w-16"/></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full"/></TableCell>
                    </TableRow>
                  ))}
                  {!attendanceLoading && !employeesLoading && paginatedLog.map((record) => {
                    const employee = employeeMap[record.employeeId];
                    if (!employee) return null;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-muted-foreground">
                                {format(new Date(record.date), "MMM d, yyyy")}
                                </div>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>{record.clockInTime}</TableCell>
                        <TableCell>{record.clockOutTime || "--:--"}</TableCell>
                        <TableCell>
                          <Badge variant={
                              record.status === "Clocked In" ? "default" : 
                              record.status === "Late" ? "destructive" : "secondary"
                            }
                            className={
                                record.status === 'Clocked In' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                record.status === 'Late' ? '' :
                                ''
                            }>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="flex items-center justify-between pt-6">
                <div className="text-sm text-muted-foreground">
                    Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    >
                    Previous
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    >
                    Next
                    </Button>
                </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
