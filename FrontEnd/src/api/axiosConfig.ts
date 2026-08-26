/**
 * @file axiosConfig.js
 * @description Configures a global Axios HTTP client instance for all API communication.
 *
 * Features:
 *   - Reads the API base URL from the VITE_API_URL environment variable (.env file).
 *   - Automatically attaches the JWT Bearer token to every outgoing request
 *     so individual API calls never need to worry about authentication headers.
 *   - On 401 Unauthorized responses, clears the stale token from localStorage
 *     so the Redux auth state can gracefully handle re-login.
 *
 * Usage:
 *   import api from '@/api/axiosConfig';
 *   const response = await api.get('/courses');
 */

import axios from "axios";

/* Create a pre-configured Axios instance.
   The baseURL is read from the .env file (VITE_API_URL).
   This means switching from localhost to production only requires changing the .env file. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Runs automatically before every HTTP request leaves the browser.
 * It grabs the JWT token from localStorage and attaches it as a Bearer token.
 */
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token");

    if (token) {
      /* Attach the token so the backend knows who is making the request */
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 * Runs automatically after every HTTP response arrives from the backend.
 * If the backend says 401 (token expired / invalid), we clear the stale credentials.
 * We do NOT hard-redirect to /login here — that is handled by ProtectedRoute and Redux.
 */
import toast from "react-hot-toast";

api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: unknown) => {
    const axiosError = error as import("axios").AxiosError<{
      message?: string;
      errors?: Array<{ message: string }>;
    }>;
    const response = axiosError.response;

    if (response) {
      if (response.status === 401) {
        /* Clear stale credentials so the app knows the user is no longer authenticated */
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      // Extract the valid error reason from the backend response
      let errorMessage =
        response.data?.message || "An unexpected error occurred";

      // Handle validation error arrays
      if (
        response.data?.errors &&
        Array.isArray(response.data.errors) &&
        response.data.errors.length > 0
      ) {
        errorMessage = response.data.errors
          .map((e: any) => e.message)
          .join(", ");
      }

      // Display the toast for every API failure so the user knows the valid reason
      toast.error(errorMessage);
    } else if (axiosError.request) {
      // Network error or no response
      toast.error("Network error: Unable to reach the server");
    } else {
      toast.error(axiosError.message || "An unexpected error occurred");
    }

    return Promise.reject(error);
  },
);

export default api;
