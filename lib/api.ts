import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/useAuthStore";

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: "success" | "error";
}

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for attaching token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Auto logout on 401
      useAuthStore.getState().logout();
    }

    const errorMessage =
      (error.response?.data as any)?.message || "An unexpected error occurred";
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  },
);

export default api;
