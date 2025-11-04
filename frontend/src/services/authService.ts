import api from "./api";
import { AuthResponse, User } from "@/types";

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
  localStorage.setItem("token", token);
};

export const setUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem("token");
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
