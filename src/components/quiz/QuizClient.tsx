"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import {
  Quiz,
  StoredQuizData,
  Question,
  QuizResult,
} from "@/types/quiz";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  }, [currentQuestionIndex, quizData]);

  const handleNext = useCallback(() => {
    if (quizData && currentQuestionIndex < quizData.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetTimer();
    }
  }, [quizData, currentQuestionIndex, resetTimer]);
  
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
  const timerPercentage = (timeLeft / quizData.timer) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 space-y-2">
         <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {quizData.quiz.length}</p>
         <Progress value={progressPercentage} />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 space-y-2">
            <p className="text-sm text-muted-foreground">Time left: {timeLeft}s</p>
            <Progress value={timerPercentage} className="h-2" />
          </div>
          <h2 className="text-xl md:text-2xl font-headline font-semibold mb-6">
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
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-secondary has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground transition-colors"
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
