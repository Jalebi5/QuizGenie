
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoredQuizData, QuizResult, Question } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, HelpCircle, Download, Redo } from "lucide-react";
import Confetti from "./Confetti";
import WorkHard from "./WorkHard";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuizCreation } from "@/hooks/use-quiz-creation";

type FilterType = 'all' | 'correct' | 'incorrect';

export default function ResultsClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { quizResult, setQuizData } = useQuizCreation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!quizResult) {
      router.push("/");
    }
  }, [quizResult, router]);
  
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };

    if (isPrinting) {
      // Use 'once: true' to automatically remove the listener after it fires.
      window.addEventListener("afterprint", handleAfterPrint, { once: true });
      window.print();
    }
    
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isPrinting]);

  const handlePrint = () => {
    setIsPrinting(true);
  };
  
  const handleRetakeIncorrect = () => {
    if (!quizResult || !quizResult.config) {
        toast({ title: "Cannot Retake Quiz", description: "Quiz configuration is missing."});
        return;
    }

    const incorrectQuestions = quizResult.quiz.filter((_, qIndex) => 
        quizResult.answers[qIndex] !== quizResult.quiz[qIndex].correctAnswerIndex
    );
    
    if (incorrectQuestions.length === 0) {
        toast({ title: "Nothing to retake!", description: "You answered all questions correctly." });
        return;
    }

    const newQuizConfig = { ...quizResult.config, numberOfQuestions: incorrectQuestions.length };

    const storedData: StoredQuizData = {
        quiz: incorrectQuestions,
        documentText: `Review of incorrect answers for "${quizResult.topic}"`,
        ...newQuizConfig
    };

    setQuizData(storedData);
    router.push("/quiz");
  };

  if (!quizResult) {
    return <div className="flex items-center justify-center h-[50vh]">Loading results...</div>;
  }

  const isSuccess = quizResult.accuracy > 60;
  
  const createMarkup = (text: string) => {
    if (!text) return { __html: "" };
    const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: boldedText };
  };

  const incorrectCount = quizResult.quiz.length - quizResult.score;

  const ReviewContent = ({ question, qIndex }: { question: Question, qIndex: number}) => {
    const userAnswerIndex = quizResult.answers[qIndex];
    return (
      <>
        <ul className="space-y-2 mb-4">
          {question.options.map((option, oIndex) => {
            const isUserAnswer = oIndex === userAnswerIndex;
            const isCorrectAnswer = oIndex === question.correctAnswerIndex;
            return (
              <li
                key={oIndex}
                className={cn(
                  "flex p-3 rounded-md border items-start",
                  isCorrectAnswer ? "bg-green-100 dark:bg-green-900/50 border-green-500" : "",
                  isUserAnswer && !isCorrectAnswer ? "bg-red-100 dark:bg-red-900/50 border-red-500" : ""
                )}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <span className="break-words">{String.fromCharCode(65 + oIndex)}. {option}</span>
                </div>
                <div className="flex-shrink-0">
                  {isUserAnswer && !isCorrectAnswer && <span className="text-sm font-semibold text-destructive whitespace-nowrap">(Your Answer)</span>}
                  {isCorrectAnswer && <span className="text-sm font-semibold text-green-600 whitespace-nowrap">(Correct Answer)</span>}
                </div>
              </li>
            );
          })}
        </ul>
        {question.explanation && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h4 className="font-bold font-headline text-primary">Explanation</h4>
            </div>
            <div
              className="text-sm text-foreground/80 break-words"
              dangerouslySetInnerHTML={createMarkup(question.explanation)}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto" id="results-to-print">
      {isSuccess && <Confetti />}
      <Card className="overflow-hidden">
        <CardHeader className="relative text-center p-6 bg-secondary/50">
          <div className="flex justify-end gap-2 absolute top-4 right-4 no-print">
            <Button variant="outline" size="sm" onClick={handleRetakeIncorrect} disabled={!quizResult.config || incorrectCount === 0}>
                <Redo /> Retake Incorrect
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download /> Download PDF
            </Button>
          </div>
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
                  {quizResult.accuracy.toFixed(0)}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Score</CardDescription>
                <CardTitle className="text-4xl font-headline">{quizResult.score} / {quizResult.quiz.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Topic</CardDescription>
                <CardTitle className="text-lg font-normal pt-2 break-words min-w-0">{quizResult.topic}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold font-headline">Review Your Answers</h3>
                <div className="flex gap-2 no-print">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All ({quizResult.quiz.length})</Button>
                    <Button variant={filter === 'correct' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('correct')} className="bg-green-600 hover:bg-green-700">Correct ({quizResult.score})</Button>
                    <Button variant={filter === 'incorrect' ? 'destructive' : 'outline'} size="sm" onClick={() => setFilter('incorrect')}>Incorrect ({incorrectCount})</Button>
                </div>
             </div>
             
             {isPrinting ? (
              <div className="space-y-6 pt-4">
                {quizResult.quiz.map((question, qIndex) => {
                  const isCorrect = quizResult.answers[qIndex] === question.correctAnswerIndex;
                  return (
                    <div key={qIndex} className="border-t pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-start gap-2 w-full text-left mb-4 font-semibold">
                        {isCorrect ? <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" /> : <X className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />}
                        <p className="flex-1 min-w-0 break-words">{qIndex + 1}. {question.question}</p>
                      </div>
                      <div className="pl-7">
                        <ReviewContent question={question} qIndex={qIndex} />
                      </div>
                    </div>
                  );
                })}
              </div>
             ) : (
              <Accordion type="single" collapsible className="w-full">
                {quizResult.quiz.map((question, qIndex) => {
                  const isCorrect = quizResult.answers[qIndex] === question.correctAnswerIndex;

                  if (filter === 'correct' && !isCorrect) return null;
                  if (filter === 'incorrect' && isCorrect) return null;

                  return (
                    <AccordionItem value={`item-${qIndex}`} key={qIndex}>
                      <AccordionTrigger>
                        <div className="flex items-start gap-2 w-full text-left">
                          {isCorrect ? <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" /> : <X className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />}
                          <div className="flex-1 min-w-0 break-words">{qIndex + 1}. {question.question}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ReviewContent question={question} qIndex={qIndex} />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
             )}
          </div>

          <div className="text-center no-print">
            <Button asChild>
              <Link href="/">Take Another Quiz</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
