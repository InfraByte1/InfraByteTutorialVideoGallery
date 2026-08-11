import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { config, getRolePermissionsByUserId, getTokenUrl, getEndSessionUrl } from "../config/config";

const ACCESS_TOKEN_KEY = "access_token";
const ID_TOKEN_KEY = "id_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TOKEN_EXPIRES_AT_KEY = "token_expires_at";
const PKCE_VERIFIER_COOKIE = "pkce_code_verifier";
const OAUTH_STATE_COOKIE = "oauth_state";

export interface TokenResponse {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

// The identity server issues its own custom claim URIs rather than the
// generic OIDC ones (name/preferred_username/etc. are absent in practice) —
// named constants since these long schema URIs are easy to typo. These two
// are the ones actually read anywhere in the app's source.
export const CLAIM_NAME = "http://schemas.a1gaas.com/identity/claims/name" as const;
export const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" as const;

export interface IdTokenClaims {
  sub: string;
  exp: number;
  // Generic OIDC claims, kept in case a different client/scope config
  // ever does populate them.
  name?: string;
  given_name?: string;
  preferred_username?: string;
  email?: string;
  [claim: string]: unknown;
}

export const getUserDisplayName = (claims: IdTokenClaims | null): string => {
  if (!claims) return "Username";
  const customName = claims[CLAIM_NAME];
  return (typeof customName === "string" && customName) || claims.name || claims.preferred_username || "Username";
};

export const getUserRoles = (claims: IdTokenClaims | null): string[] => {
  const role = claims?.[CLAIM_ROLE];
  if (Array.isArray(role)) return role.filter((r): r is string => typeof r === "string");
  if (typeof role === "string") return [role];
  return [];
};

export const isAdminUser = (claims: IdTokenClaims | null): boolean => {
  const roles = getUserRoles(claims);
  return roles.includes("System Admin") || roles.includes("Super Admin");
};

export const getToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getIdToken = (): string | null => localStorage.getItem(ID_TOKEN_KEY);

const isExpired = (): boolean => {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  if (!expiresAt) return true;
  return Date.now() >= Number(expiresAt);
};

export const isAuthenticatedUser = (): boolean => getToken() !== null && !isExpired();

export const getUserClaims = (): IdTokenClaims | null => {
  // Falls back to the access token when there's no id_token — that's the
  // case for a token handed in via importAccessToken(), which never goes
  // through the OIDC code exchange.
  const token = getIdToken() ?? getToken();
  if (!token) return null;
  try {
    return jwtDecode<IdTokenClaims>(token);
  } catch {
    return null;
  }
};

export const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  accept: "*/*",
  "Content-Type": "application/json; charset=utf-8",
});

const persistTokens = (tokens: TokenResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + tokens.expires_in * 1000));
  if (tokens.id_token) localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
  if (tokens.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
};

// Short-lived, cleared right after the callback consumes them — only ever
// needed for the few seconds of the redirect round-trip.
export const savePkceState = (codeVerifier: string, state: string) => {
  const cookieOpts = { path: "/", sameSite: "lax" as const, secure: window.location.protocol === "https:", expires: 1 / 288 };
  Cookies.set(PKCE_VERIFIER_COOKIE, codeVerifier, cookieOpts);
  Cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
};

export const consumePkceState = (): { codeVerifier: string | undefined; state: string | undefined } => {
  const codeVerifier = Cookies.get(PKCE_VERIFIER_COOKIE);
  const state = Cookies.get(OAUTH_STATE_COOKIE);
  Cookies.remove(PKCE_VERIFIER_COOKIE, { path: "/" });
  Cookies.remove(OAUTH_STATE_COOKIE, { path: "/" });
  return { codeVerifier, state };
};

export const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<TokenResponse> => {
  // Pure PKCE — no client_secret. This is a public client; the code_verifier
  // is what proves possession of the original authorization request.
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: codeVerifier,
  });

  const response = await axios.post<TokenResponse>(getTokenUrl, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  persistTokens(response.data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<TokenResponse | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
  });

  try {
    const response = await axios.post<TokenResponse>(getTokenUrl, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    persistTokens(response.data);
    return response.data;
  } catch {
    clearTokens();
    return null;
  }
};

// Mirrors the identity-server-issued cookies the app never set itself but
// needs to clear on logout so a fresh sign-in doesn't silently reuse an old
// SSO session at the identity server.
const IDENTITY_SERVER_COOKIES = [
  "idsrv.session",
  "idsrv",
  ".AspNetCore.Antiforgery.cdV5uW_Ejgc",
  ".AspNetCore.Identity.Application",
  "ARRAffinitySameSite",
  "ARRAffinity",
  PKCE_VERIFIER_COOKIE,
];

export const removeAllCookies = () => {
  clearTokens();
  localStorage.clear();

  const allCookies = Cookies.get();
  IDENTITY_SERVER_COOKIES.forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
    Cookies.remove(cookieName, { path: "/", domain: config.hostUrl });
  });
  Object.keys(allCookies).forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
  });
};

// Silent front-channel logout: hits the identity server's end-session
// endpoint from a hidden iframe so its SSO cookie is cleared without a
// visible redirect, then sends the user home.
export const logout = () => {
  const idToken = getIdToken();
  const logoutUrl = `${getEndSessionUrl}?id_token=${idToken}&post_logout_redirect_uri=${encodeURIComponent(config.postLogoutRedirectUri)}`;

  removeAllCookies();

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = logoutUrl;
  document.body.appendChild(iframe);

  const goHome = () => {
    document.body.removeChild(iframe);
    window.location.href = "/";
  };
  iframe.onload = goHome;
  setTimeout(goHome, 3000);
};

// Accepts an access token handed in directly (e.g. a ?token= query param
// from an embedding native app), bypassing the OIDC code exchange entirely.
// Decodes its own exp claim rather than trusting a caller-supplied TTL, so
// isAuthenticatedUser()'s expiry check (which relies on TOKEN_EXPIRES_AT_KEY
// being set) doesn't immediately treat it as expired.
export const importAccessToken = (accessToken: string): boolean => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(accessToken);
    const expiresInMs = exp * 1000 - Date.now();
    if (expiresInMs <= 0) return false;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + expiresInMs));
    return true;
  } catch {
    return false;
  }
};

export const getRolesPermissionsByUserId = async (userId: string) => {
  const response = await axios.get(getRolePermissionsByUserId(userId), {
    headers: getHeaders(),
  });
  return response.data;
};
