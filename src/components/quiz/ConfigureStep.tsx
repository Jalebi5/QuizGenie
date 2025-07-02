"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateQuiz } from "@/lib/actions";
import { type StoredQuizData } from "@/types/quiz";

const formSchema = z.object({
  numberOfQuestions: z.coerce.number().min(1, "Minimum 1 question").max(500, "Maximum 500 questions"),
  optionsPerQuestion: z.enum(["4", "5"]).transform(Number),
  timer: z.enum(["15", "30", "45", "60"]).transform(Number),
});

export default function ConfigureStep() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentText, setDocumentText] = useState<string | null>(null);

  useEffect(() => {
    const text = sessionStorage.getItem("documentText");
    if (text) {
      setDocumentText(text);
    } else {
      router.push('/');
    }
  }, [router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfQuestions: 5,
      optionsPerQuestion: 4,
      timer: 30,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!documentText) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Document text not found. Please start over.",
      });
      router.push('/');
      return;
    }
    
    setIsGenerating(true);
    const result = await handleGenerateQuiz({ ...values, documentText });
    setIsGenerating(false);

    if (result.success && result.data) {
      const storedData: StoredQuizData = {
        quiz: result.data.quiz,
        documentText,
        ...values,
      };
      sessionStorage.setItem("quizData", JSON.stringify(storedData));
      router.push("/quiz");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Step 3: Configure Quiz</CardTitle>
            <CardDescription>
              Adjust the settings for your generated quiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionsPerQuestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Options per Question</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of options" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="4">4 Options</SelectItem>
                          <SelectItem value="5">5 Options</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timer per Question</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                         <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timer duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="45">45 seconds</SelectItem>
                          <SelectItem value="60">60 seconds</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isGenerating || !documentText}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
    </div>
  );
}
