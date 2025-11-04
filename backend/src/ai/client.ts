import { openai } from '@ai-sdk/openai';
import { generateText, generateObject, CoreTool, tool } from 'ai';
import { z } from 'zod';
import { config } from '../config';

// Re-export tool for use in other files
export { tool };

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

    /**
     * Generate structured output with tool calling support
     * The AI can use tools (like web search) before generating the final structured output
     */
    generateStructuredOutputWithTools: async <T>(
      prompt: string,
      schema: z.ZodSchema<T>,
      tools: Record<string, CoreTool>,
      systemPrompt?: string,
      maxSteps: number = 5
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
        tools,
        maxSteps,
        temperature: 0.7,
      });

      return result.object;
    },

    /**
     * Generate text with tool calling support
     * The AI can use tools (like web search) during generation
     */
    generateTextWithTools: async (
      prompt: string,
      tools: Record<string, CoreTool>,
      systemPrompt?: string,
      maxSteps: number = 5
    ) => {
      const result = await generateText({
        model,
        messages: [
          ...(systemPrompt
            ? [{ role: 'system' as const, content: systemPrompt }]
            : []),
          { role: 'user' as const, content: prompt },
        ],
        tools,
        maxSteps,
        temperature: 0.7,
      });

      return result;
    },
  };
};

export const aiClient = createAIClient();
