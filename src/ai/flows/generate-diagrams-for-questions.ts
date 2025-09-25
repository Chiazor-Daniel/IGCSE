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
  diagramPrompt: z.string().nullable(),
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

const generateDiagramForQuestionFlow = ai.defineFlow(
  {
    name: 'generateDiagramForQuestionFlow',
    inputSchema: GenerateDiagramForQuestionInputSchema,
    outputSchema: GenerateDiagramForQuestionOutputSchema,
  },
  async input => {
    if (!input.diagramPrompt) {
      return {diagramUrl: null};
    }

    try {
      const {media} = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt:
          input.diagramPrompt +
          ' - simple, clean, black and white, exam-standard, for a test paper',
      });
      return {diagramUrl: media.url};
    } catch (error) {
      console.error('Error generating diagram:', error);
      // If diagram generation fails, return null so question generation isn't blocked.
      return {diagramUrl: null};
    }
  }
);
