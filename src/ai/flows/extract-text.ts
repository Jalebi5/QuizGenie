'use server';
/**
 * @fileOverview Extracts text from one or more images.
 *
 * - extractTextFromImage - A function that takes image data URIs and returns the combined text.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "An array of photos of documents, as data URIs. Each must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
    text: z.string().describe('The combined extracted text from all images.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractTextFromImage(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const extractTextPrompt = ai.definePrompt({
    name: 'extractTextPrompt',
    model: 'googleai/gemini-1.5-pro-latest',
    input: {schema: ExtractTextFromImageInputSchema},
    output: {schema: ExtractTextFromImageOutputSchema},
    prompt: `You are an expert at Optical Character Recognition (OCR). Your task is to extract all text from the provided images.
- Concatenate the text from all documents into a single block of text, maintaining the original order.
- You MUST return the result in a JSON format that matches the following schema: { "text": "The extracted text..." }.

{{#each photoDataUris}}
Document Page: {{media url=this}}
{{/each}}
`,
});


const extractTextFromImageFlow = ai.defineFlow(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ExtractTextFromImageInputSchema,
    outputSchema: ExtractTextFromImageOutputSchema,
  },
  async input => {
    const {output} = await extractTextPrompt(input);
    return output!;
  }
);
