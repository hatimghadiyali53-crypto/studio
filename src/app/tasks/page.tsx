
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Employee, Task } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useUser, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";


const formSchema = z.object({
    name: z.string().min(3, "Task name is too short"),
    assignedTo: z.string({ required_error: "Please assign task to an employee."}),
    dueDate: z.date({ required_error: "A due date is required." }),
    category: z.enum(["Daily", "Weekly", "Monthly", "One-Time"]),
});

const ITEMS_PER_PAGE = 5;

export default function TasksPage() {
    const [open, setOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const { user } = useUser();
    const firestore = useFirestore();

    const employeesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'employees');
    }, [firestore, user]);

    const tasksQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'tasks');
    }, [firestore, user]);

    const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);
    const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

    const employeeMap = useMemo(() => {
        if (!employees) return {};
        return employees.reduce((acc, emp) => {
          acc[emp.id] = emp;
          return acc;
        }, {} as Record<string, Employee>);
    }, [employees]);


    const totalPages = Math.ceil((tasks?.length ?? 0) / ITEMS_PER_PAGE);
    const paginatedTasks = useMemo(() => {
        if (!tasks) return [];
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return [...tasks].sort((a,b) => new Date(b.dueDate as string).getTime() - new Date(a.dueDate as string).getTime()).slice(startIndex, endIndex);
    }, [tasks, currentPage]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: "One-Time",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!tasksQuery) return;
        const newTask = {
            name: values.name,
            assignedTo: values.assignedTo,
            dueDate: format(values.dueDate, "yyyy-MM-dd"),
            category: values.category,
            status: 'Pending'
        };
        addDocumentNonBlocking(tasksQuery, newTask);
        form.reset();
        setOpen(false);
    }
    
    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleToggleStatus = async (task: Task) => {
        if (!firestore) return;
        const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
        const taskRef = doc(firestore, 'tasks', task.id);
        updateDocumentNonBlocking(taskRef, { status: newStatus });
    }

  return (
    <>
      <PageHeader title="Task Management" description="Assign and track daily, weekly, and monthly tasks.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Deep clean ice cream machine" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an employee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees?.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Daily">Daily</SelectItem>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="One-Time">One-Time</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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
                              date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Task</Button>
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
                <TableHead>Task</TableHead>
                <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {(tasksLoading || employeesLoading) && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-32" /></TableCell>
                </TableRow>
            ))}
            {!tasksLoading && paginatedTasks.map((task) => {
                const employee = employeeMap[task.assignedTo];
                const dueDate = typeof task.dueDate === 'string' ? task.dueDate : format(task.dueDate as Date, "yyyy-MM-dd");
                return (
                <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.name}
                       {employee && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:hidden mt-1">
                          <Avatar className="h-5 w-5">
                              <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                    {employee ? (
                        <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                    )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{task.category}</Badge>
                    </TableCell>
                    <TableCell>{dueDate}</TableCell>
                    <TableCell>
                    <Badge
                        variant={
                            task.status === "Completed" ? "default" : "secondary"
                        }
                        className={task.status === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}
                    >
                        {task.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(task)}>
                            {task.status === 'Pending' ? 'Mark as Completed' : 'Mark as Pending'}
                        </Button>
                    </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
        </CardContent>
        {tasks && tasks.length > 0 && totalPages > 1 && (
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
        )}
      </Card>
    </>
  );
}
