/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: "development" | "staging" | "production";
  // Trailing slash matters: config.ts builds endpoint URLs as `${apiBaseUrl}v6/...`.
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_OIDC_AUTHORITY: string;
  readonly VITE_OIDC_CLIENT_ID: string;
  // Dev-only sign-in bypass: skips the OIDC redirect entirely when set.
  // Always supply via a gitignored .env.development.local, never committed —
  // it's a live bearer token, not a client credential.
  readonly VITE_DEV_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
