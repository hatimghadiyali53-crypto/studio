
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import type { Employee, OnboardingCategory, RosterShift } from "@/lib/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useUser } from "@/firebase";
import { collection } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  role: z.enum(["Scooper", "Shift Lead", "Manager"]),
  store: z.enum(["Coomera", "Ipswich", "Northlakes"]),
});

const trainingPlan: Omit<OnboardingCategory, 'items'>[] = [
    { id: 'shift-1', title: 'Shift 1: Core Skills' },
    { id: 'shift-2', title: 'Shift 2: Menu & Desserts' },
    { id: 'shift-3', title: 'Shift 3: Advanced Operations' },
];

const trainingItems: { [key: string]: { id: string, label: string }[] } = {
    'shift-1': [
        { id: 's1-quiz', label: 'Quiz on basic knowledge (dipping well, scoop sizes, etc.)' },
        { id: 's1-scooping', label: 'Practice 3 scooping methods and weigh scoops' },
        { id: 's1-take-home', label: 'Procedure for take-home packs (weighing, labeling)' },
        { id: 's1-tub-maintenance', label: 'Demonstrate proper tub maintenance' },
        { id: 's1-sink-setup', label: 'Sink setup and basic cleaning procedures' },
        { id: 's1-pos', label: 'POS system training (transactions, training number)' },
        { id: 's1-money', label: 'Money handling and making change' },
        { id: 's1-customer-service', label: 'Practice 2-part greeting and enthusiastic tone' },
        { id: 's1-allergens', label: 'Reading allergen tags and explaining sorbet vs. sherbet' },
    ],
    'shift-2': [
        { id: 's2-shakes', label: 'Shake Menu: Read chart and prepare different shakes' },
        { id: 's2-ultimate-shakes', label: 'Prepare an Ultimate Shake with toppings and cream' },
        { id: 's2-iced-coffee', label: 'Prepare an Iced Coffee' },
        { id: 's2-desserts', label: 'Dessert Menu: Use kids scoops and heat items correctly' },
        { id: 's2-vertical-sundaes', label: 'Prepare a Vertical Sundae (Brownie/Waffle)' },
        { id: 's2-whole-desserts', label: 'Prepare a Whole Dessert in a take-home pack' },
        { id: 's2-classic-sundaes', label: 'Prepare a Regular and Large Classic Sundae' },
    ],
    'shift-3': [
        { id: 's3-delivery-packaging', label: 'Explain packaging for delivery orders (lids, boxes)' },
        { id: 's3-delivery-fudge', label: 'Explain rules for hot fudge on delivery orders' },
        { id: 's3-delivery-cream', label: 'No whipped cream on delivery orders' },
        { id: 's3-delivery-bag-prep', label: 'Prepare a delivery bag (labeling, sealing, receipt)' },
    ],
};

const ITEMS_PER_PAGE = 5;

export default function EmployeesPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useUser();
  const firestore = useFirestore();
  const employeesCollection = useMemoFirebase(() => firestore && user ? collection(firestore, 'employees') : null, [firestore, user]);
  const rosterCollection = useMemoFirebase(() => firestore && user ? collection(firestore, 'roster') : null, [firestore, user]);
  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesCollection);
  
  const totalPages = Math.ceil((employees?.length ?? 0) / ITEMS_PER_PAGE);
  
  const paginatedEmployees = useMemo(() => {
    if (!employees) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return [...employees].sort((a, b) => a.name.localeCompare(b.name)).slice(startIndex, endIndex);
  }, [employees, currentPage]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Scooper",
      store: "Coomera",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!employeesCollection || !rosterCollection) return;

    const fullChecklist: OnboardingCategory[] = trainingPlan.map(category => ({
      ...category,
      items: (trainingItems[category.id] || []).map(item => ({ ...item, completed: false }))
    }));

    const newEmployeeData = {
      ...values,
      onboardingStatus: "Pending" as const,
      onboardingChecklist: fullChecklist,
    };
    
    // Add the new employee and get the new document reference
    const newEmployeeRef = await addDocumentNonBlocking(employeesCollection, newEmployeeData);

    if (newEmployeeRef) {
        // Create a corresponding roster entry for the new employee
        const newRosterEntry: Omit<RosterShift, 'id'> = {
            employeeId: newEmployeeRef.id,
            shifts: {
                Monday: "OFF",
                Tuesday: "OFF",
                Wednesday: "OFF",
                Thursday: "OFF",
                Friday: "OFF"
            }
        };
        addDocumentNonBlocking(rosterCollection, newRosterEntry);
    }
    
    form.reset();
    setAddDialogOpen(false);
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <PageHeader title="Employees" description="Manage your team members and their onboarding status.">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the details to onboard a new team member.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.d@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Scooper">Scooper</SelectItem>
                            <SelectItem value="Shift Lead">Shift Lead</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="store"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Coomera">Coomera</SelectItem>
                            <SelectItem value="Ipswich">Ipswich</SelectItem>
                            <SelectItem value="Northlakes">Northlakes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Employee</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Onboarding Status</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-1 h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))}
              {!employeesLoading && paginatedEmployees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.store}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.onboardingStatus === "Completed"
                          ? "default"
                          : "secondary"
                      }
                      className={employee.onboardingStatus === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}
                    >
                      {employee.onboardingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>
                        View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!employeesLoading && employees?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {employees && employees.length > 0 && totalPages > 1 && (
          <CardFooter className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedEmployees.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, employees.length)} of {employees.length} employees
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
        )}
      </Card>
    </>
  );
}
