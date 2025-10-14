'use server';
/**
 * @fileOverview A flow to analyze a student's handwritten answer.
 *
 * - analyzeStudentAnswer - A function that analyzes an image of a student's answer.
 * - AnalyzeStudentAnswerInput - The input type for the analyzeStudentAnswer function.
 * - AnalyzeStudentAnswerOutput - The return type for the analyzeStudentAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeStudentAnswerInputSchema = z.object({
  question: z.string().describe('The exam question.'),
  studentAnswer: z.string().describe("The student's answer as a data URI (image)."),
  subject: z.string().describe('The subject of the question.'),
});
export type AnalyzeStudentAnswerInput = z.infer<typeof AnalyzeStudentAnswerInputSchema>;

const AnalyzeStudentAnswerOutputSchema = z.object({
  feedback: z.string().describe('Detailed feedback on the student\'s answer, formatted as HTML.'),
});
export type AnalyzeStudentAnswerOutput = z.infer<typeof AnalyzeStudentAnswerOutputSchema>;

export async function analyzeStudentAnswer(
  input: AnalyzeStudentAnswerInput
): Promise<AnalyzeStudentAnswerOutput> {
  return analyzeStudentAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentAnswerPrompt',
  input: { schema: AnalyzeStudentAnswerInputSchema },
  output: { schema: AnalyzeStudentAnswerOutputSchema },
  prompt: `You are an expert {{subject}} teacher who is marking a student's exam paper.
The student has provided an image of their handwritten answer.

Your task is to analyze the student's answer for the given question and provide constructive feedback.

- First, state whether the answer is correct, partially correct, or incorrect.
- Provide a step-by-step breakdown of the correct solution.
- Compare the student's work to the correct solution, highlighting any errors, omissions, or misconceptions.
- Offer suggestions for improvement.
- Keep the tone encouraging and helpful.

Format the entire feedback as simple HTML (e.g., using <p>, <strong>, <em>, <ul>, <li>).

Question:
"{{question}}"

Student's Answer (from image):
{{media url=studentAnswer}}
`,
});

const analyzeStudentAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeStudentAnswerFlow',
    inputSchema: AnalyzeStudentAnswerInputSchema,
    outputSchema: AnalyzeStudentAnswerOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
