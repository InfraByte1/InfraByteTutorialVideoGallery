import { client_secret, env } from "../data/constants";

var authority = "http://localhost:5000";
var hostUrl = "http://localhost:5173";
var redirectUri = `${hostUrl}/callback`;
var postLogoutRedirectUri = `${hostUrl}/logout-callback`;
 var apiBaseUrl = "/baseUrl//";
 
if (env === "production") {
  apiBaseUrl = "https://api.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.infrabyte.com.au";
  authority = "https://security.infrabyte.com.au";
 } else if (env === "staging") {
  apiBaseUrl = "https://api.staging.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.staging.infrabyte.com.au";
  authority = "https://security.staging.infrabyte.com.au";
 }

redirectUri = `${hostUrl}/callback`;
postLogoutRedirectUri = `${hostUrl}/logout-callback`;

const tokenUrl = `${authority}/connect/token`;
const authorizationUrl = `${authority}/connect/authorize`;

export const oidcConfig = {
  authority: authority,
  clientId: "infrabyte_reporting_client",
  clientSecret: client_secret,
  redirectUri: redirectUri,
  postLogoutRedirectUri: postLogoutRedirectUri,
  apiBaseUrl: apiBaseUrl,
  response_type: "code",
  scope: "openid profile email jobbookingapi a1itsignalrapi offline_access",
  hostUrl: hostUrl,
  authorizationUrl: authorizationUrl,
  tokenUrl: tokenUrl,
 };
