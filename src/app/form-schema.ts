import { z } from "zod";

export const formSchema = z.object({
  subject: z.enum(["Mathematics", "Biology", "Physics", "Chemistry"]),
  questionType: z.enum(["MCQ", "Theory"]),
});

export type FormSchema = z.infer<typeof formSchema>;
