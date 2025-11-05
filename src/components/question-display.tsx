
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
import { useState, useRef, useCallback, useMemo } from "react";
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
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
    <Loader2 className="size-12 animate-spin text-primary" />
    <p className="text-lg text-muted-foreground">Generating questions...</p>
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="flex flex-1 items-center justify-center p-8">
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
  subject
}: {
  question: GenerateIgcseQuestionsOutput['questions'][0],
  index: number,
  onAnswerSelect: (questionIndex: number, answer: string) => void;
  selectedAnswer?: string;
  subject: FormSchema['subject'];
}) => {
  const { questionText, options } = useMemo(() => {
    let text = question.questionText;
    
    // Remove "Q1:", "Q2:", etc. prefix if present
    text = text.replace(/^Q\d+:\s*/i, '');
    
    // Try to match options with both formats: A) or A. or A)
    const questionRegex = /^(.*?)(\n[A-D][\.\)]\s+.*)$/s;
    const match = text.match(questionRegex);
    
    if (!match) {
      // Fallback: try without requiring newline before options
      const fallbackRegex = /(.*?)([A-D][\.\)]\s+.*)$/s;
      const fallbackMatch = text.match(fallbackRegex);
      if (fallbackMatch) {
        const mainQuestion = fallbackMatch[1].trim();
        const optionsBlock = fallbackMatch[2].trim();
        // Split by both A) and A. formats
        const optionRegex = /\s*(?=[A-D][\.\)]\s+)/g;
        const parsedOptions = optionsBlock.split(optionRegex).filter(o => o.trim());
        return { questionText: mainQuestion, options: parsedOptions.map(o => o.trim()) };
      }
      return { questionText: text, options: [] };
    }

    const mainQuestion = match[1].trim();
    const optionsBlock = match[2].trim();
    
    // Split options by both A) and A. formats, handling newlines
    const optionRegex = /\n(?=[A-D][\.\)]\s+)/g;
    let parsedOptions = optionsBlock.split(optionRegex);
    
    // If that didn't work, try splitting by pattern that matches both formats
    if (parsedOptions.length < 4) {
      // Try more flexible splitting
      parsedOptions = optionsBlock.split(/(?=[A-D][\.\)]\s+)/g).filter(o => o.trim());
    }
    
    return { questionText: mainQuestion, options: parsedOptions.map(o => o.trim()).filter(o => o.length > 0) };
  }, [question.questionText]);

  return (
    <div className="rounded-md border bg-secondary/50 p-4">
      <div className="flex justify-between items-start mb-4">
        <p className="font-code whitespace-pre-wrap text-sm text-secondary-foreground flex-1">
          <strong>{`Q${index + 1}: `}</strong>{questionText}
        </p>
        <AiSolutionModal question={question.questionText} subject={subject}>
            <Button size="sm" variant="ghost" className="ml-4">
              <Sparkles className="mr-2"/> AI Solve
            </Button>
        </AiSolutionModal>
      </div>

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
      
      {options.length > 0 ? (
        <RadioGroup
          onValueChange={(value) => onAnswerSelect(index, value)}
          value={selectedAnswer}
          className="space-y-2"
        >
          {options.map((option, i) => {
            // Extract the letter (A, B, C, or D) from the option text
            const letterMatch = option.trim().match(/^([A-D])[\.\)]/);
            const letter = letterMatch ? letterMatch[1] : option[0];
            // Remove asterisk and clean up the option text for display
            const displayText = option.replace(/\*/g, '').trim();
            
            return (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={letter} id={`q${index}-option-${i}`} />
                <Label htmlFor={`q${index}-option-${i}`} className="font-code text-sm">{displayText}</Label>
              </div>
            );
          })}
        </RadioGroup>
      ) : <p className="text-sm text-muted-foreground italic">This question could not be parsed as a multiple-choice question.</p>}
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
            <Sparkles className="mr-2" /> AI Solve
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
          {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
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
    setScore(null); // Reset score when a new answer is selected
  };

  const handleSubmitMcq = useCallback(() => {
    if (!questions) return;
    const mcqQuestions = questions.filter(q => q.questionType === 'MCQ');
    if (mcqQuestions.length === 0) return;

    let correctAnswers = 0;
    mcqQuestions.forEach((q, index) => {
      // Find the line with the asterisk (correct answer)
      const correctAnswerLine = q.questionText.split('\n').find(o => o.includes('*'));
      if (!correctAnswerLine) return;
      
      // Extract the letter (A, B, C, or D) from the option pattern [A-D][.)]
      const letterMatch = correctAnswerLine.trim().match(/^([A-D])[\.\)]/);
      const correctAnswerLetter = letterMatch ? letterMatch[1] : correctAnswerLine.trim()[0];
      
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
      <div>
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
                  subject={subject}
                />
              ))}
            </CardContent>
          </Card>
        )}
        {theoryQuestions && theoryQuestions.length > 0 && (
        <Card className="mb-8">
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
              <Alert className="mt-4 max-w-sm text-center">
                <AlertTitle className="text-center">Your Final Score</AlertTitle>
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
