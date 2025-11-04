import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { config } from '../config';

export const createAIClient = () => {
  const model = openai(config.ai.model);

  return {
    generateText: async (prompt: string, systemPrompt?: string) => {
      const result = await generateText({
        model,
        messages: [
          ...(systemPrompt
            ? [{ role: 'system' as const, content: systemPrompt }]
            : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      return result.text;
    },

    generateStructuredOutput: async <T>(
      prompt: string,
      schema: z.ZodSchema<T>,
      systemPrompt?: string
    ): Promise<T> => {
      const result = await generateObject({
        model,
        schema,
        messages: [
          ...(systemPrompt
            ? [{ role: 'system' as const, content: systemPrompt }]
            : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature: 0.7,
      });

      return result.object;
    },
  };
};

export const aiClient = createAIClient();
