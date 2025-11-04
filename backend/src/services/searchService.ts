import { tavily } from '@tavily/core';
import { config } from '../config/index.js';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface CompetitorSearchResult {
  name: string;
  url: string;
  description: string;
}

/**
 * Search for competitors using Tavily API
 */
export const searchCompetitors = async (
  ideaTitle: string,
  ideaDescription: string
): Promise<CompetitorSearchResult[]> => {
  // If no API key is configured, return empty array
  if (!config.search.tavilyApiKey) {
    console.warn('Tavily API key not configured. Skipping competitor search.');
    return [];
  }

  try {
    const tvly = tavily({ apiKey: config.search.tavilyApiKey });

    // Create a search query for competitors
    const searchQuery = `competitors alternatives to ${ideaTitle}: ${ideaDescription}`;

    // Search for competitors
    const response = await tvly.search(searchQuery, {
      maxResults: 10,
      searchDepth: 'basic',
      includeAnswer: false,
    });

    // Extract unique competitors from search results
    const competitors: CompetitorSearchResult[] = [];
    const seenUrls = new Set<string>();

    for (const result of response.results || []) {
      // Skip if we've already seen this URL
      if (seenUrls.has(result.url)) continue;

      // Extract company/product name from title
      const name = extractCompetitorName(result.title);

      // Only add if it looks like a valid competitor
      if (name && result.url) {
        competitors.push({
          name,
          url: result.url,
          description: result.content || '',
        });
        seenUrls.add(result.url);
      }

      // Limit to 5 competitors
      if (competitors.length >= 5) break;
    }

    return competitors;
  } catch (error) {
    console.error('Error searching for competitors:', error);
    return [];
  }
};

/**
 * Extract a clean competitor name from a search result title
 */
const extractCompetitorName = (title: string): string => {
  // Remove common suffixes and prefixes
  let name = title
    .replace(/\s*[-–—|:]\s*.*/g, '') // Remove everything after dash, pipe, or colon
    .replace(/^(Top|Best|Review|Reviews?|Alternatives?|Competitors?)\s+/gi, '')
    .replace(/\s+(Review|Reviews?|Alternatives?|Competitors?)$/gi, '')
    .trim();

  // Limit length
  if (name.length > 50) {
    name = name.substring(0, 50).trim();
  }

  return name;
};
