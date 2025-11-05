import { AxiosError } from "axios";

interface ErrorPayload {
  error?: string;
  message?: string;
  detail?: string;
  details?: string;
}

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorPayload | undefined;
    return data?.error || data?.message || data?.detail || data?.details || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
};
