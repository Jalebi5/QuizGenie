
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, HelpCircle, Lightbulb, Loader2 } from "lucide-react";
import {
  Question,
  QuizResult,
} from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { handleSimplifyExplanation } from "@/lib/actions";
import { Skeleton } from "../ui/skeleton";
import { useQuizCreation } from "@/hooks/use-quiz-creation";

export default function QuizClient() {
  const router = useRouter();
  const { toast } = useToast();
  const quizCardRef = useRef<HTMLDivElement>(null);

  const { quizData, setQuizResult } = useQuizCreation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [answers, setAnswers] = useState<(number | null)[]>(() => 
    quizData ? Array(quizData.quiz.length).fill(null) : []
  );
  const [timeLeft, setTimeLeft] = useState(quizData?.timer || 30);

  const [simplifiedExplanation, setSimplifiedExplanation] = useState<string | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  
  const isAnswered = answers[currentQuestionIndex] !== null;

  useEffect(() => {
    if (!quizData) {
      router.push("/upload");
    } else {
        if (answers.length !== quizData.quiz.length) {
            setAnswers(Array(quizData.quiz.length).fill(null));
        }
        if (quizData.quizMode === 'perQuestion') {
            setTimeLeft(quizData.timer);
        }
    }
  }, [quizData, router, answers.length]);

  const resetTimer = useCallback(() => {
    if (quizData) {
      setTimeLeft(quizData.timer);
    }
  }, [quizData]);

  const handleNext = useCallback(() => {
    if (quizData && currentQuestionIndex < quizData.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSimplifiedExplanation(null);
      if (quizData.quizMode === 'perQuestion') {
        resetTimer();
      }
      quizCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [quizData, currentQuestionIndex, resetTimer]);
  
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSimplifiedExplanation(null);
      if (quizData && quizData.quizMode === 'perQuestion') {
        resetTimer();
      }
      quizCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentQuestionIndex, resetTimer, quizData]);

  useEffect(() => {
    if (!quizData || isAnswered || quizData.quizMode !== 'perQuestion') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return quizData.timer;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quizData, handleNext, isAnswered]);

  const handleAnswerChange = (value: string) => {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value, 10);
    setAnswers(newAnswers);
  };

  const handleSimplify = async () => {
    if (!quizData || !currentQuestion.explanation) return;
    setIsSimplifying(true);
    setSimplifiedExplanation(null);
    try {
        const result = await handleSimplifyExplanation({ textToSimplify: currentQuestion.explanation });
        if (result.success && result.data) {
            setSimplifiedExplanation(result.data.simplifiedText);
        } else {
            toast({ variant: "destructive", title: "Could not simplify explanation", description: result.error });
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred while simplifying." });
    } finally {
        setIsSimplifying(false);
    }
  };

  const handleSubmit = () => {
    if (!quizData) return;

    let score = 0;
    quizData.quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswerIndex) {
        score++;
      }
    });

    const accuracy = (score / quizData.quiz.length) * 100;
    const topic = quizData.documentText.substring(0, 50) + "...";
    
    const result: QuizResult = {
      quiz: quizData.quiz,
      answers,
      score,
      accuracy,
      time: new Date().toISOString(),
      topic,
      config: {
        numberOfQuestions: quizData.numberOfQuestions,
        optionsPerQuestion: quizData.optionsPerQuestion,
        timer: quizData.timer,
        quizMode: quizData.quizMode,
        difficulty: quizData.difficulty,
        questionType: quizData.questionType,
        keywords: quizData.keywords,
        explanationTiming: quizData.explanationTiming,
      }
    };

    setQuizResult(result);

    const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    history.unshift(result);
    localStorage.setItem("quizHistory", JSON.stringify(history.slice(0, 20)));

    router.push("/results");
  };

  const createMarkup = (text: string) => {
    if (!text) return { __html: '' };
    const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: boldedText };
  };

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading quiz...
      </div>
    );
  }

  const currentQuestion: Question = quizData.quiz[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quizData.quiz.length) * 100;
  const userAnswer = answers[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto" ref={quizCardRef}>
      <Progress value={progressPercentage} className="mb-4" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Question {currentQuestionIndex + 1} of {quizData.quiz.length}</CardTitle>
            {quizData.quizMode === "perQuestion" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>{timeLeft}s</span>
                </div>
            )}
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold font-headline mb-6 break-words">
            {currentQuestion.question}
          </h2>

          <RadioGroup
            value={userAnswer?.toString()}
            onValueChange={handleAnswerChange}
            className="space-y-4"
            disabled={isAnswered}
          >
            {currentQuestion.options.map((option, index) => {
              const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
              const isSelected = index === userAnswer;

              return (
              <div
                key={index}
                className={cn(
                  "border rounded-lg transition-all",
                  !isAnswered && "hover:bg-secondary",
                  isSelected && !isAnswered && "border-primary bg-primary/10",
                  isAnswered && quizData.explanationTiming === 'immediate' && isCorrectAnswer && "border-green-500 bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100",
                  isAnswered && quizData.explanationTiming === 'immediate' && isSelected && !isCorrectAnswer && "border-red-500 bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100",
                  isAnswered && "cursor-not-allowed"
                )}
              >
                  <Label
                    htmlFor={`option-${index}`}
                    className={cn(
                      "flex items-start p-4 w-full",
                      !isAnswered && "cursor-pointer"
                    )}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1 flex-shrink-0" />
                    <div className="ml-4 flex-1 min-w-0">
                      <span className="font-bold">{String.fromCharCode(65 + index)}. </span>
                      <span className="break-words">{option}</span>
                    </div>
                  </Label>
              </div>
            )})}
          </RadioGroup>

          {isAnswered && currentQuestion.explanation && quizData.explanationTiming === 'immediate' && (
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/10 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <h4 className="font-bold font-headline text-primary">Explanation</h4>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSimplify} disabled={isSimplifying}>
                      {isSimplifying ? <Loader2 className="mr-2 animate-spin" /> : <Lightbulb className="mr-2" />}
                      Explain Like I'm 5
                  </Button>
              </div>
              <div
                  className="text-sm text-foreground/80 break-words"
                  dangerouslySetInnerHTML={createMarkup(currentQuestion.explanation)}
              />
              {isSimplifying && <Skeleton className="h-12 w-full mt-2" />}
              {simplifiedExplanation && (
                   <div className="mt-4 p-3 rounded-md border border-amber-500/50 bg-amber-500/10">
                      <p className="text-sm text-foreground/90 break-words" dangerouslySetInnerHTML={createMarkup(simplifiedExplanation)} />
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-6 h-11">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ArrowLeft /> Previous
        </Button>
        {currentQuestionIndex === quizData.quiz.length - 1 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={userAnswer === null}>
                <CheckCircle />
                Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                <AlertDialogDescription>
                  You can still go back and review your answers. Once submitted, the quiz will end.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button onClick={handleNext} disabled={userAnswer === null}>
            Next
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
