import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import * as authService from "@/services/authService";
import { authStorage } from "@/lib/authStorage";
import { authEvents } from "@/lib/authEvents";
import { User, AuthResponse } from "@/types";
import toast from "react-hot-toast";

// Query keys
export const authKeys = {
  currentUser: () => ["auth", "currentUser"] as const,
};

/**
 * Hook to get the current authenticated user
 * Automatically fetches user data if a token exists
 */
export const useCurrentUser = () => {
  const token = authStorage.getToken();

  const query = useQuery<User | null>({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getMe,
    enabled: Boolean(token),
    retry: false,
    select: (data) => data,
    meta: { suppressErrorToast: true },
  });

  return {
    ...query,
    user: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    hasToken: Boolean(token),
  };
};

/**
 * Hook to handle user login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authStorage.setToken(data.token);
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      toast.success("Welcome back!");
      navigate("/app");
    },
    meta: {
      errorMessage: "Failed to login. Please check your credentials.",
    },
  });
};

/**
 * Hook to handle user signup
 */
export const useSignup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<AuthResponse, Error, { email: string; password: string; name: string }>({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      authStorage.setToken(data.token);
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      toast.success("Account created successfully!");
      navigate("/app");
    },
    meta: {
      errorMessage: "Failed to create account. Please try again.",
    },
  });
};

/**
 * Hook to handle user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      authStorage.clearToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    },
  });
};

/**
 * Hook to listen for unauthorized events and redirect to login
 * Should be used in the app root component
 */
export const useAuthRedirect = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.clear();
      navigate("/login", { replace: true });
    });

    return unsubscribe;
  }, [queryClient, navigate]);
};
