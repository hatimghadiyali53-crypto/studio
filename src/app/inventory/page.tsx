
"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter as DialogFormFooter,
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
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { inventory as initialInventory } from "@/lib/data";
import type { InventoryItem } from "@/lib/types";
import { Plus, Minus, Wand2, Calculator, PlusCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters."),
  category: z.enum(["Ice Cream", "Toppings", "Cones", "Supplies"]),
  inStock: z.coerce.number().min(0, "Stock can't be negative."),
  unit: z.enum(["Tubs", "Bags", "Boxes", "Units"]),
  lowThreshold: z.coerce.number().min(0, "Threshold can't be negative."),
});

const ITEMS_PER_PAGE = 5;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return inventory.slice(startIndex, endIndex);
  }, [inventory, currentPage]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "Ice Cream",
      inStock: 0,
      unit: "Tubs",
      lowThreshold: 10,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newItem: InventoryItem = {
      id: `inv-${inventory.length + 1}`,
      ...values,
    };
    setInventory((current) => [...current, newItem]);
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
      <PageHeader
        title="Inventory"
        description="Track stock levels and predict future needs."
      >
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Fill in the details for the new stock item.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Vanilla Bean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ice Cream">Ice Cream</SelectItem>
                            <SelectItem value="Toppings">Toppings</SelectItem>
                            <SelectItem value="Cones">Cones</SelectItem>
                            <SelectItem value="Supplies">Supplies</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                         <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tubs">Tubs</SelectItem>
                            <SelectItem value="Bags">Bags</SelectItem>
                            <SelectItem value="Boxes">Boxes</SelectItem>
                            <SelectItem value="Units">Units</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity in Stock</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lowThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Stock Threshold</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <DialogFormFooter>
                  <Button type="submit">Save Item</Button>
                </DialogFormFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="predict">Predictions</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>
                Manual tracking of all items in stock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{`${item.inStock} ${item.unit}`}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.inStock > item.lowThreshold
                              ? "default"
                              : "destructive"
                          }
                          className={
                            item.inStock > item.lowThreshold
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                              : ""
                          }
                        >
                          {item.inStock > item.lowThreshold
                            ? "In Stock"
                            : "Low"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Record Usage</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add Stock</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
        </TabsContent>
        <TabsContent value="predict">
          <Card>
            <CardHeader>
              <CardTitle>Stock Requirement Prediction</CardTitle>
              <CardDescription>
                Analyze past data to predict future needs and minimize waste.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-start">
                <Button>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Predict Requirements
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calculator className="h-5 w-5 text-muted-foreground" />
                      Ideal Order Amount
                    </CardTitle>
                    <CardDescription>
                      Suggested quantities for your next supply order.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Vanilla Bean:</span>{" "}
                        <span className="font-medium">10 Tubs</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Chocolate Fudge:</span>{" "}
                        <span className="font-medium">12 Tubs</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Strawberry Bliss:</span>{" "}
                        <span className="font-medium">8 Tubs</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Waffle Cones:</span>{" "}
                        <span className="font-medium">15 Boxes</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calculator className="h-5 w-5 text-muted-foreground" />
                      Tub Variance
                    </CardTitle>
                    <CardDescription>
                      Calculated difference between expected and actual usage.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Vanilla Bean:</span>{" "}
                        <span className="font-medium text-green-600">
                          +0.2 Tubs
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Chocolate Fudge:</span>{" "}
                        <span className="font-medium text-red-600">
                          -0.5 Tubs
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Mint Chip:</span>{" "}
                        <span className="font-medium text-green-600">
                          +0.1 Tubs
                        </span>
                      </li>
                    </ul>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Positive values indicate less usage than expected (good),
                      negative values indicate more usage (potential
                      over-scooping).
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
