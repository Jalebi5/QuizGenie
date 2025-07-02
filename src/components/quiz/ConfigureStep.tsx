"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Checkbox } from "@/components/ui/checkbox";

const questionCountOptions = ["5", "10", "15", "20", "25", "50", "75", "100", "150", "200", "300", "400", "500"] as const;

const formSchema = z.object({
  numberOfQuestions: z.string(),
  timer: z.enum(["15", "30", "45", "60"]),
  enrichExplanations: z.boolean().default(false),
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
      numberOfQuestions: "5",
      timer: "30",
      enrichExplanations: false,
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

    const numericValues = {
      numberOfQuestions: parseInt(values.numberOfQuestions, 10),
      optionsPerQuestion: 4, // Hardcoded as per UI change
      timer: parseInt(values.timer, 10),
    };

    const result = await handleGenerateQuiz({ 
      documentText, 
      numberOfQuestions: numericValues.numberOfQuestions,
      optionsPerQuestion: numericValues.optionsPerQuestion,
      enrichExplanations: values.enrichExplanations,
     });
    setIsGenerating(false);

    if (result.success && result.data) {
      const storedData: StoredQuizData = {
        quiz: result.data.quiz,
        documentText,
        ...numericValues,
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
            <CardTitle className="font-headline flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Quiz Settings
            </CardTitle>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of questions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionCountOptions.map((option) => (
                             <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
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
                      <FormLabel>Time per Question</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enrichExplanations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enrich Explanations
                        </FormLabel>
                      </div>
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
                    "Generate Quiz"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
    </div>
  );
}
