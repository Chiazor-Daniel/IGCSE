
"use server";

import {
  generateIgcseQuestions,
  type GenerateIgcseQuestionsInput,
  type GenerateIgcseQuestionsOutput,
} from "@/ai/flows/generate-igcse-questions";
import type { FormSchema } from "./form-schema";


export async function generateQuestionsAction(values: FormSchema) {
  try {
    const result: GenerateIgcseQuestionsOutput = await generateIgcseQuestions(
      values as GenerateIgcseQuestionsInput
    );
    if (!result.questions || result.questions.length === 0) {
      return {
        success: false,
        error: "The AI returned an empty response. Please try again.",
      };
    }
    return { success: true, data: result.questions };
  } catch (error) {
    console.error("Error in generateQuestionsAction:", error);
    // This provides a more generic error to the client for security
    return {
      success: false,
      error:
        "An unexpected error occurred while generating questions. Please check your API key and try again.",
    };
  }
}

    