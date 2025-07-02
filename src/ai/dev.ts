import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/extract-text.ts';
import '@/ai/flows/simplify-explanation.ts';
