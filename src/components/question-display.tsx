
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  Upload,
  Volume2,
} from "lucide-react";
import type { GenerateIgcseQuestionsOutput } from "@/ai/flows/generate-igcse-questions";
import Image from 'next/image';
import { useState, useRef, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { solveQuestionAction, analyzeAnswerAction } from "@/app/actions";
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

const AiSolutionModal = ({
  question,
  subject,
  children,
}: {
  question: string;
  subject: FormSchema["subject"];
  children: React.ReactNode;
}) => {
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleSolve = async () => {
    setIsSolving(true);
    setSolution(null);
    const result = await solveQuestionAction(question, subject);
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

  const handleSpeak = async () => {
    // This is a placeholder for the text-to-speech functionality
    setIsSpeaking(true);
    toast({ title: "Speaking solution..." });
    // In a real implementation, you would call a text-to-speech API here
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Generated Solution
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!solution && !isSolving && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p>Click below to generate a detailed, step-by-step solution.</p>
              <Button onClick={handleSolve}>Generate Solution</Button>
            </div>
          )}
          {isSolving && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />}
          {solution && (
            <div>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: solution }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleSpeak} disabled={isSpeaking}>
                  {isSpeaking ? <Loader2 className="animate-spin" /> : <Volume2 />}
                  Speak
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

type SelectedAnswers = { [key: number]: string };

const MCQQuestion = ({ 
  question, 
  index, 
  onAnswerSelect,
  selectedAnswer,
}: { 
  question: GenerateIgcseQuestionsOutput['questions'][0], 
  index: number, 
  onAnswerSelect: (questionIndex: number, answer: string) => void;
  selectedAnswer?: string;
}) => {
  const [questionText, ...options] = question.questionText.split(/\n(?=[A-D]\.)/);

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
      <RadioGroup 
        onValueChange={(value) => onAnswerSelect(index, value)}
        value={selectedAnswer}
        className="space-y-2"
      >
        {options.map((option, i) => (
          <div key={i} className="flex items-center space-x-2">
            <RadioGroupItem value={option[0]} id={`q${index}-option-${i}`} />
            <Label htmlFor={`q${index}-option-${i}`} className="font-code text-sm">{option.replace('*', '')}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};


const TheoryQuestion = ({ question, index, subject }: { question: GenerateIgcseQuestionsOutput['questions'][0], index: number, subject: FormSchema['subject'] }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const studentAnswer = reader.result as string;
      const result = await analyzeAnswerAction(question.questionText, studentAnswer, subject);
      
      if (result.success) {
        setAnalysis(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: result.error,
        });
      }
      setIsAnalyzing(false);
    };
    reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({
          variant: "destructive",
          title: "File Error",
          description: "Could not read the uploaded file.",
        });
        setIsAnalyzing(false);
    };
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
      <div className="mt-4 flex gap-2">
        <AiSolutionModal question={question.questionText} subject={subject}>
          <Button size="sm" variant="outline">
            <Sparkles /> AI Solve
          </Button>
        </AiSolutionModal>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*"
        />
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="animate-spin" /> : <Upload />}
           Upload Solution
        </Button>
      </div>

      {isAnalyzing && <Loader2 className="mt-4 animate-spin" />}
      {analysis && (
         <div className="mt-4 rounded-md border border-primary/20 bg-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-primary" />
            <h4 className="font-headline text-md font-semibold text-primary">AI Feedback</h4>
            </div>
            <div
                className="prose prose-sm max-w-none text-primary/80"
                dangerouslySetInnerHTML={{ __html: analysis }}
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
  subject
}: QuestionDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [score, setScore] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitMcq = useCallback(() => {
    if (!questions) return;
    const mcqQuestions = questions.filter(q => q.questionType === 'MCQ');
    if (mcqQuestions.length === 0) return;

    let correctAnswers = 0;
    mcqQuestions.forEach((q, index) => {
      const correctAnswerLine = q.questionText.split('\n').find(o => o.includes('*'));
      const correctAnswerLetter = correctAnswerLine ? correctAnswerLine[0] : null;
      if (selectedAnswers[index] === correctAnswerLetter) {
        correctAnswers++;
      }
    });
    const finalScore = (correctAnswers / mcqQuestions.length) * 100;
    setScore(finalScore);
    toast({
      title: "Answers Submitted!",
      description: `You scored ${finalScore.toFixed(0)}%.`,
    });
  }, [questions, selectedAnswers, toast]);


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
                Select your answer for each question below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mcqQuestions.map((q, index) => (
                <MCQQuestion 
                  key={`mcq-${index}`} 
                  question={q} 
                  index={index} 
                  onAnswerSelect={handleAnswerSelect}
                  selectedAnswer={selectedAnswers[index]}
                />
              ))}
            </CardContent>
          </Card>
        )}
        {theoryQuestions && theoryQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Theory Questions</CardTitle>
            <CardDescription>
              Use the AI Solve button to see a model answer or upload your own handwritten solution for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {theoryQuestions.map((q, index) => (
              <TheoryQuestion key={`theory-${index}`} question={q} index={index + (mcqQuestions?.length || 0)} subject={subject} />
            ))}
          </CardContent>
        </Card>
        )}

        {mcqQuestions && mcqQuestions.length > 0 && (
          <div className="mt-8 flex flex-col items-center">
            <Button onClick={handleSubmitMcq} size="lg">Submit All Answers</Button>
            {score !== null && (
              <Alert className="mt-4 max-w-sm">
                <AlertTitle>Your Final Score</AlertTitle>
                <AlertDescription>
                  You scored <strong>{score.toFixed(0)}%</strong> on the multiple choice questions. Keep practicing!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
