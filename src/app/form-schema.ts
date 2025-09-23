import { z } from "zod";

export const formSchema = z.object({
  geminiApiKey: z
    .string({ required_error: "Gemini API key is required." })
    .min(10, "Please enter a valid Gemini API key."),
  subject: z.enum(["Mathematics", "Biology", "Physics", "Chemistry"]),
  questionType: z.enum(["MCQ", "Theory"]),
  numberOfQuestions: z.number().min(1).max(10),
  forcesFocus: z.boolean().default(false),
  diagrams: z.boolean().default(false),
});

export type FormSchema = z.infer<typeof formSchema>;
