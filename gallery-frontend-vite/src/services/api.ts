import axios from "axios";
import { getToken } from "./auth";

// In dev this hits the Vite proxy (vite.config.ts) so the browser only talks
// to same-origin localhost:3000, avoiding CORS entirely. In prod, point
// VITE_API_BASE_URL at the real API, which must send its own CORS headers.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
