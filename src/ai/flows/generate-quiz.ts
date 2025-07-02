'use server';
/**
 * @fileOverview Generates a quiz from a document's text content.
 *
 * - generateQuiz - A function that takes document text as input and generates a quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  documentText: z.string().describe('The extracted text content from the document.'),
  numberOfQuestions: z.number().min(1).max(500).default(10).describe('The number of questions to generate for the quiz.'),
  optionsPerQuestion: z.number().min(4).max(5).default(4).describe('The number of answer options to generate per question.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The answer options for the question.'),
      correctAnswerIndex: z.number().min(0).describe('The index of the correct answer in the options array.'),
    })
  ).describe('The generated quiz questions and answers.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are a quiz generator expert. Given the following document text, generate a quiz with the specified number of questions and options per question.

Document Text: {{{documentText}}}

Number of Questions: {{{numberOfQuestions}}}
Options Per Question: {{{optionsPerQuestion}}}

Ensure that each question has one correct answer, and that the correct answer index is accurately represented.

Output the quiz in a JSON format that matches the output schema.`, 
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await generateQuizPrompt(input);
    return output!;
  }
);
