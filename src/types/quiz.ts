import { type GenerateQuizInput, type GenerateQuizOutput } from "@/ai/flows/generate-quiz";

export type Quiz = GenerateQuizOutput["quiz"];
export type Question = Quiz[0];

export interface QuizConfig {
  numberOfQuestions: number;
  optionsPerQuestion: number;
  timer: number;
  quizMode: "perQuestion" | "timedChallenge";
  difficulty: "easy" | "medium" | "hard";
  questionType: "any" | "facts" | "concepts" | "cause_effect";
  keywords?: string;
  explanationTiming: "immediate" | "end";
}

export interface StoredQuizData extends QuizConfig {
  quiz: Quiz;
  documentText: string;
}

export interface QuizResult {
  quiz: Quiz;
  answers: (number | null)[];
  score: number;
  accuracy: number;
  time: string; // ISO date string
  topic: string;
}
