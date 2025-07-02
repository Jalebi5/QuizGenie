"use server";

import { generateQuiz, GenerateQuizInput } from "@/ai/flows/generate-quiz";

export async function handleGenerateQuiz(input: GenerateQuizInput) {
  try {
    const result = await generateQuiz(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return { success: false, error: "Failed to generate quiz. Please try again." };
  }
}
