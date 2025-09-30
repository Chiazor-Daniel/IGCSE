
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
  Sparkles,
} from "lucide-react";
import type { GenerateIgcseQuestionsOutput } from "@/ai/flows/generate-igcse-questions";
import Image from 'next/image';
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { solveQuestionAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { FormSchema } from "@/app/form-schema";

type QuestionDisplayProps = {
  questions: GenerateIgcseQuestionsOutput['questions'] | null;
  isLoading: boolean;
  error: string | null;
  subject: FormSchema['subject'];
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

const AiSolution = ({ solution }: { solution: string }) => (
  <div className="mt-4 rounded-md border border-primary/20 bg-primary/10 p-4">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="size-5 text-primary" />
      <h4 className="font-headline text-md font-semibold text-primary">AI Solution</h4>
    </div>
    <div
      className="prose prose-sm max-w-none text-primary/80"
      dangerouslySetInnerHTML={{ __html: solution }}
    />
  </div>
);


const MCQQuestion = ({ question, index, subject }: { question: GenerateIgcseQuestionsOutput['questions'][0], index: number, subject: FormSchema['subject'] }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleSolve = async () => {
    setIsSolving(true);
    setSolution(null);
    const result = await solveQuestionAction(question.questionText, subject);
    if (result.success) {
      setSolution(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Solving Failed",
        description: result.error,
      });
    }
    setIsSolving(false);
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
      <div className="flex items-center gap-2 mt-4">
        <Button onClick={handleCheckAnswer} size="sm" disabled={!selectedOption}>Check Answer</Button>
        <Button onClick={handleSolve} size="sm" variant="outline" disabled={isSolving}>
          {isSolving ? <Loader2 className="animate-spin" /> : <Sparkles />}
          AI Solve
        </Button>
      </div>
      {showAnswer && isCorrect !== null && (
        <div className={`mt-2 p-2 rounded-md text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${correctAnswerLetter}.`}
        </div>
      )}
      {isSolving && <Loader2 className="mt-4 animate-spin" />}
      {solution && <AiSolution solution={solution} />}
    </div>
  );
};


const TheoryQuestion = ({ question, index, subject }: { question: GenerateIgcseQuestionsOutput['questions'][0], index: number, subject: FormSchema['subject'] }) => {
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSolve = async () => {
    setIsSolving(true);
    setSolution(null);
    const result = await solveQuestionAction(question.questionText, subject);
    if (result.success) {
      setSolution(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Solving Failed",
        description: result.error,
      });
    }
    setIsSolving(false);
  };
  
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
      <Button onClick={handleSolve} size="sm" variant="outline" className="mt-4" disabled={isSolving}>
        {isSolving ? <Loader2 className="animate-spin" /> : <Sparkles />}
        AI Solve
      </Button>
      {isSolving && <Loader2 className="mt-4 animate-spin" />}
      {solution && <AiSolution solution={solution} />}
    </div>
  );
};


export function QuestionDisplay({
  questions,
  isLoading,
  error,
  subject
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
                Select an answer and check your result, or use AI to get the solution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mcqQuestions.map((q, index) => (
                <MCQQuestion key={`mcq-${index}`} question={q} index={index} subject={subject} />
              ))}
            </CardContent>
          </Card>
        )}
        {theoryQuestions && theoryQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Theory Questions</CardTitle>
            <CardDescription>
              Here are the theory questions. Use the AI Solve button to see a model answer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {theoryQuestions.map((q, index) => (
              <TheoryQuestion key={`theory-${index}`} question={q} index={index} subject={subject} />
            ))}
          </CardContent>
        </Card>
        )}
      </div>
    );
  }

  return null;
}
