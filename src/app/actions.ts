
"use server";

import {
  generateIgcseQuestions,
  type GenerateIgcseQuestionsInput,
} from "@/ai/flows/generate-igcse-questions";
import { solveQuestion } from "@/ai/flows/solve-question";
import { analyzeStudentAnswer } from "@/ai/flows/analyze-student-answer";
import type { FormSchema } from "./form-schema";


export async function generateQuestionsAction(values: FormSchema) {
  try {
    const result = await generateIgcseQuestions(
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

export async function solveQuestionAction(question: string, subject: string) {
  try {
    const result = await solveQuestion({ question, subject });
    return { success: true, data: result.solution };
  } catch (error) {
    console.error("Error in solveQuestionAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred while solving the question.",
    };
  }
}

export async function analyzeAnswerAction(
  question: string,
  studentAnswer: string,
  subject: string
) {
  try {
    const result = await analyzeStudentAnswer({
      question,
      studentAnswer,
      subject,
    });
    return { success: true, data: result.feedback };
  } catch (error) {
    console.error("Error in analyzeAnswerAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred while analyzing the answer.",
    };
  }
}
