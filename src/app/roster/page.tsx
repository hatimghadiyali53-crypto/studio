
"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { employees, roster as initialRoster } from "@/lib/data";
import { Download, Pencil, Save } from "lucide-react";
import type { Employee, RosterShift } from "@/lib/types";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const employeeMap = employees.reduce((acc, emp) => {
  acc[emp.id] = emp;
  return acc;
}, {} as Record<string, Employee>);

export default function RosterPage() {
  const [roster, setRoster] = useState<RosterShift[]>(initialRoster);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleShiftChange = (employeeId: string, day: string, value: string) => {
    setRoster(currentRoster =>
      currentRoster.map(schedule => {
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
      <Card>
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
              {roster.map((schedule: RosterShift) => {
                const employee = employeeMap[schedule.employeeId];
                if (!employee) return null;

                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person smiling" />
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
