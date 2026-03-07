import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiError } from "../types/chat.types";

// Base URL from environment variable or default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.url}`,
        config.data,
      );
    }

    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.status}`, response.data);
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data;
      const errorMessage =
        errorData?.message || `Server error: ${error.response.status}`;

      console.error(`[API] Error ${error.response.status}:`, errorMessage);

      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request made but no response
      const errorMessage =
        "Network error. Please check your connection and try again.";
      console.error("[API] Network error:", errorMessage);

      return Promise.reject(new Error(errorMessage));
    } else {
      // Something else went wrong
      const errorMessage = error.message || "An unexpected error occurred";
      console.error("[API] Error:", errorMessage);

      return Promise.reject(new Error(errorMessage));
    }
  },
);

// Helper function to make API requests with retry logic
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  retries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await api.request<T>(config);
      return response.data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.message.includes("Network error")) {
          // Wait before retrying network errors
          await new Promise((resolve) =>
            setTimeout(resolve, delay * (attempt + 1)),
          );
          continue;
        }
        if (error.message.includes("timeout")) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * (attempt + 1)),
          );
          continue;
        }
      }

      // For other errors, don't retry
      throw error;
    }
  }

  throw lastError;
}

export default api;
