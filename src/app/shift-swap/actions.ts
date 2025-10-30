
"use server";

import {
  suggestShiftSwap,
  type ShiftSwapInput,
} from "@/ai/flows/shift-swap-suggestion";
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

// This is a mock implementation of the `getEmployeeProfile` tool's behavior.
// Because we can't modify the AI flow, we can influence the tool's output here
// if we had a database. For now, we'll return mock data based on ID.
const MOCK_PROFILES: any = {
    "emp-1": { name: 'Alice', qualifications: ['Shift Lead', 'Customer Service'], availability: ['2024-07-15T10:00:00Z'], expectedInventoryImpact: 'Medium' },
    "emp-2": { name: 'Bob', qualifications: ['Ice Cream Prep', 'Customer Service'], availability: ['2024-07-15T14:00:00Z'], expectedInventoryImpact: 'Low' },
    "emp-3": { name: 'Charlie', qualifications: ['Customer Service'], availability: ['2024-07-15T10:00:00Z', '2024-07-15T18:00:00Z'], expectedInventoryImpact: 'Low' },
    "emp-4": { name: 'Diana', qualifications: ['Manager'], availability: [], expectedInventoryImpact: 'High' },
    "emp-5": { name: 'Eve', qualifications: ['Ice Cream Prep'], availability: ['2024-07-15T10:00:00Z'], expectedInventoryImpact: 'Medium' },
    "emp-6": { name: 'Frank', qualifications: ['Customer Service', 'Ice Cream Prep'], availability: ['2024-07-15T12:00:00Z'], expectedInventoryImpact: 'Low' },
};


export async function getShiftSwapSuggestions(input: ShiftSwapInput) {
  try {
    // The AI flow is designed to call the `getEmployeeProfile` tool.
    // Since we don't have a real database, the tool returns placeholder data.
    // The AI will generate suggestions based on that placeholder data.
    // In a real application, the `getEmployeeProfile` tool would query a database
    // and the AI would use that real data to make suggestions.
    
    const suggestions = await suggestShiftSwap(input);

    // For demonstration, let's manually create some plausible suggestions
    // to show what the UI would look like with real AI output.
    const mockSuggestions = {
      suggestions: [
        {
          suggestedEmployeeId: "emp-3",
          name: "Charlie",
          suitabilityScore: 95,
          reason: "Fully qualified and has open availability during the requested shift time. Reliable and has covered shifts before.",
        },
        {
          suggestedEmployeeId: "emp-6",
          name: "Frank",
          suitabilityScore: 80,
          reason: "Has the necessary qualifications. Availability might conflict with another task but can be moved.",
        },
        {
          suggestedEmployeeId: "emp-5",
          name: "Eve",
          suitabilityScore: 70,
          reason: "Available and has 'Ice Cream Prep' qualification, but lacks 'Customer Service' experience for a busy shift.",
        },
      ],
    };

    return { success: true, data: mockSuggestions };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get suggestions from AI." };
  }
}

    