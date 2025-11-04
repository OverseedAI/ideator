import { tool } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';
import { config } from '../config/index.js';

/**
 * Web search tool for AI to find competitors and information online
 */
export const webSearchTool = tool({
  description: `Search the web for information about competitors, companies, products, or market research.
Use this when you need to find real, current information about competitors or validate product ideas.
Returns a list of search results with titles, URLs, and content snippets.`,

  parameters: z.object({
    query: z.string().describe('The search query to execute'),
    maxResults: z.number().int().min(1).max(10).optional().describe('Maximum number of results to return (1-10, default: 5)'),
  }),

  execute: async ({ query, maxResults }) => {
    const max = maxResults ?? 5;
    // If no API key is configured, return empty results
    if (!config.search.tavilyApiKey) {
      console.warn('Tavily API key not configured. Web search tool unavailable.');
      return {
        results: [],
        message: 'Web search is not configured. Please add TAVILY_API_KEY to use this feature.',
      };
    }

    try {
      const tvly = tavily({ apiKey: config.search.tavilyApiKey });

      // Execute the search
      const response = await tvly.search(query, {
        maxResults: max,
        searchDepth: 'basic',
        includeAnswer: false,
      });

      // Format results for the AI
      const results = (response.results || []).map((result) => ({
        title: result.title,
        url: result.url,
        content: result.content,
      }));

      return {
        results,
        query,
        message: `Found ${results.length} results for: ${query}`,
      };
    } catch (error) {
      console.error('Web search error:', error);
      return {
        results: [],
        query,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
});

/**
 * All available tools for the AI
 */
export const aiTools = {
  webSearch: webSearchTool,
};
