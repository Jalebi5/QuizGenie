"use server";

import { generateQuiz, GenerateQuizInput } from "@/ai/flows/generate-quiz";
import { extractTextFromImage, ExtractTextFromImageInput } from "@/ai/flows/extract-text";

export async function handleGenerateQuiz(input: GenerateQuizInput) {
  try {
    const result = await generateQuiz(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return { success: false, error: "Failed to generate quiz. Please try again." };
  }
}

export async function handleExtractText(input: ExtractTextFromImageInput) {
  try {
    const result = await extractTextFromImage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error extracting text:", error);
    return { success: false, error: "Failed to extract text. Please try again." };
  }
}
