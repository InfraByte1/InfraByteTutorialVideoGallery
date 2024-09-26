import { oidcConfig } from "../config/config";
import Cookies from "js-cookie";

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
