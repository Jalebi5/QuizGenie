"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Settings, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateQuiz } from "@/lib/actions";
import { type StoredQuizData } from "@/types/quiz";
import { Label } from "../ui/label";

const questionCountOptions = ["5", "10", "15", "20", "25", "50", "75", "100", "150", "200", "300", "400", "500"] as const;

const formSchema = z.object({
  numberOfQuestions: z.string(),
  quizMode: z.enum(["perQuestion", "timedChallenge"]),
  timerPerQuestion: z.enum(["15", "30", "45", "60", "90", "120"]).optional(),
  timerTotal: z.string().optional(),
  // Advanced
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum(["any", "facts", "concepts", "cause_effect"]),
  keywords: z.string().optional(),
  explanationTiming: z.enum(["immediate", "end"]),
}).refine(data => {
    if (data.quizMode === 'timedChallenge' && !data.timerTotal) {
        return false;
    }
    return true;
}, { message: "Total time is required for a Timed Challenge", path: ["timerTotal"]});

export default function ConfigureStep() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentText, setDocumentText] = useState<string | null>(null);

  useEffect(() => {
    const text = sessionStorage.getItem("documentText");
    const selectedText = sessionStorage.getItem("selectedText");
    if (selectedText) {
      setDocumentText(selectedText);
      sessionStorage.removeItem("selectedText"); 
    } else if (text) {
      setDocumentText(text);
    } else {
      router.push('/');
    }
  }, [router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfQuestions: "10",
      quizMode: "perQuestion",
      timerPerQuestion: "30",
      timerTotal: "10",
      difficulty: "medium",
      questionType: "any",
      keywords: "",
      explanationTiming: "immediate",
    },
  });
  
  const quizMode = form.watch("quizMode");

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

    const timerValue = values.quizMode === 'perQuestion' 
        ? parseInt(values.timerPerQuestion || "30", 10) 
        : parseInt(values.timerTotal || "10", 10) * 60;

    const quizConfig = {
      numberOfQuestions: parseInt(values.numberOfQuestions, 10),
      optionsPerQuestion: 4,
      difficulty: values.difficulty,
      questionType: values.questionType,
      keywords: values.keywords,
      enrichExplanations: true,
    };

    const result = await handleGenerateQuiz({ 
      documentText, 
      ...quizConfig
     });
    setIsGenerating(false);

    if (result.success && result.data) {
      const storedData: StoredQuizData = {
        quiz: result.data.quiz,
        documentText,
        ...quizConfig,
        quizMode: values.quizMode,
        timer: timerValue,
        explanationTiming: values.explanationTiming,
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
              Configure Your Quiz
            </CardTitle>
            <CardDescription>
                Fine-tune the settings to generate the perfect quiz for your study session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Accordion type="multiple" defaultValue={["basic"]} className="w-full">
                    <AccordionItem value="basic">
                        <AccordionTrigger>
                            <h3 className="text-lg font-semibold font-headline flex items-center gap-2"><Wand2/> Basic Settings</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-6">
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
                                name="quizMode"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Timing Style</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="perQuestion" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Per Question Timer
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="timedChallenge" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Timed Challenge (Whole Quiz)
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {quizMode === 'perQuestion' && (
                                <FormField
                                control={form.control}
                                name="timerPerQuestion"
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
                                            <SelectItem value="90">90 seconds</SelectItem>
                                            <SelectItem value="120">2 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            )}
                            
                            {quizMode === 'timedChallenge' && (
                                <FormField
                                    control={form.control}
                                    name="timerTotal"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Total Quiz Time (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="advanced">
                        <AccordionTrigger>
                            <h3 className="text-lg font-semibold font-headline flex items-center gap-2"><Sparkles/> Advanced Settings</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-6">
                            <FormField
                                control={form.control}
                                name="explanationTiming"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Explanation Delivery</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="immediate" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                              Show after each question
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="end" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                              Show only on results page
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Difficulty Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select difficulty" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="easy">Easy</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="questionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Type Focus</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select question type" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="any">Any Type</SelectItem>
                                                <SelectItem value="facts">Facts & Figures</SelectItem>
                                                <SelectItem value="concepts">Concepts & Definitions</SelectItem>
                                                <SelectItem value="cause_effect">Cause & Effect</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="keywords"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Keyword Focus</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., constitution, amendments, rights" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Enter comma-separated keywords to focus the quiz.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button type="submit" className="w-full !mt-8" size="lg" disabled={isGenerating || !documentText}>
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
