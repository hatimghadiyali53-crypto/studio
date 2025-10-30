
// This file is no longer used for providing data to the application.
// All data is now fetched from Firestore.
// It is kept for reference or future seeding scripts.

import type { Employee, Task, InventoryItem, RosterShift, AttendanceRecord } from './types';

export const employees: Employee[] = [
  { id: 'emp-1', name: 'Alice', email: 'alice@paradise.scoop', role: 'Shift Lead', onboardingStatus: 'Completed', store: 'Coomera' },
  { id: 'emp-2', name: 'Bob', email: 'bob@paradise.scoop', role: 'Scooper', onboardingStatus: 'Completed', store: 'Ipswich' },
  { id: 'emp-3', name: 'Charlie', email: 'charlie@paradise.scoop', role: 'Scooper', onboardingStatus: 'Completed', store: 'Northlakes' },
];

export const tasks: Task[] = [];
export const inventory: InventoryItem[] = [];
export const roster: RosterShift[] = [];
export const attendance: AttendanceRecord[] = [];
