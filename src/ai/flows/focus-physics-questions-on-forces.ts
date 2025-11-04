'use server';
/**
 * @fileOverview A flow to generate physics questions focused on forces.
 *
 * - generateForcesQuestions - A function that generates physics questions focused on forces.
 * - GenerateForcesQuestionsInput - The input type for the generateForcesQuestions function.
 * - GenerateForcesQuestionsOutput - The return type for the generateForcesQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateForcesQuestionsInputSchema = z.object({
  questionType: z.enum(['MCQ', 'Theory']).describe('The type of question to generate.'),
  numberOfQuestions: z
    .number()
    .min(1)
    .max(10)
    .describe('The number of questions to generate.'),
});
export type GenerateForcesQuestionsInput = z.infer<
  typeof GenerateForcesQuestionsInputSchema
>;

const GenerateForcesQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('The generated questions.'),
});
export type GenerateForcesQuestionsOutput = z.infer<
  typeof GenerateForcesQuestionsOutputSchema
>;

export async function generateForcesQuestions(
  input: GenerateForcesQuestionsInput
): Promise<GenerateForcesQuestionsOutput> {
  return generateForcesQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateForcesQuestionsPrompt',
  input: {schema: GenerateForcesQuestionsInputSchema},
  output: {schema: GenerateForcesQuestionsOutputSchema},
  prompt: `You are an expert physics teacher specializing in IGCSE curriculum.
Generate {{numberOfQuestions}} {{questionType}} questions focused on forces (e.g., Newton’s laws, resultant force).  Make sure the questions are appropriate for the IGCSE physics syllabus.

Format the questions as a JSON array of strings. Do not include any extra text other than the JSON array.
For multiple choice questions, include 4 options (A, B, C, D) and indicate the correct answer with an asterisk.`,
});

const generateForcesQuestionsFlow = ai.defineFlow(
  {
    name: 'generateForcesQuestionsFlow',
    inputSchema: GenerateForcesQuestionsInputSchema,
    outputSchema: GenerateForcesQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    try {
      // Attempt to parse the output as JSON.  If it fails, return a default error message.
      const questions = JSON.parse(output!.questions as string);
      return {questions};
    } catch (e) {
      console.error('Failed to parse JSON from prompt output', e);
      return {questions: ['Failed to generate questions. Please try again.']};
    }
  }
);
