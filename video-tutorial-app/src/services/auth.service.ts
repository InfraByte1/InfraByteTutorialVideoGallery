import axios from "axios";
import { oidcConfig } from "../config/config";
import { generateCodeChallenge, generateCodeVerifier } from "../config/pkce";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { env, STORAGE_KEY } from "../data/constants";
import { getAccessToken, http } from "./api.service";

export const getAuthorizationUrl = async (): Promise<string> => {
  const codeVerifier = generateCodeVerifier(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  Cookies.set("pkce_code_verifier", codeVerifier);

  const url = new URL(oidcConfig.authorizationUrl);
  url.searchParams.set("client_id", oidcConfig.clientId);
  url.searchParams.set("redirect_uri", oidcConfig.redirectUri);
  url.searchParams.set("response_type", oidcConfig.response_type);
  url.searchParams.set("scope", oidcConfig.scope);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "login");

  return url.toString();
};

export const login = async (): Promise<void> => {
  const url = await getAuthorizationUrl();
  window.location.href = url;
};

// export const logout = async (): Promise<void> => {
//   const idTokenFound = localStorage.getItem("id_token");
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("id_token");
//   localStorage.removeItem("token");
//   const logoutUrl = `${oidcConfig.authority}/connect/endsession?id_token=${idTokenFound}&post_logout_redirect_uri=${oidcConfig.postLogoutRedirectUri}`;

//   window.location.href = logoutUrl;
// };

export const logout = async (): Promise<void> => {
  try {
    // --- 1. Clear localStorage/sessionStorage ---
    localStorage.clear();
    sessionStorage.clear();

    // --- 2. Clear cookies for current domain ---
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      // clear cookie for current domain + possible subpaths
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    }

    // --- 3. Clear application cache if available (optional) ---
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // --- 4. Trigger OIDC logout redirect ---
    const idTokenFound = localStorage.getItem("id_token");
    const logoutUrl = `${oidcConfig.authority}/connect/endsession?id_token=${idTokenFound}&post_logout_redirect_uri=${oidcConfig.postLogoutRedirectUri}`;
    // Wait briefly for UI update, then redirect to IdP logout
    setTimeout(() => {
      window.location.href = logoutUrl;
    }, 300);
    // Optional: show local logout page first
    window.location.replace("/logout-callback");
  } catch (err) {
    // console.error("Logout cleanup failed:", err);
    window.location.replace("/logout-callback");
  }
};

