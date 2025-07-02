"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { QuizResult } from "@/types/quiz";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HistoryClient() {
  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("quizHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handlePrint = () => {
    const printStyles = `
      @media print {
        body > *:not(#history-to-print) {
          display: none;
        }
        #history-to-print {
          display: block !important;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    window.print();
    document.head.removeChild(styleSheet);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Your Past Quizzes</CardTitle>
          <CardDescription>Here's a list of your most recent quizzes.</CardDescription>
        </div>
        <Button onClick={handlePrint} variant="outline" className="no-print">
          <Download className="mr-2" /> Download PDF
        </Button>
      </CardHeader>
      <CardContent id="history-to-print">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(item.time), "PPp")}</TableCell>
                <TableCell className="max-w-[300px] truncate">{item.topic}</TableCell>
                <TableCell className="text-center font-medium">{item.score} / {item.quiz.length}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.accuracy > 60 ? "default" : "destructive"} className={item.accuracy > 60 ? "bg-green-600" : ""}>
                    {item.accuracy.toFixed(0)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
