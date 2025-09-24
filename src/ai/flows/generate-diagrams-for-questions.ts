// src/ai/flows/generate-diagrams-for-questions.ts
'use server';

/**
 * @fileOverview Generates diagrams for exam questions.
 *
 * - generateDiagramForQuestion - A function that generates a diagram for a given question.
 * - GenerateDiagramForQuestionInput - The input type for the generateDiagramForQuestion function.
 * - GenerateDiagramForQuestionOutput - The return type for the generateDiagramForQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramForQuestionInputSchema = z.object({
  question: z.string().describe('The question to generate a diagram for.'),
});
export type GenerateDiagramForQuestionInput = z.infer<
  typeof GenerateDiagramForQuestionInputSchema
>;

const GenerateDiagramForQuestionOutputSchema = z.object({
  diagramUrl: z
    .string()
    .nullable()
    .describe('A data URI of the generated diagram, or null if no diagram is needed.'),
});
export type GenerateDiagramForQuestionOutput = z.infer<
  typeof GenerateDiagramForQuestionOutputSchema
>;

export async function generateDiagramForQuestion(
  input: GenerateDiagramForQuestionInput
): Promise<GenerateDiagramForQuestionOutput> {
  return generateDiagramForQuestionFlow(input);
}

const diagramPrompt = ai.definePrompt({
  name: 'diagramPrompt',
  input: {schema: z.object({question: z.string()})},
  output: {schema: z.object({isDiagramNeeded: z.boolean(), diagramPrompt: z.string().nullable()})},
  prompt: `You are an expert at determining if a diagram is needed for an exam question and creating a prompt to generate it.
The diagram should be a simple, clean, exam-standard diagram.
Question: {{{question}}}

First, determine if a diagram is necessary or would be helpful for this question.
If so, provide a concise prompt for an image generation model to create a simple, clean, black and white, exam-standard diagram.
If not, set isDiagramNeeded to false.`,
});


const generateDiagramForQuestionFlow = ai.defineFlow(
  {
    name: 'generateDiagramForQuestionFlow',
    inputSchema: GenerateDiagramForQuestionInputSchema,
    outputSchema: GenerateDiagramForQuestionOutputSchema,
  },
  async input => {
    const {output} = await diagramPrompt({question: input.question});
    if (!output?.isDiagramNeeded || !output.diagramPrompt) {
      return {diagramUrl: null};
    }

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: output.diagramPrompt + ' - simple, clean, black and white, exam-standard, for a test paper',
    });

    return {diagramUrl: media.url};
  }
);
