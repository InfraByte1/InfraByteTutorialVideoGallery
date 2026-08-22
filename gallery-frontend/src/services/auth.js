import axios from "axios";
import { getRolePermissionsByUserId, oidcConfig } from "../config/config";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Single source of truth for writing a token to storage so every entry
// point (OIDC /callback exchange, direct ?token= handoff from other apps)
// keeps access_token/token/userName/role in sync with each other.
export const saveAuthSession = (accessToken, idToken) => {
  if (!accessToken) {
    return null;
  }

  const decodedToken = jwtDecode(accessToken);

  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("token", accessToken);
  if (idToken) {
    localStorage.setItem("id_token", idToken);
  }

  localStorage.setItem(
    "userName",
    decodedToken["http://schemas.a1gaas.com/identity/claims/name"],
  );

  const roles =
    decodedToken[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] || [];
  localStorage.setItem(
    "role",
    roles.includes("System Admin") || roles.includes("Super Admin"),
  );

  // A new token means a new (possibly different) user session, so any
  // permissions cached for whoever was previously logged in must not
  // be reused.
  sessionStorage.removeItem("globalPermissions");

  return decodedToken;
};

export const isAuthenticatedUser = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  return true;
};

export const getHeaders = () => {
  var token = localStorage.getItem("token");

  var headers = {
    Authorization: `Bearer ${token}`,
    accept: "*/*",
    // Connection: "keep-alive",
    "Content-Type": "application/json; charset=utf-8",
    // "Access-Control-Allow-Origin": "https://tutorial.infrabyte.com.au",
  };
  return headers;
};

export const removeAllCookies = () => {
  const allCookies = Cookies.get();
  localStorage.clear();
  const identityServerCookies = [
    "idsrv.session",
    "idsrv",
    ".AspNetCore.Antiforgery.cdV5uW_Ejgc",
    ".AspNetCore.Identity.Application",
    "ARRAffinitySameSite",
    "ARRAffinity",
    "pkce_code_verifier",
  ];

  identityServerCookies.forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
    Cookies.remove(cookieName, { path: "/", domain: oidcConfig.hostUrl });
  });
  Object.keys(allCookies).forEach((cookieName) => {
    Cookies.remove(cookieName);
  });
};

export const getRolesPermissionsByUserId = async (userId) => {
  try {
    const response = await axios.get(getRolePermissionsByUserId(userId), {
      headers: getHeaders(),
    });
    return response.data;
  } catch (err) {
    // console.error("Failed to fetch roles and permissions:", err);
    throw err;
  }
};

// export const handleLogout = async () => {
//   // auth.signOut();
//   // window.location.href = `${getAuthorizationUrl}?client_id=${oidcConfig.clientId}&redirect_uri=${oidcConfig.redirectUri}&response_type=${oidcConfig.response_type}&scope=${oidcConfig.scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
//   const idTokenFound = localStorage.getItem("id_token");
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("id_token");
//   localStorage.removeItem("token");
//   const logoutUrl = `${oidcConfig.authority}/connect/endsession?id_token=${idTokenFound}&post_logout_redirect_uri=${oidcConfig.postLogoutRedirectUri}`;
//   // if (idTokenFound) {

//   //   window.location.href = `${oidcConfig.authority}/connect/endsession?id_token=${idTokenFound}&post_logout_redirect_uri=${oidcConfig.postLogoutRedirectUri}`;
//   // } else {
//   //   window.location.href = oidcConfig.postLogoutRedirectUri;
//   // }
//   // navigate("/", { replace: true });

//   const iframe = document.createElement("iframe");
//   iframe.style.display = "none";
//   iframe.src = logoutUrl;
//   document.body.appendChild(iframe);

//   iframe.onload = () => {
//     document.body.removeChild(iframe);
//     window.location.href = "/";
//     // navigate("/", { replace: true });
//   };

//   // navigate("/", { replace: true });

//   // window.location.href = "/";
// };
