export type Employee = {
  id: string;
  name: string;
  email: string;
  role: 'Scooper' | 'Shift Lead' | 'Manager';
  onboardingStatus: 'Pending' | 'Completed';
  store?: 'Coomera' | 'Ipswich' | 'Northlakes';
};

export type Task = {
  id: string;
  name: string;
  assignedTo: string; // Employee ID
  dueDate: string;
  status: 'Pending' | 'Completed';
  category: 'Daily' | 'Weekly' | 'Monthly' | 'One-Time';
};

export type InventoryItem = {
  id: string;
  name: string;
  category: 'Ice Cream' | 'Toppings' | 'Cones' | 'Supplies';
  inStock: number;
  unit: 'Tubs' | 'Bags' | 'Boxes' | 'Units';
  lowThreshold: number;
};

export type RosterShift = {
  employeeId: string;
  shifts: {
    [day: string]: string;
  }
}

    