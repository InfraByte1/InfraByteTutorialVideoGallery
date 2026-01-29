import axios from "axios";
import { STORAGE_KEY } from "../data/constants";
import { oidcConfig } from "../config/config";
import { globalMessageApi } from "../contexts/MessageContext";

export const getAccessToken = () => {
  const tokenElement = localStorage.getItem(STORAGE_KEY);
  return tokenElement;
};

export const http = axios.create({
  baseURL: oidcConfig.apiBaseUrl,
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": oidcConfig.hostUrl,
  },
});

http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirecting = false;

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;

      globalMessageApi.error("Session expired. Redirecting to homepage...");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }

    return Promise.reject(error);
  }
);
