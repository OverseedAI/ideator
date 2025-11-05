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
