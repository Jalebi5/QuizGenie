"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Highlighter } from "lucide-react";
import { useQuizCreation } from "@/hooks/use-quiz-creation";

export default function ReviewStep() {
  const router = useRouter();
  const { toast } = useToast();
  const { documentText, setDocumentText } = useQuizCreation();
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (!documentText) {
      router.push("/upload");
    }
  }, [documentText, router]);
  
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()?.toString() || "";
    if (selection.length > 10) {
      setSelectedText(selection);
    } else {
      setSelectedText("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleNext = () => {
    const textToUse = selectedText || documentText || "";
    if (textToUse.length < 50) {
      toast({
        variant: "destructive",
        title: "Text is too short",
        description: "Please provide at least 50 characters of text.",
      });
      return;
    }
    setDocumentText(textToUse);
    router.push('/configure');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Step 2: Review & Edit Text</CardTitle>
          <CardDescription>
            The text from your document is below. You can edit it or highlight a specific section to generate a quiz from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={documentText || ""}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Extracted text will appear here..."
            rows={20}
            className="text-base"
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Highlighter className="h-4 w-4" />
                <p>
                    {selectedText 
                        ? `${selectedText.length} characters selected` 
                        : "Highlight text to create a quiz from a specific section."}
                </p>
            </div>
            <Button onClick={handleNext}>
                {selectedText ? "Quiz on Selected Text" : "Quiz on Full Text"}
                <ArrowRight />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
