import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ideaService from "@/services/ideaService";
import { Analysis } from "@/types";
import { ideaKeys } from "./useIdeas";
import { useEffect } from "react";

// Query keys
export const analysisKeys = {
  all: () => ["analyses"] as const,
  byIdea: (ideaId: string) => [...analysisKeys.all(), "idea", ideaId] as const,
};

/**
 * Hook to get all analyses for a specific idea
 * Automatically polls when the idea is in "analyzing" status
 */
export const useAnalyses = (
  ideaId: string | undefined,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) => {
  const queryClient = useQueryClient();

  const query = useQuery<Analysis[]>({
    queryKey: analysisKeys.byIdea(ideaId!),
    queryFn: () => ideaService.getIdeaAnalyses(ideaId!),
    enabled: Boolean(ideaId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });

  // Auto-refetch idea status when analyses update
  useEffect(() => {
    if (ideaId && query.data) {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    }
  }, [query.data, ideaId, queryClient]);

  return query;
};

/**
 * Hook to enable polling while idea is being analyzed
 * Use this in combination with useAnalyses for real-time updates
 */
export const useAnalysesPolling = (
  ideaId: string | undefined,
  isAnalyzing: boolean,
  interval = 5000
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ideaId || !isAnalyzing) return;

    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.byIdea(ideaId) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    }, interval);

    return () => clearInterval(intervalId);
  }, [ideaId, isAnalyzing, interval, queryClient]);
};