interface TokenResponse {
  access_token: string;
  id_token: string;
}

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export const getToken = async (code: String): Promise<void> => {
  try {
    const codeVerifier = Cookies.get("pkce_code_verifier");

    var payload = {
      grant_type: "authorization_code",
      client_id: oidcConfig.clientId,
      // client_secret: oidcConfig.clientSecret,
      code: code,
      redirect_uri: oidcConfig.redirectUri,
      code_verifier: codeVerifier,
    };

    const response = await axios.post<TokenResponse>(
      oidcConfig.tokenUrl,
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken =
      env != "dev"
        ? response.data.access_token
        : "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcwNjc5RDUyNUE5NEVFNDExRjFFRDg4NUZDNzI4ODVEIiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdSIsIm5iZiI6MTcyMjU3MzQ5MywiaWF0IjoxNzIyNTczNDkzLCJleHAiOjE3MjI2MzgyOTMsImF1ZCI6WyJqb2Jib29raW5nYXBpIiwiaHR0cHM6Ly9zZWN1cml0eS5zdGFnaW5nLmluZnJhYnl0ZS5jb20uYXUvcmVzb3VyY2VzIl0sInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsImpvYmJvb2tpbmdhcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6InJlYWN0X3R1dG9yaWFsX2NsaWVudCIsInN1YiI6ImIwNmJhOWZjLTBiZjQtNGMzYi1iMTJiLWVkOTY4ODAxOThmMiIsImF1dGhfdGltZSI6MTcyMjU3MjExOCwiaWRwIjoibG9jYWwiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9mdWxsTmFtZSI6Ik5pcmFqICBMQU1BIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdXNlck5hbWUiOiJOaXJhai5MYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZmlyc3ROYW1lIjoiTmlyYWoiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9taWRkbGVOYW1lIjoiIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbGFzdE5hbWUiOiJMYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZW1haWxBZGRyZXNzIjoiaHNuc3dyc2FAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlTm8iOiI5ODY5MzQ0MTIyIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdGVuYW50SWQiOiI5MzY1OTA3OC1iOTU5LTQyMWEtOTE4NC05YTI2NDg1ZTM2M2IiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hjb2RlIjoiMTAwMDAxNCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaGlkIjoiMWRlNGY5MzMtODgzYy00ZjllLTIyMDYtMDhkYzM0ZmNhMWU3IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNobmFtZSI6Ik5ld2Nhc3RsZSBCcmFuY2giLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25UeXBlIjoiUGFpZCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL3N1YnNjcmlwdGlvbkVuZERhdGUiOiIyMDMwLTA3LTE1VDE0OjAwOjAwLjAwMDAwMDBcdTAwMkIwMDowMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzU3Vic2NyaXB0aW9uQWN0aXZlIjoidHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2RlZmF1bHRUaW1lWm9uZUlkIjoiUGFjaWZpYy9NYXJxdWVzYXMiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJJRkIwMDAwOC1jMTk0NS1Nb2JpbGUgQXBwIEFkbWluIiwiU3VwZXIgQWRtaW4iLCJJRkIwMDAwOC1jMTk0NS1JRkIwMDAwOC1jMTk0NS1XZWIgQXBwIEFkbWluIl0sImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJOaXJhai5MYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNFbWFpbFZlcmlmaWVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1Bob25lVmVyaWZpZWQiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2NvbXBhbnlOYW1lIjoiRGVtbyBDb21wYW55IDEiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9pc09mZnNob3JlIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9vZmZzaG9yZUJyYW5jaElkIjoiIiwic2lkIjoiQTNDRjE1OTkxMzRGRkY5RDc1NThFNzhFRkEzMjU1MEMiLCJqdGkiOiJCOTgyMjBDMkQyNUVCMjY1MzA1RDgwMURFM0FFREZGMyJ9.jknsYJFg6fH6jcO62PAvqNqvemyEtJqRtBZcGbcRNGXckcHmyLREhui9j-OjSBoBFtidxwGcRXRQ-KbHyQG6gBo8Nb4lq6Sq9j0iiIgvi_qzy8JBCqD2VI1PrMOrRHVDemTJekHS08veneetXSNXS0DCciI7aJNG3jgqy2o9SvrobqMImmWQdAlsuwYL8nCIr7fiubMKqGtCYG-vZVTJz6OloecdlfAvqZ2oIr6m07dzrmUj5zvoaTMg6ACTaZlc-uZJ-XTs6tLfoL2lNfigkxumCedlsk3DSS2MJHs4I_I9ET3dr7SvZ6JSJyOSQUdC3OmBs5k18zHGosK9TB-ZwQ";

    const idToken = response.data.id_token;

    localStorage.setItem(STORAGE_KEY, accessToken);
    localStorage.setItem("id_token", idToken);
  } catch (error: any) {
    console.error(
      "Error fetching token:",
      error.response?.data || error.message
    );
  }
};

// export const getRolesPermissionsByUserId = async (userId: String) => {
//   try {
//     const response = await http.get(
//       `/v6/Accounts/GetRolePermissionsByUserId/${userId}`
//     );
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };

export const getRolesPermissionsByUserId = async (userId: String) => {
  return await http.get(`/v6/Accounts/GetRolePermissionsByUserId/${userId}`);
};

export const getPermissionsBySubscription = async (subscription: String) => {
  return await http.get(
    `/v6/Accounts/GetPermissionsBySubscription/${subscription}`
  );
};

export const getUserName = () => {
  var accessToken = getAccessToken();
  const decoded: JwtPayload = jwtDecode(accessToken ?? "");
  const userName = decoded["http://schemas.a1gaas.com/identity/claims/name"];

  return userName;
};

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      console.warn("Token has no 'exp' field");
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (e) {
    console.error("Failed to decode token", e);
    return true;
  }
}
