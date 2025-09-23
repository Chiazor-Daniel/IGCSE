// src/ai/flows/generate-igcse-questions.ts
'use server';

/**
 * @fileOverview A flow to generate IGCSE-style exam questions using AI.
 *
 * - generateIgcseQuestions - A function that generates IGCSE questions.
 * - GenerateIgcseQuestionsInput - The input type for the generateIgcseQuestions function.
 * - GenerateIgcseQuestionsOutput - The return type for the generateIgcseQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIgcseQuestionsInputSchema = z.object({
  subject: z.enum(['Mathematics', 'Biology', 'Physics', 'Chemistry']).describe('The subject for which to generate questions.'),
  questionType: z.enum(['MCQ', 'Theory']).describe('The type of questions to generate.'),
  numberOfQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
  forcesFocus: z.boolean().optional().describe('Whether to focus on forces for Physics questions.'),
  diagrams: z.boolean().optional().describe('Whether to include diagrams in questions.'),
  geminiApiKey: z.string().describe('The Gemini API key to use for question generation.'),
});
export type GenerateIgcseQuestionsInput = z.infer<typeof GenerateIgcseQuestionsInputSchema>;

const GenerateIgcseQuestionsOutputSchema = z.object({
  questions: z.string().describe('The generated IGCSE questions.'),
});
export type GenerateIgcseQuestionsOutput = z.infer<typeof GenerateIgcseQuestionsOutputSchema>;

export async function generateIgcseQuestions(input: GenerateIgcseQuestionsInput): Promise<GenerateIgcseQuestionsOutput> {
  return generateIgcseQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIgcseQuestionsPrompt',
  input: {schema: GenerateIgcseQuestionsInputSchema},
  output: {schema: GenerateIgcseQuestionsOutputSchema},
  prompt: `You are an expert IGCSE exam question generator.

You will generate {{numberOfQuestions}} {{questionType}} questions for {{subject}}.

{{#if forcesFocus}}
Since the subject is Physics, you will focus on questions about forces, including Newton's laws and resultant force.
{{/if}}

{{#if diagrams}}
You will include simple diagrams in the questions where appropriate. Use text descriptions for complex diagrams.
{{/if}}

Ensure the questions are in the style of past IGCSE papers, reflecting patterns from 2003-2024.

Output the questions in a clear, formatted way that is suitable for use in a Streamlit application.`, 
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateIgcseQuestionsFlow = ai.defineFlow(
  {
    name: 'generateIgcseQuestionsFlow',
    inputSchema: GenerateIgcseQuestionsInputSchema,
    outputSchema: GenerateIgcseQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
