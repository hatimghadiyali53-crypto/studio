
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

  const employeesQuery = useMemoFirebase(() => user ? collection(firestore, 'employees') : null, [user, firestore]);
  const rosterQuery = useMemoFirebase(() => user ? collection(firestore, 'roster') : null, [user, firestore]);

  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);
  const { data: originalRoster, isLoading: rosterLoading } = useCollection<RosterShift>(rosterQuery);
  
  const [localRoster, setLocalRoster] = useState<RosterShift[] | null>(null);

  const employeeMap = useMemo(() => {
    if (!employees) return new Map();
    return new Map(employees.map(emp => [emp.id, emp]));
  }, [employees]);

  useEffect(() => {
    if (originalRoster) {
      setLocalRoster(JSON.parse(JSON.stringify(originalRoster)));
    } else {
      setLocalRoster(null);
    }
  }, [originalRoster]);
  
  const handleEditToggle = async () => {
    if (isEditing) {
        if (localRoster && firestore) {
            const promises = localRoster.map((schedule) => {
                const rosterDocRef = doc(firestore, 'roster', schedule.id);
                return updateDocumentNonBlocking(rosterDocRef, { shifts: schedule.shifts });
            });
            await Promise.all(promises);
        }
    }
    setIsEditing(!isEditing);
  };

  const handleShiftChange = (rosterId: string, day: string, value: string) => {
    setLocalRoster(currentRoster => {
      if (!currentRoster) return null;
      return currentRoster.map(item => {
        if (item.id === rosterId) {
          return {
            ...item,
            shifts: {
                ...item.shifts,
                [day]: value,
            }
          };
        }
        return item;
      });
    });
  };
  
  const handleExport = () => {
    console.log("Export function needs to be implemented.");
  };

  const displayRoster = isEditing ? localRoster : originalRoster;
  const isLoading = rosterLoading || employeesLoading;

  const sortedRoster = useMemo(() => {
    if (!displayRoster || employeeMap.size === 0) return [];
    
    return displayRoster
        .map(schedule => ({
            ...schedule,
            employee: employeeMap.get(schedule.employeeId)
        }))
        .filter(item => item.employee) // Filter out roster entries without a matching employee
        .sort((a, b) => a.employee!.name.localeCompare(b.employee!.name));
  }, [displayRoster, employeeMap]);


  return (
    <>
      <PageHeader title="Weekly Roster" description="View and manage the employee schedule for the current week.">
        <Button variant="outline" onClick={handleEditToggle} disabled={isLoading || !sortedRoster}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
          {isEditing ? "Save Roster" : "Edit Roster"}
        </Button>
        <Button onClick={handleExport} disabled={isLoading || !sortedRoster || sortedRoster.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PageHeader>
      
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {isLoading && Array.from({length: 3}).map((_, i) => (
             <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
        ))}
        {!isLoading && sortedRoster?.map((item) => (
            <Card key={item.id}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                            <AvatarFallback>{item.employee?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{item.employee?.name}</div>
                            <div className="text-sm text-muted-foreground">{item.employee?.role}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                    {weekDays.map(day => (
                            <div key={day} className="flex justify-between items-center">
                                <span className="font-medium text-sm">{day}</span>
                                {isEditing ? (
                                    <Input
                                        value={item.shifts[day] || ''}
                                        onChange={(e) => handleShiftChange(item.id, day, e.target.value)}
                                        className="h-8 w-32"
                                        placeholder="e.g., 9AM-5PM"
                                    />
                                ) : item.shifts[day] === 'OFF' || !item.shifts[day] ? (
                                    <span className="text-muted-foreground text-sm">OFF</span>
                                ) : (
                                    <div className="rounded-md bg-secondary px-2 py-1 text-center text-sm text-secondary-foreground">
                                        {item.shifts[day]}
                                    </div>
                                )}
                            </div>
                    ))}
                    </div>
                </CardContent>
            </Card>
        ))}
         {!isLoading && (!sortedRoster || sortedRoster.length === 0) && (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No employees found on the roster. Add one from the Employees page.</CardContent></Card>
        )}
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
              {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    {weekDays.map(day => <TableCell key={day}><Skeleton className="h-8 w-full" /></TableCell>)}
                </TableRow>
              ))}
              {!isLoading && sortedRoster?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{item.employee?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{item.employee?.name}</div>
                            <div className="text-sm text-muted-foreground">{item.employee?.role}</div>
                        </div>
                        </div>
                    </TableCell>
                    {weekDays.map((day) => (
                        <TableCell key={day}>
                        {isEditing ? (
                            <Input
                            value={item.shifts[day] || ''}
                            onChange={(e) => handleShiftChange(item.id, day, e.target.value)}
                            className="h-8"
                            placeholder="e.g., 9AM-5PM"
                            />
                        ) : item.shifts[day] === 'OFF' || !item.shifts[day] ? (
                            <span className="text-muted-foreground">OFF</span>
                        ) : (
                            <div className="rounded-md bg-secondary px-2 py-1 text-center text-sm text-secondary-foreground">
                            {item.shifts[day]}
                            </div>
                        )}
                        </TableCell>
                    ))}
                  </TableRow>
              ))}
               {!isLoading && (!sortedRoster || sortedRoster.length === 0) && (
                <TableRow>
                  <TableCell colSpan={weekDays.length + 1} className="h-24 text-center">
                    No employees found on the roster. Add one from the Employees page.
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
