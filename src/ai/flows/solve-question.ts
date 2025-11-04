
'use server';
/**
 * @fileOverview A flow to solve an IGCSE exam question.
 *
 * - solveQuestion - A function that provides a detailed solution to a given question.
 * - SolveQuestionInput - The input type for the solveQuestion function.
 * - SolveQuestionOutput - The return type for the solveQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveQuestionInputSchema = z.object({
  question: z.string().describe('The IGCSE question to be solved.'),
  subject: z.string().describe('The subject of the question (e.g., Physics, Mathematics).'),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

const SolveQuestionOutputSchema = z.object({
  solution: z.string().describe('A detailed, step-by-step solution to the question, formatted as HTML.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;

export async function solveQuestion(
  input: SolveQuestionInput
): Promise<SolveQuestionOutput> {
  return solveQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  input: {schema: SolveQuestionInputSchema},
  output: {schema: SolveQuestionOutputSchema},
  prompt: `You are an expert IGCSE {{subject}} teacher. Your task is to provide a comprehensive, step-by-step solution to the following exam question.

The solution should be clear, easy to understand, and formatted as simple HTML (e.g., using <p>, <strong>, <em>, <ul>, <li>).

If the question is a multiple-choice question, first identify the correct option and then explain in detail why that option is correct and why the other options are incorrect.

If the question is a theory or structured question, break down the answer into logical parts, showing all calculations, reasoning, or explanations required to earn full marks.

Question:
{{question}}`,
});

const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
