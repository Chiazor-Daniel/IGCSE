// src/ai/flows/generate-diagrams-for-questions.ts
'use server';

/**
 * @fileOverview Generates diagrams for exam questions.
 *
 * - generateDiagramsForQuestions - A function that generates diagrams for given questions.
 * - GenerateDiagramsForQuestionsInput - The input type for the generateDiagramsForQuestions function.
 * - GenerateDiagramsForQuestionsOutput - The return type for the generateDiagramsForQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramsForQuestionsInputSchema = z.object({
  subject: z.enum(['Mathematics', 'Biology', 'Physics', 'Chemistry']).describe('The subject for which to generate diagrams.'),
  questionType: z.enum(['MCQ', 'Theory']).describe('The type of question.'),
  question: z.string().describe('The question to generate a diagram for.'),
});
export type GenerateDiagramsForQuestionsInput = z.infer<typeof GenerateDiagramsForQuestionsInputSchema>;

const GenerateDiagramsForQuestionsOutputSchema = z.object({
  diagramDescription: z.string().describe('A description of the diagram to include with the question, or null if no diagram is needed.'),
});
export type GenerateDiagramsForQuestionsOutput = z.infer<typeof GenerateDiagramsForQuestionsOutputSchema>;

export async function generateDiagramsForQuestions(input: GenerateDiagramsForQuestionsInput): Promise<GenerateDiagramsForQuestionsOutput> {
  return generateDiagramsForQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagramsForQuestionsPrompt',
  input: {schema: GenerateDiagramsForQuestionsInputSchema},
  output: {schema: GenerateDiagramsForQuestionsOutputSchema},
  prompt: `You are an expert IGCSE exam question diagram generator.  You will generate a simple diagram to accompany the question if necessary.  If no diagram is necessary, respond with null.

Subject: {{{subject}}}
Question Type: {{{questionType}}}
Question: {{{question}}}

Respond with a text description of the diagram that can be rendered using Matplotlib or described in text.

If the question is not related to diagrams, respond with "null".`,
});

const generateDiagramsForQuestionsFlow = ai.defineFlow(
  {
    name: 'generateDiagramsForQuestionsFlow',
    inputSchema: GenerateDiagramsForQuestionsInputSchema,
    outputSchema: GenerateDiagramsForQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {diagramDescription: output!.diagramDescription!};
  }
);
