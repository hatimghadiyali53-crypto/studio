
"use client";

import { useState, useMemo } from "react";
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function RosterPage() {
  const [isEditing, setIsEditing] = useState(false);
  const firestore = useFirestore();

  const employeesQuery = useMemoFirebase(() => collection(firestore, 'employees'), [firestore]);
  const rosterQuery = useMemoFirebase(() => collection(firestore, 'roster'), [firestore]);

  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);
  const { data: roster, isLoading: rosterLoading } = useCollection<RosterShift>(rosterQuery);

  // Local state to manage edits before saving to Firestore
  const [localRoster, setLocalRoster] = useState<RosterShift[] | null>(null);

  useState(() => {
    if (roster) {
      setLocalRoster(roster);
    }
  });

  const employeeMap = useMemo(() => {
    if (!employees) return {};
    return employees.reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {} as Record<string, Employee>);
  }, [employees]);
  
  const handleEditToggle = async () => {
    if (isEditing && localRoster) {
        // Save changes to Firestore
        const promises = localRoster.map(schedule => {
            const docRef = doc(firestore, 'roster', schedule.id);
            return updateDoc(docRef, { shifts: schedule.shifts });
        });
        await Promise.all(promises);
    } else if (!isEditing && roster) {
        // Enter edit mode, copy firestore data to local state
        setLocalRoster(JSON.parse(JSON.stringify(roster)));
    }
    setIsEditing(!isEditing);
  };

  const handleShiftChange = (employeeId: string, day: string, value: string) => {
    if (!localRoster) return;
    setLocalRoster(currentRoster =>
      currentRoster!.map(schedule => {
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
      })
    );
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
        <Button variant="outline" onClick={handleEditToggle}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
          {isEditing ? "Save Roster" : "Edit Roster"}
        </Button>
        <Button onClick={handleExport}>
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
                            onChange={(e) => handleShiftChange(schedule.employeeId, day, e.target.value)}
                            className="h-8"
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
