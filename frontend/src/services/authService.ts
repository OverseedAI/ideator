import api from "./api";
import { AuthResponse, User } from "@/types";
import { authStorage } from "@/lib/authStorage";

export const signup = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/signup", data);
  return response.data;
};

export const login = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me");
  return response.data;
};

export const setAuthToken = (token: string) => {
  authStorage.setToken(token);
};

export const getStoredToken = (): string | null => {
  return authStorage.getToken();
};

export const clearAuth = () => {
  authStorage.clearToken();
};

// OAuth functions
export const initiateGoogleAuth = async (): Promise<{ authUrl: string; state: string }> => {
  const response = await api.get<{ authUrl: string; state: string }>("/oauth/google");
  return response.data;
};

export const handleGoogleCallback = async (
  code: string,
  state: string
): Promise<AuthResponse & { isNewUser?: boolean; accountLinked?: boolean }> => {
  const response = await api.get<AuthResponse & { isNewUser?: boolean; accountLinked?: boolean }>(
    "/oauth/google/callback",
    {
      params: { code, state },
    }
  );
  return response.data;
};

export const getLinkedProviders = async (): Promise<{
  providers: Array<{ provider: string; email: string; createdAt: string }>;
}> => {
  const response = await api.get("/oauth/providers");
  return response.data;
};

export const unlinkProvider = async (provider: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/oauth/providers/${provider}`);
  return response.data;
};
