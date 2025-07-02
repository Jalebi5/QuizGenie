"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export default function ReviewStep() {
  const router = useRouter();
  const { toast } = useToast();
  const [documentText, setDocumentText] = useState("");

  useEffect(() => {
    const text = sessionStorage.getItem("documentText");
    if (text) {
      setDocumentText(text);
    } else {
      // If no text, go back to upload
      router.push("/");
    }
  }, [router]);
  
  const handleNext = () => {
    if (documentText.length < 100) {
      toast({
        variant: "destructive",
        title: "Text is too short",
        description: "Please provide at least 100 characters of text.",
      });
      return;
    }
    sessionStorage.setItem("documentText", documentText);
    router.push('/configure');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Step 2: Review Extracted Text</CardTitle>
          <CardDescription>
            Review or edit the extracted text below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Extracted text will appear here..."
            rows={20}
            className="text-sm"
          />
        </CardContent>
      </Card>
      <div className="flex justify-end mt-6">
        <Button onClick={handleNext}>
          Next <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
