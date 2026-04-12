import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { TokenStorage } from "../storage";
import { appEvents } from "./event-emitter";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

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
    console.error(`[API RESPONSE ERROR] ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.log("[API] 401 Unauthorized - emitting session-expired");
      appEvents.emit("session-expired");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
