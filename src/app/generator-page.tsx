
"use client";

import { QuestionForm } from "@/components/question-form";
import { QuestionDisplay } from "@/components/question-display";
import { useState } from "react";
import type { FormSchema } from "./form-schema";
import { generateQuestionsAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import type { GenerateIgcseQuestionsOutput } from "@/ai/flows/generate-igcse-questions";
import { Card, CardContent } from "@/components/ui/card";

export default function GeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<GenerateIgcseQuestionsOutput['questions'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<FormSchema['subject']>('Physics');
  const { toast } = useToast();

  const handleGenerate = async (values: FormSchema) => {
    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setSubject(values.subject);

    const result = await generateQuestionsAction(values);

    if (result.success) {
      setQuestions(result.data);
    } else {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <Card className="mb-8">
        <CardContent className="p-6">
          <QuestionForm onGenerate={handleGenerate} isLoading={isLoading} />
        </CardContent>
      </Card>

      <QuestionDisplay
        questions={questions}
        isLoading={isLoading}
        error={error}
        subject={subject}
      />
    </div>
  );
}
