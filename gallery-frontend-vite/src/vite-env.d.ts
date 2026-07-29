/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: "development" | "staging" | "production";
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_OIDC_AUTHORITY: string;
  readonly VITE_OIDC_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
