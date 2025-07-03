
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BookOpen, Redo } from "lucide-react";
import { QuizResult, StoredQuizData } from "@/types/quiz";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuizCreation } from "@/hooks/use-quiz-creation";

export default function HistoryClient() {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const router = useRouter();
  const { setQuizResult, setQuizData } = useQuizCreation();

  useEffect(() => {
    const storedHistory = localStorage.getItem("quizHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleReview = (quizResult: QuizResult) => {
    setQuizResult(quizResult);
    router.push("/results");
  };

  const handleRetake = (quizResult: QuizResult) => {
    if (!quizResult.config) {
        // Fallback for older history items that didn't store config
        alert("Cannot retake this quiz as it was created with an older version of the app.");
        return;
    }
    const storedData: StoredQuizData = {
      quiz: quizResult.quiz,
      documentText: `Retake of quiz on "${quizResult.topic}"`,
      ...quizResult.config,
    };
    setQuizData(storedData);
    router.push("/quiz");
  };

  if (history.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle className="font-headline">No History Found</CardTitle>
          <CardDescription>You haven't completed any quizzes yet. Take a quiz to see your history here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
          <CardTitle className="font-headline">Your Past Quizzes</CardTitle>
          <CardDescription>Here's a list of your most recent quizzes. You can review or retake them.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead className="text-center">Accuracy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(item.time), "PPp")}</TableCell>
                <TableCell className="max-w-[250px] break-words">{item.topic}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.accuracy > 60 ? "default" : "destructive"} className={item.accuracy > 60 ? "bg-green-600" : ""}>
                    {item.accuracy.toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleReview(item)}>
                            <BookOpen /> Review
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRetake(item)} disabled={!item.config}>
                            <Redo /> Retake
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-4">
          {history.map((item, index) => (
            <Card key={index} className="w-full">
              <CardContent className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2 min-w-0">
                  <p className="text-sm text-muted-foreground">Topic</p>
                  <p className="font-medium break-words">{item.topic}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(item.time), "PP")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <Badge variant={item.accuracy > 60 ? "default" : "destructive"} className={item.accuracy > 60 ? "bg-green-600" : ""}>
                    {item.accuracy.toFixed(0)}%
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => handleReview(item)}>
                    <BookOpen /> Review
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRetake(item)} disabled={!item.config}>
                    <Redo /> Retake
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
