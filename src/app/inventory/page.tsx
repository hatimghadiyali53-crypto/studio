"use client";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { inventory } from "@/lib/data";
import { Plus, Minus, Wand2, Calculator } from "lucide-react";

export default function InventoryPage() {
  return (
    <>
      <PageHeader title="Inventory" description="Track stock levels and predict future needs." />
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
                  {inventory.map((item) => (
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
                          className={item.inStock > item.lowThreshold ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}
                        >
                          {item.inStock > item.lowThreshold ? "In Stock" : "Low"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Record Usage</span>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add Stock</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
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
                            <Wand2 className="mr-2 h-4 w-4"/>
                            Predict Requirements
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calculator className="h-5 w-5 text-muted-foreground"/>
                                    Ideal Order Amount
                                </CardTitle>
                                <CardDescription>
                                    Suggested quantities for your next supply order.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>Vanilla Bean:</span> <span className="font-medium">10 Tubs</span></li>
                                    <li className="flex justify-between"><span>Chocolate Fudge:</span> <span className="font-medium">12 Tubs</span></li>
                                    <li className="flex justify-between"><span>Strawberry Bliss:</span> <span className="font-medium">8 Tubs</span></li>
                                    <li className="flex justify-between"><span>Waffle Cones:</span> <span className="font-medium">15 Boxes</span></li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calculator className="h-5 w-5 text-muted-foreground"/>
                                    Tub Variance
                                </CardTitle>
                                <CardDescription>
                                    Calculated difference between expected and actual usage.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between"><span>Vanilla Bean:</span> <span className="font-medium text-green-600">+0.2 Tubs</span></li>
                                    <li className="flex justify-between"><span>Chocolate Fudge:</span> <span className="font-medium text-red-600">-0.5 Tubs</span></li>
                                    <li className="flex justify-between"><span>Mint Chip:</span> <span className="font-medium text-green-600">+0.1 Tubs</span></li>
                                </ul>
                                <p className="mt-4 text-xs text-muted-foreground">Positive values indicate less usage than expected (good), negative values indicate more usage (potential over-scooping).</p>
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
