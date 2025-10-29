import type { Employee, Task, InventoryItem, RosterShift } from './types';
import { PlaceHolderImages } from './placeholder-images';

const avatarMap = PlaceHolderImages.reduce((acc, img, index) => {
  acc[index + 1] = img.imageUrl;
  return acc;
}, {} as Record<number, string>);

export const employees: Employee[] = [
  { id: 'emp-1', name: 'Alice', email: 'alice@paradise.scoop', role: 'Shift Lead', onboardingStatus: 'Completed', avatarUrl: avatarMap[1] },
  { id: 'emp-2', name: 'Bob', email: 'bob@paradise.scoop', role: 'Scooper', onboardingStatus: 'Completed', avatarUrl: avatarMap[2] },
  { id: 'emp-3', name: 'Charlie', email: 'charlie@paradise.scoop', role: 'Scooper', onboardingStatus: 'Completed', avatarUrl: avatarMap[3] },
  { id: 'emp-4', name: 'Diana', email: 'diana@paradise.scoop', role: 'Manager', onboardingStatus: 'Completed', avatarUrl: avatarMap[4] },
  { id: 'emp-5', name: 'Eve', email: 'eve@paradise.scoop', role: 'Scooper', onboardingStatus: 'Pending', avatarUrl: avatarMap[5] },
  { id: 'emp-6', name: 'Frank', email: 'frank@paradise.scoop', role: 'Scooper', onboardingStatus: 'Completed', avatarUrl: avatarMap[6] },
];

export const tasks: Task[] = [
  { id: 'task-1', name: 'Clean counters & tables', assignedTo: 'emp-2', dueDate: '2024-08-01', status: 'Completed', category: 'Daily' },
  { id: 'task-2', name: 'Wipe down freezer glass', assignedTo: 'emp-3', dueDate: '2024-08-01', status: 'Pending', category: 'Daily' },
  { id: 'task-3', name: 'Restock napkin dispensers', assignedTo: 'emp-1', dueDate: '2024-08-01', status: 'Completed', category: 'Weekly' },
  { id: 'task-4', name: 'Mop floor', assignedTo: 'emp-6', dueDate: '2024-08-02', status: 'Pending', category: 'Daily' },
  { id: 'task-5', name: 'Check cone inventory', assignedTo: 'emp-1', dueDate: '2024-08-02', status: 'Pending', category: 'Weekly' },
  { id: 'task-6', name: 'Organize take-home tubs', assignedTo: 'emp-2', dueDate: '2024-08-03', status: 'Completed', category: 'Monthly' },
];

export const inventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Vanilla Bean', category: 'Ice Cream', inStock: 8, unit: 'Tubs', lowThreshold: 10 },
  { id: 'inv-2', name: 'Chocolate Fudge', category: 'Ice Cream', inStock: 5, unit: 'Tubs', lowThreshold: 10 },
  { id: 'inv-3', name: 'Strawberry Bliss', category: 'Ice Cream', inStock: 9, unit: 'Tubs', lowThreshold: 10 },
  { id: 'inv-4', name: 'Mint Chip', category: 'Ice Cream', inStock: 15, unit: 'Tubs', lowThreshold: 10 },
  { id: 'inv-5', name: 'Cookie Dough', category: 'Ice Cream', inStock: 12, unit: 'Tubs', lowThreshold: 10 },
  { id: 'inv-6', name: 'Rainbow Sprinkles', category: 'Toppings', inStock: 20, unit: 'Bags', lowThreshold: 5 },
  { id: 'inv-7', name: 'Waffle Cones', category: 'Cones', inStock: 50, unit: 'Boxes', lowThreshold: 20 },
  { id: 'inv-8', name: 'Napkins', category: 'Supplies', inStock: 100, unit: 'Units', lowThreshold: 50 },
];

export const roster: RosterShift[] = [
    { employeeId: 'emp-1', shifts: { Monday: '9AM-5PM', Tuesday: '9AM-5PM', Wednesday: 'OFF', Thursday: '9AM-5PM', Friday: '9AM-5PM' } },
    { employeeId: 'emp-2', shifts: { Monday: '12PM-8PM', Tuesday: 'OFF', Wednesday: '12PM-8PM', Thursday: '12PM-8PM', Friday: 'OFF' } },
    { employeeId: 'emp-3', shifts: { Monday: 'OFF', Tuesday: '12PM-8PM', Wednesday: 'OFF', Thursday: 'OFF', Friday: '12PM-8PM' } },
    { employeeId: 'emp-4', shifts: { Monday: '9AM-5PM', Tuesday: '9AM-5PM', Wednesday: '9AM-5PM', Thursday: '9AM-5PM', Friday: '9AM-5PM' } },
    { employeeId: 'emp-5', shifts: { Monday: '9AM-1PM', Tuesday: '9AM-1PM', Wednesday: '9AM-1PM', Thursday: 'OFF', Friday: 'OFF' } },
    { employeeId: 'emp-6', shifts: { Monday: 'OFF', Tuesday: '2PM-8PM', Wednesday: '2PM-8PM', Thursday: '2PM-8PM', Friday: '2PM-8PM' } },
]
