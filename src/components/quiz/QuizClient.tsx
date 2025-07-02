"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from "lucide-react";
import {
  Quiz,
  StoredQuizData,
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

export default function QuizClient() {
  const router = useRouter();

  const [quizData, setQuizData] = useState<StoredQuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const data = sessionStorage.getItem("quizData");
    if (data) {
      const parsedData: StoredQuizData = JSON.parse(data);
      setQuizData(parsedData);
      setAnswers(Array(parsedData.quiz.length).fill(null));
      setTimeLeft(parsedData.timer);
    } else {
      router.push("/");
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (quizData) {
      setTimeLeft(quizData.timer);
    }
  }, [quizData]);

  const handleNext = useCallback(() => {
    if (quizData && currentQuestionIndex < quizData.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetTimer();
    }
  }, [quizData, currentQuestionIndex, resetTimer]);

  useEffect(() => {
    if (!quizData) return;

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
  }, [currentQuestionIndex, quizData, handleNext]);

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      resetTimer();
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value, 10);
    setAnswers(newAnswers);
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
    };

    sessionStorage.setItem("quizResult", JSON.stringify(result));

    const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    history.unshift(result);
    localStorage.setItem("quizHistory", JSON.stringify(history.slice(0, 10))); // limit history

    router.push("/results");
  };

  if (!quizData) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        Loading quiz...
      </div>
    );
  }

  const currentQuestion: Question = quizData.quiz[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quizData.quiz.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Progress value={progressPercentage} className="mb-4" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Question {currentQuestionIndex + 1} of {quizData.quiz.length}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{timeLeft}s</span>
            </div>
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold font-headline mb-6">
            {currentQuestion.question}
          </h2>

          <RadioGroup
            value={answers[currentQuestionIndex]?.toString()}
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className={cn(
                  "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                  "hover:bg-secondary",
                  "has-[input:checked]:bg-green-100 has-[input:checked]:border-green-500 has-[input:checked]:text-green-900 dark:has-[input:checked]:bg-green-900 dark:has-[input:checked]:text-green-100"
                )}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="sr-only" />
                <span className="font-bold mr-4">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
          <ArrowLeft />
          Previous
        </Button>

        {currentQuestionIndex === quizData.quiz.length - 1 ? (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <CheckCircle />
                Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                <AlertDialogDescription>
                  Please review your answers before submitting. You cannot change them after this point.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
