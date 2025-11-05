import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ideaService from "@/services/ideaService";
import { Idea } from "@/types";
import toast from "react-hot-toast";

// Query keys
export const ideaKeys = {
  all: () => ["ideas"] as const,
  lists: () => [...ideaKeys.all(), "list"] as const,
  list: () => [...ideaKeys.lists()] as const,
  details: () => [...ideaKeys.all(), "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
};

/**
 * Hook to get all user ideas
 */
export const useIdeas = (options?: { refetchInterval?: number | false }) => {
  return useQuery<Idea[]>({
    queryKey: ideaKeys.list(),
    queryFn: ideaService.getUserIdeas,
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Hook to get a single idea by ID
 */
export const useIdea = (id: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery<Idea>({
    queryKey: ideaKeys.detail(id!),
    queryFn: () => ideaService.getIdeaById(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
};

/**
 * Hook to create a new idea
 */
export const useCreateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation<Idea, Error, { title: string; description: string }>({
    mutationFn: ideaService.createIdea,
    onSuccess: (newIdea) => {
      // Invalidate and refetch ideas list
      queryClient.invalidateQueries({ queryKey: ideaKeys.list() });
      // Optimistically add the new idea to the cache
      queryClient.setQueryData(ideaKeys.detail(newIdea.id), newIdea);
      toast.success("Idea created successfully!");
    },
    meta: {
      errorMessage: "Failed to create idea. Please try again.",
    },
  });
};

/**
 * Hook to update an existing idea
 */
export const useUpdateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Idea,
    Error,
    { id: string; data: Partial<{ title: string; description: string; status: string }> }
  >({
    mutationFn: ({ id, data }) => ideaService.updateIdea(id, data),
    onSuccess: (updatedIdea) => {
      // Update the idea in the cache
      queryClient.setQueryData(ideaKeys.detail(updatedIdea.id), updatedIdea);
      // Invalidate the list to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: ideaKeys.list() });
      toast.success("Idea updated successfully!");
    },
    meta: {
      errorMessage: "Failed to update idea. Please try again.",
    },
  });
};

/**
 * Hook to delete an idea with optimistic update
 */
export const useDeleteIdea = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousIdeas?: Idea[] }>({
    mutationFn: ideaService.deleteIdea,
    onMutate: async (ideaId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ideaKeys.list() });

      // Snapshot the previous value
      const previousIdeas = queryClient.getQueryData<Idea[]>(ideaKeys.list());

      // Optimistically remove the idea from the list
      if (previousIdeas) {
        queryClient.setQueryData<Idea[]>(
          ideaKeys.list(),
          previousIdeas.filter((idea) => idea.id !== ideaId)
        );
      }

      // Return context with the snapshot
      return { previousIdeas };
    },
    onError: (_error, _ideaId, context) => {
      // Rollback on error
      if (context?.previousIdeas) {
        queryClient.setQueryData(ideaKeys.list(), context.previousIdeas);
      }
    },
    onSuccess: (_data, ideaId) => {
      // Remove the idea detail from cache
      queryClient.removeQueries({ queryKey: ideaKeys.detail(ideaId) });
      toast.success("Idea deleted successfully!");
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ideaKeys.list() });
    },
    meta: {
      errorMessage: "Failed to delete idea. Please try again.",
    },
  });
};

/**
 * Hook to trigger analysis for an idea
 */
export const useAnalyzeIdea = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: ideaService.analyzeIdea,
    onSuccess: (_data, ideaId) => {
      // Invalidate both the idea and its analyses
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
      // Note: analyses invalidation is handled in useAnalyses
      toast.success("Analysis started! This may take a few moments.");
    },
    meta: {
      errorMessage: "Failed to start analysis. Please try again.",
    },
  });
};
