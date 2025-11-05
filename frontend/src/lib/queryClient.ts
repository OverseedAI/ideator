import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/error";

interface QueryMeta {
  suppressErrorToast?: boolean;
  errorMessage?: string;
}

const showErrorToast = (message: string) => {
  toast.error(message);
};

const queryCache = new QueryCache({
  onError: (error, query) => {
    // Don't show toast for 401 errors (handled by auth flow)
    if (isAxiosError(error) && error.response?.status === 401) {
      return;
    }

    const meta = (query.meta ?? {}) as QueryMeta;
    if (!meta.suppressErrorToast) {
      showErrorToast(getErrorMessage(error, meta.errorMessage));
    }
  },
});

const mutationCache = new MutationCache({
  onError: (error, _vars, _ctx, mutation) => {
    // Don't show toast for 401 errors (handled by auth flow)
    if (isAxiosError(error) && error.response?.status === 401) {
      return;
    }

    const meta = (mutation.meta ?? {}) as QueryMeta;
    if (!meta.suppressErrorToast) {
      showErrorToast(getErrorMessage(error, meta.errorMessage));
    }
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401 (auth issues) or 404 (not found)
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 404) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
