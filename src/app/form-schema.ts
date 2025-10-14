import { z } from "zod";

export const formSchema = z.object({
  examBoard: z.enum(["IGCSE", "WAEC"]),
  subject: z.enum(["Mathematics", "Biology", "Physics", "Chemistry"]),
  targetYear: z.number().optional(),
});

export type FormSchema = z.infer<typeof formSchema>;
