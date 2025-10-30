
"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Download, Pencil, Save } from "lucide-react";
import type { Employee, RosterShift } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function RosterPage() {
  const [isEditing, setIsEditing] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const employeesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'employees');
  }, [firestore, user]);

  const rosterQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'roster');
  }, [firestore, user]);

  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);
  const { data: roster, isLoading: rosterLoading } = useCollection<RosterShift>(rosterQuery);
  
  // Local state to manage edits before saving
  const [localRoster, setLocalRoster] = useState<RosterShift[] | null>(null);

  useEffect(() => {
    if (roster) {
      // Create a deep copy for local editing to avoid mutating the original state
      setLocalRoster(JSON.parse(JSON.stringify(roster)));
    }
  }, [roster]);

  const employeeMap = useMemo(() => {
    if (!employees) return {};
    return employees.reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {} as Record<string, Employee>);
  }, [employees]);
  
  const handleEditToggle = async () => {
    if (isEditing && localRoster && firestore) {
        // "Save" changes by updating each document in Firestore
        const promises = localRoster.map(schedule => {
            const rosterDocRef = doc(firestore, 'roster', schedule.id);
            return updateDocumentNonBlocking(rosterDocRef, { shifts: schedule.shifts });
        });
        await Promise.all(promises);
    } else if (!isEditing && roster) {
        // Enter edit mode, copy firestore data to local state
        setLocalRoster(JSON.parse(JSON.stringify(roster)));
    }
    setIsEditing(!isEditing);
  };

  const handleShiftChange = (employeeId: string, day: string, value: string) => {
    setLocalRoster(currentRoster => {
      if (!currentRoster) return null;
      return currentRoster.map(schedule => {
        if (schedule.employeeId === employeeId) {
          return {
            ...schedule,
            shifts: {
              ...schedule.shifts,
              [day]: value,
            },
          };
        }
        return schedule;
      });
    });
  };
  
  const handleExport = () => {
    if(!roster) return;
    const headers = ["Employee", ...weekDays];
    const csvRows = [headers.join(",")];

    roster.forEach(schedule => {
      const employee = employeeMap[schedule.employeeId];
      if (employee) {
        const row = [
          `"${employee.name}"`,
          ...weekDays.map(day => `"${schedule.shifts[day] || 'OFF'}"`)
        ];
        csvRows.push(row.join(","));
      }
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "roster.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const displayRoster = isEditing ? localRoster : roster;

  return (
    <>
      <PageHeader title="Weekly Roster" description="View and manage the employee schedule for the current week.">
        <Button variant="outline" onClick={handleEditToggle} disabled={!localRoster}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
          {isEditing ? "Save Roster" : "Edit Roster"}
        </Button>
        <Button onClick={handleExport} disabled={!roster || roster.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PageHeader>
      
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {(rosterLoading || employeesLoading) && Array.from({length: 3}).map((_, i) => (
             <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
        ))}
        {!rosterLoading && !employeesLoading && displayRoster?.map(schedule => {
            const employee = employeeMap[schedule.employeeId];
            if (!employee) return null;
            return (
                <Card key={employee.id}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar>
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-muted-foreground">{employee.role}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                           {weekDays.map(day => (
                                <div key={day} className="flex justify-between items-center">
                                    <span className="font-medium text-sm">{day}</span>
                                     {isEditing ? (
                                        <Input
                                            value={schedule.shifts[day] || ''}
                                            onChange={(e) => handleShiftChange(schedule.employeeId, day, e.target.value)}
                                            className="h-8 w-32"
                                            placeholder="e.g., 9AM-5PM"
                                        />
                                    ) : schedule.shifts[day] === 'OFF' || !schedule.shifts[day] ? (
                                        <span className="text-muted-foreground text-sm">OFF</span>
                                    ) : (
                                        <div className="rounded-md bg-secondary px-2 py-1 text-center text-sm text-secondary-foreground">
                                            {schedule.shifts[day]}
                                        </div>
                                    )}
                                </div>
                           ))}
                        </div>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Employee</TableHead>
                {weekDays.map((day) => (
                  <TableHead key={day}>{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rosterLoading || employeesLoading) && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    {weekDays.map(day => <TableCell key={day}><Skeleton className="h-8 w-full" /></TableCell>)}
                </TableRow>
              ))}
              {!rosterLoading && !employeesLoading && displayRoster?.map((schedule: RosterShift) => {
                const employee = employeeMap[schedule.employeeId];
                if (!employee) return null;

                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    {weekDays.map((day) => (
                      <TableCell key={day}>
                        {isEditing ? (
                          <Input
                            value={schedule.shifts[day] || ''}
                            onChange={(e) => handleShiftChange(employee.id, day, e.target.value)}
                            className="h-8"
                            placeholder="e.g., 9AM-5PM"
                          />
                        ) : schedule.shifts[day] === 'OFF' || !schedule.shifts[day] ? (
                          <span className="text-muted-foreground">OFF</span>
                        ) : (
                          <div className="rounded-md bg-secondary px-2 py-1 text-center text-sm text-secondary-foreground">
                            {schedule.shifts[day]}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
               {!rosterLoading && (!displayRoster || displayRoster.length === 0) && (
                <TableRow>
                  <TableCell colSpan={weekDays.length + 1} className="h-24 text-center">
                    No roster data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

    