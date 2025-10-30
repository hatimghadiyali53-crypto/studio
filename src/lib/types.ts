
import { Timestamp } from 'firebase/firestore';

export type OnboardingChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: 'Scooper' | 'Shift Lead' | 'Manager';
  onboardingStatus: 'Pending' | 'Completed';
  store?: 'Coomera' | 'Ipswich' | 'Northlakes';
  onboardingChecklist: OnboardingChecklistItem[];
};

export type Task = {
  id: string;
  name: string;
  assignedTo: string; // Employee ID
  dueDate: string | Timestamp;
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
  id: string;
  employeeId: string;
  shifts: {
    [day: string]: string;
  }
}

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  clockInTime: string;
  clockOutTime: string | null;
  status: 'Clocked In' | 'Clocked Out' | 'Late';
};

    