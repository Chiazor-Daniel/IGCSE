import { z } from "zod";

export const formSchema = z.object({
  subject: z.enum(["Mathematics", "Biology", "Physics", "Chemistry"]),
  targetYear: z.number().optional(),
});

export type FormSchema = z.infer<typeof formSchema>;