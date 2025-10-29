'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting suitable employee shift swaps based on qualifications, availability, and inventory impact.
 *
 * - suggestShiftSwap - An exported function that initiates the shift swap suggestion process.
 * - ShiftSwapInput - The input type for the suggestShiftSwap function.
 * - ShiftSwapOutput - The return type for the suggestShiftSwap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShiftSwapInputSchema = z.object({
  requestingEmployeeId: z
    .string()
    .describe('The ID of the employee requesting the shift swap.'),
  shiftDateTime: z
    .string()
    .describe('The date and time of the shift to be swapped (ISO format).'),
  reason: z.string().describe('The reason for the shift swap request.'),
});
export type ShiftSwapInput = z.infer<typeof ShiftSwapInputSchema>;

const EmployeeProfileSchema = z.object({
  employeeId: z.string().describe('The unique ID of the employee.'),
  name: z.string().describe('The name of the employee.'),
  qualifications: z.array(z.string()).describe('List of employee qualifications.'),
  availability: z
    .array(z.string())
    .describe('List of employee availability time slots (ISO format).'),
  expectedInventoryImpact: z
    .string()
    .describe('The employees expected inventory impact based on their role'),
});

const ShiftSwapSuggestionSchema = z.object({
  suggestedEmployeeId: z.string().describe('The ID of the suggested employee.'),
  name: z.string().describe('The name of the suggested employee.'),
  suitabilityScore: z
    .number()
    .describe('A score indicating the suitability of the employee for the swap.'),
  reason: z.string().describe('Why the employee is suitable for the shift swap'),
});

const ShiftSwapOutputSchema = z.object({
  suggestions: z.array(ShiftSwapSuggestionSchema).describe(
    'A list of suggested employees for the shift swap, ordered by suitability.'
  ),
});
export type ShiftSwapOutput = z.infer<typeof ShiftSwapOutputSchema>;

// Define a tool to fetch employee profile
const getEmployeeProfile = ai.defineTool({
  name: 'getEmployeeProfile',
  description: 'Retrieves an employee profile by their employee ID.',
  inputSchema: z.object({
    employeeId: z.string().describe('The ID of the employee to retrieve.'),
  }),
  outputSchema: EmployeeProfileSchema,
}, async (input) => {
  // TODO: Replace with actual implementation to fetch employee profile.
  // This is a placeholder implementation.
  console.log(`Fetching employee profile for ${input.employeeId}`);
  return {
    employeeId: input.employeeId,
    name: 'John Doe',
    qualifications: ['Ice Cream Prep', 'Customer Service'],
    availability: [
      '2024-07-15T10:00:00Z',
      '2024-07-15T11:00:00Z',
      '2024-07-15T12:00:00Z',
    ],
    expectedInventoryImpact: 'Low',
  };
});

export async function suggestShiftSwap(
  input: ShiftSwapInput
): Promise<ShiftSwapOutput> {
  return shiftSwapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shiftSwapPrompt',
  input: {schema: ShiftSwapInputSchema},
  output: {schema: ShiftSwapOutputSchema},
  tools: [getEmployeeProfile],
  prompt: `You are a shift swap suggestion expert. Given an employee requesting a shift swap, you will suggest other employees who are suitable for the swap.

  The current shift is at {{shiftDateTime}}.
  The employee requesting the shift swap has ID {{requestingEmployeeId}} and reason: {{reason}}.

  Consider qualifications, availability, and impact on inventory.
  Use the getEmployeeProfile tool to gather information about employees.

  {% example: Provide at least 3 suggestions in the ShiftSwapOutput schema format%}
  `,
});

const shiftSwapFlow = ai.defineFlow(
  {
    name: 'shiftSwapFlow',
    inputSchema: ShiftSwapInputSchema,
    outputSchema: ShiftSwapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
