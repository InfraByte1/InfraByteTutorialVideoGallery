import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken, refreshAccessToken, logout } from "./auth";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// In dev this hits the Vite proxy (vite.config.ts) so the browser only talks
// to same-origin localhost:3000, avoiding CORS entirely. In prod, point
// VITE_API_BASE_URL at the real API, which must send its own CORS headers.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

api.interceptors.request.use((requestConfig) => {
  const token = getToken();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

let refreshInFlight: ReturnType<typeof refreshAccessToken> | null = null;

// On a 401, try exactly one silent refresh-and-retry before giving up and
// signing the user out — avoids both an infinite retry loop and leaving the
// app stuck showing stale "authenticated" UI with a dead token.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as RetriableRequestConfig | undefined;
    if (error.response?.status !== 401 || !requestConfig || requestConfig._retried) {
      return Promise.reject(error);
    }
    requestConfig._retried = true;

    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });

    const refreshed = await refreshInFlight;
    if (!refreshed) {
      logout();
      return Promise.reject(error);
    }

    requestConfig.headers.Authorization = `Bearer ${refreshed.access_token}`;
    return api(requestConfig);
  }
);
