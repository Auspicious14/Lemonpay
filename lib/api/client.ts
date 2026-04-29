import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { TokenStorage } from "../storage";
import { appEvents } from "./event-emitter";
import Constants from "expo-constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL  ||  Constants.expoConfig?.extra?.apiUrl   

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await TokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data || "",
    );
    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    console.error(`[API ERROR] ${url}:`, {
      status,
      message: error.message,
    });

    if (status === 401) {
      const isAuthEndpoint = [
        "/auth/login-otp",
        "/auth/pin-login",
        "/auth/register",
        "/auth/request-otp",
        "/auth/verify-otp",
        "/auth/me", // don't logout if /auth/me itself 401s (handled by background validator)
      ].some((path) => url.includes(path));

      if (!isAuthEndpoint) {
        console.log("[API] 401 on protected route — session expired");
        appEvents.emit("session-expired");
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
