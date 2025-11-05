import { openai } from "@ai-sdk/openai";
import { generateText, generateObject, Output, stepCountIs } from "ai";
import { z } from "zod";
import { config } from "../config";

export const createAIClient = () => {
  const model = openai(config.ai.model);

  return {
    generateText: async (prompt: string, systemPrompt?: string) => {
      const result = await generateText({
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: 0.7,
      });

      return result.text;
    },

    generateStructuredOutput: async (
      prompt: string,
      schema: z.ZodSchema<any>,
      systemPrompt?: string
    ): Promise<any> => {
      const result = await generateObject({
        model,
        schema,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: 0.7,
      });

      return result.object;
    },

    generateStructuredOutputWithWebSearch: async (
      prompt: string,
      schema: z.ZodSchema<any>,
      systemPrompt?: string
    ): Promise<any> => {
      const result = await generateText({
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: 0.7,
        tools: {
          web_search_preview: openai.tools.webSearchPreview({}),
        },
        stopWhen: stepCountIs(5), // Allow multi-step tool calling for web search
        experimental_output: Output.object({ schema }),
      });

      return result.experimental_output;
    },
  };
};

export const aiClient = createAIClient();
