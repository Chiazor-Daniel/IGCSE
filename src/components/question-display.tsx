
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { GenerateIgcseQuestionsOutput } from "@/ai/flows/generate-igcse-questions";
import Image from 'next/image';
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

type QuestionDisplayProps = {
  questions: GenerateIgcseQuestionsOutput['questions'] | null;
  isLoading: boolean;
  error: string | null;
};

const LoadingSpinner = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4">
    <Loader2 className="size-12 animate-spin text-primary" />
    <p className="text-lg text-muted-foreground">Generating questions...</p>
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="flex flex-1 items-center justify-center">
    <Alert variant="destructive" className="max-w-md">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </div>
);

const MCQQuestion = ({ question, index }: { question: GenerateIgcseQuestionsOutput['questions'][0], index: number }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const parts = question.questionText.split('\n');
  const questionText = parts[0];
  const options = parts.slice(1).filter(o => o.trim() !== '');
  const correctAnswerLetter = options.find(o => o.includes('*'))?.[0] ?? '';
  
  const handleCheckAnswer = () => {
    if (selectedOption) {
      setIsCorrect(selectedOption === correctAnswerLetter);
      setShowAnswer(true);
    }
  };

  return (
    <div className="rounded-md border bg-secondary/50 p-4">
      <p className="font-code whitespace-pre-wrap text-sm text-secondary-foreground mb-4">
        <strong>{`Q${index + 1}: `}</strong>{questionText}
      </p>
      {question.diagramUrl && (
         <div className="mt-4 overflow-hidden rounded-md mb-4">
            <Image
              src={question.diagramUrl}
              alt={`Diagram for question ${index + 1}`}
              width={500}
              height={300}
              className="object-contain"
            />
         </div>
      )}
      <RadioGroup onValueChange={setSelectedOption} className="space-y-2">
        {options.map((option, i) => (
          <div key={i} className="flex items-center space-x-2">
            <RadioGroupItem value={option[0]} id={`q${index}-option-${i}`} />
            <Label htmlFor={`q${index}-option-${i}`} className="font-code text-sm">{option.replace('*', '')}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={handleCheckAnswer} className="mt-4" size="sm" disabled={!selectedOption}>Check Answer</Button>
      {showAnswer && isCorrect !== null && (
        <div className={`mt-2 p-2 rounded-md text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${correctAnswerLetter}.`}
        </div>
      )}
    </div>
  );
};


const TheoryQuestion = ({ question, index }: { question: GenerateIgcseQuestionsOutput['questions'][0], index: number }) => {
  return (
    <div className="rounded-md border bg-secondary/50 p-4">
      <p className="font-code whitespace-pre-wrap text-sm text-secondary-foreground">
        <strong>{`Q${index + 1}: `}</strong>{question.questionText}
      </p>
      {question.diagramUrl && (
         <div className="mt-4 overflow-hidden rounded-md">
            <Image
              src={question.diagramUrl}
              alt={`Diagram for question ${index + 1}`}
              width={500}
              height={300}
              className="object-contain"
            />
         </div>
      )}
    </div>
  );
};


export function QuestionDisplay({
  questions,
  isLoading,
  error,
}: QuestionDisplayProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const mcqQuestions = questions?.filter(q => q.questionType === 'MCQ');
  const theoryQuestions = questions?.filter(q => q.questionType === 'Theory');

  if (questions) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        {mcqQuestions && mcqQuestions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-headline">Multiple Choice Questions</CardTitle>
              <CardDescription>
                Select an answer and check your result.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mcqQuestions.map((q, index) => (
                <MCQQuestion key={`mcq-${index}`} question={q} index={index} />
              ))}
            </CardContent>
          </Card>
        )}
        {theoryQuestions && theoryQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Theory Questions</CardTitle>
            <CardDescription>
              Here are the theory questions generated by the AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {theoryQuestions.map((q, index) => (
              <TheoryQuestion key={`theory-${index}`} question={q} index={index} />
            ))}
          </CardContent>
        </Card>
        )}
      </div>
    );
  }

  return null;
}
