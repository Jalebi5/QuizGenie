"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizResult } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X } from "lucide-react";
import Confetti from "./Confetti";
import WorkHard from "./WorkHard";
import { cn } from "@/lib/utils";

export default function ResultsClient() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("quizResult");
    if (data) {
      setResult(JSON.parse(data));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!result) {
    return <div className="flex items-center justify-center h-[50vh]">Loading results...</div>;
  }

  const isSuccess = result.accuracy > 60;

  return (
    <div className="max-w-4xl mx-auto">
      {isSuccess && <Confetti />}
      <Card className="overflow-hidden">
        <CardHeader className="text-center p-6 bg-secondary/50">
          {isSuccess ? (
            <div>
              <h2 className="text-3xl font-bold font-headline text-green-600">Congratulations!</h2>
              <p className="text-muted-foreground">Excellent work. You passed!</p>
            </div>
          ) : (
            <div>
              <WorkHard />
              <h2 className="text-3xl font-bold font-headline text-destructive mt-4">Keep Trying!</h2>
              <p className="text-muted-foreground">Don't give up. Review your answers and try again.</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card>
              <CardHeader>
                <CardDescription>Accuracy</CardDescription>
                <CardTitle className={cn("text-4xl font-headline", isSuccess ? "text-green-600" : "text-destructive")}>
                  {result.accuracy.toFixed(0)}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Score</CardDescription>
                <CardTitle className="text-4xl font-headline">{result.score} / {result.quiz.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Topic</CardDescription>
                <CardTitle className="text-lg font-normal truncate pt-2">{result.topic}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div>
             <h3 className="text-xl font-bold font-headline mb-4">Review Your Answers</h3>
             <Accordion type="single" collapsible className="w-full">
              {result.quiz.map((question, qIndex) => {
                const userAnswerIndex = result.answers[qIndex];
                const isCorrect = userAnswerIndex === question.correctAnswerIndex;
                return (
                  <AccordionItem value={`item-${qIndex}`} key={qIndex}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        {isCorrect ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-destructive" />}
                        <span className="text-left">{question.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {question.options.map((option, oIndex) => {
                          const isUserAnswer = oIndex === userAnswerIndex;
                          const isCorrectAnswer = oIndex === question.correctAnswerIndex;
                          return (
                            <li
                              key={oIndex}
                              className={cn(
                                "p-3 rounded-md border",
                                isCorrectAnswer ? "bg-green-100 dark:bg-green-900 border-green-500" : "",
                                isUserAnswer && !isCorrectAnswer ? "bg-red-100 dark:bg-red-900 border-red-500" : ""
                              )}
                            >
                              {option}
                              {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-sm font-semibold text-destructive">(Your Answer)</span>}
                              {isCorrectAnswer && <span className="ml-2 text-sm font-semibold text-green-600">(Correct Answer)</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          <div className="text-center">
            <Button asChild>
              <Link href="/">Take Another Quiz</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
