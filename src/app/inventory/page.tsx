
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
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import type { InventoryItem } from "@/lib/types";
import { Plus, Minus, Wand2, PlusCircle, Construction } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters."),
  category: z.enum(["Ice Cream", "Toppings", "Cones", "Supplies"]),
  inStock: z.coerce.number().min(0, "Stock can't be negative."),
  unit: z.enum(["Tubs", "Bags", "Boxes", "Units"]),
  lowThreshold: z.coerce.number().min(0, "Threshold can't be negative."),
});

const ITEMS_PER_PAGE = 5;

export default function InventoryPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAction, setStockAction] = useState<"add" | "subtract" | null>(null);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useUser();
  const firestore = useFirestore();

  const inventoryCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'inventoryItems');
  }, [firestore, user]);

  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryCollection);

  const totalPages = Math.ceil((inventory?.length ?? 0) / ITEMS_PER_PAGE);
  const paginatedInventory = useMemo(() => {
    if (!inventory) return [];
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!inventoryCollection) return;
    addDocumentNonBlocking(inventoryCollection, values);
    form.reset();
    setAddDialogOpen(false);
  }

  const handleStockActionClick = (item: InventoryItem, action: "add" | "subtract") => {
    setSelectedItem(item);
    setStockAction(action);
    setStockQuantity(1);
    setStockDialogOpen(true);
  };
  
  const handleConfirmStockChange = async () => {
    if (!selectedItem || !stockAction || !firestore) return;

    const changeAmount = stockAction === 'add' ? stockQuantity : -stockQuantity;
    const newStock = selectedItem.inStock + changeAmount;
    
    const itemRef = doc(firestore, 'inventoryItems', selectedItem.id);
    updateDocumentNonBlocking(itemRef, { inStock: newStock });

    setStockDialogOpen(false);
    setSelectedItem(null);
    setStockAction(null);
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
                <DialogFooter>
                  <Button type="submit">Save Item</Button>
                </DialogFooter>
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
                  {inventoryLoading && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-8 inline-block" />
                        <Skeleton className="h-8 w-8 inline-block" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!inventoryLoading && paginatedInventory.map((item) => (
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
                          onClick={() => handleStockActionClick(item, 'subtract')}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Record Usage</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStockActionClick(item, 'add')}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add Stock</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   {!inventoryLoading && inventory?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No inventory items found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
             {inventory && inventory.length > 0 && totalPages > 1 && (
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
        </TabsContent>
        <TabsContent value="predict">
            <Card>
                <CardHeader>
                <CardTitle>Stock Requirement Prediction</CardTitle>
                <CardDescription>
                    Analyze past data to predict future needs and minimize waste.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                    <Construction className="w-16 h-16 text-muted-foreground" />
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">Feature Coming Soon!</h3>
                        <p className="text-muted-foreground">
                            Our AI-powered inventory prediction is under development.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
                {stockAction === 'add' ? 'Add Stock' : 'Subtract Stock'} for {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              Enter the quantity to {stockAction}. Current stock: {selectedItem?.inStock} {selectedItem?.unit}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmStockChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

    