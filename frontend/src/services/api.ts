import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "@/config";
import { authStorage } from "@/lib/authStorage";
import { authEvents } from "@/lib/authEvents";

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clearToken();
      authEvents.emitUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
