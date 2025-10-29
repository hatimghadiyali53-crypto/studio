import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { employees, roster } from "@/lib/data";
import { Download, Pencil } from "lucide-react";
import type { Employee, RosterShift } from "@/lib/types";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const employeeMap = employees.reduce((acc, emp) => {
  acc[emp.id] = emp;
  return acc;
}, {} as Record<string, Employee>);


export default function RosterPage() {
  return (
    <>
      <PageHeader title="Weekly Roster" description="View and manage the employee schedule for the current week.">
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Roster
        </Button>
        <Button>
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
                        {schedule.shifts[day] === 'OFF' ? (
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
