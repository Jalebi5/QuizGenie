'use server';
/**
 * @fileOverview Simplifies a given text explanation.
 *
 * - simplifyExplanation - A function that takes text and returns a simplified version.
 * - SimplifyExplanationInput - The input type for the simplifyExplanation function.
 * - SimplifyExplanationOutput - The return type for the simplifyExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyExplanationInputSchema = z.object({
  textToSimplify: z
    .string()
    .describe('The text that needs to be simplified.'),
});
export type SimplifyExplanationInput = z.infer<typeof SimplifyExplanationInputSchema>;

const SimplifyExplanationOutputSchema = z.object({
    simplifiedText: z.string().describe('The simplified explanation.'),
});
export type SimplifyExplanationOutput = z.infer<typeof SimplifyExplanationOutputSchema>;

export async function simplifyExplanation(input: SimplifyExplanationInput): Promise<SimplifyExplanationOutput> {
  return simplifyExplanationFlow(input);
}

const simplifyExplanationPrompt = ai.definePrompt({
    name: 'simplifyExplanationPrompt',
    input: {schema: SimplifyExplanationInputSchema},
    output: {schema: SimplifyExplanationOutputSchema},
    prompt: `Explain the following text in simple terms, as if you were talking to a 5-year-old. Keep it concise and clear.

Text to simplify: {{{textToSimplify}}}`,
});


const simplifyExplanationFlow = ai.defineFlow(
  {
    name: 'simplifyExplanationFlow',
    inputSchema: SimplifyExplanationInputSchema,
    outputSchema: SimplifyExplanationOutputSchema,
  },
  async input => {
    const {output} = await simplifyExplanationPrompt(input);
    return output!;
  }
);
