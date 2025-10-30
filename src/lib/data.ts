
import type { Employee, Task, InventoryItem, RosterShift, AttendanceRecord } from './types';

// This file is kept for type reference but is no longer the source of data.
// All data is now sourced dynamically from Firestore.
export const employees: Employee[] = [];
export const tasks: Task[] = [];
export const inventory: InventoryItem[] = [];
export const roster: RosterShift[] = [];
export const attendance: AttendanceRecord[] = [];

    