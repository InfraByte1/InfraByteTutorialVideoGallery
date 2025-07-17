import React, { useEffect, useState } from "react";

import "../Assets/Css/Loading.css";
import { isAuthenticatedUser } from "../services/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { getTokenUrl, oidcConfig } from "../config/config";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Cookies from "js-cookie";

const Loading = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  const developmentAccess = () => {
    const accessToken =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IkYxNjgwOUM1RTY1ODQ3QjU5NTlERDdDMDQ4RTY2MzAxIiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdSIsIm5iZiI6MTc1Mjc0NTYzMSwiaWF0IjoxNzUyNzQ1NjMxLCJleHAiOjE3NTI3NDkyMzEsImF1ZCI6WyJqb2Jib29raW5nYXBpIiwiYTFpdHNpZ25hbHJhcGkiLCJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdS9yZXNvdXJjZXMiXSwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsImVtYWlsIiwiam9iYm9va2luZ2FwaSIsImExaXRzaWduYWxyYXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJpbmZyYWJ5dGVfcmVwb3J0aW5nX2NsaWVudCIsInN1YiI6IjQ2ZmI3NGM5LTFhZTUtNDYyNi1iZTdmLWU0YThjM2NiOTNkOSIsImF1dGhfdGltZSI6MTc1Mjc0NTYyOSwiaWRwIjoibG9jYWwiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOlsiQ2FyIEludmVudG9yeSIsIkFkbWluIiwiU3VwZXIgQWRtaW4iLCJJRkIwMDAwMy0wMWE5Yy1JRkIwMDAwMy0wMWE5Yy1XZWIgQXBwIEFkbWluIl0sImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2Z1bGxOYW1lIjoiTmlyYWogIExBTUEiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy91c2VyTmFtZSI6Ik5pcmFqIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZW1haWxBZGRyZXNzIjoibmlyYWpAYTFleHByZXNzY2FycmVtb3ZhbC5jb20uYXUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9kYXRlT2ZCaXJ0aCI6IjYvNS8yMDIyIDEyOjAwOjAwIEFNIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZmlyc3ROYW1lIjoiTmlyYWoiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9taWRkbGVOYW1lIjoiIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbGFzdE5hbWUiOiJMYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlTm8iOiI5ODY5MzQ0MTIxIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdGVuYW50SWQiOiI0NjJmMTdjYy00YTk3LTQyNjQtYmE1My1mZDBlMzhiZGQyM2EiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hjb2RlIjoiMTAwMDAwMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaGlkIjoiOGYxNTQ2ZDEtOWE5NS00ZjQyLTk1ZjMtOGFiZGEwMWI3MTQ1IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNobmFtZSI6IkExIFNwYXJlIFBhcnRzIFB0eSBMdGQuIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvc3Vic2NyaXB0aW9uVHlwZSI6IlBhaWQiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25FbmREYXRlIjoiMjAzMC0wNy0xNlQwNDowMDowMC4wMDAwMDAwXHUwMDJCMDA6MDAiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1N1YnNjcmlwdGlvbkFjdGl2ZSI6InRydWUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Qcm9maWxlSW1hZ2UiOiJodHRwczovL3Byb2R1Y3Rpb25hZ2Fhcy5ibG9iLmNvcmUud2luZG93cy5uZXQvYTFnYWFzLXByb2QtZHJpbGwxLzQ2MmYxN2NjLTRhOTctNDI2NC1iYTUzLWZkMGUzOGJkZDIzYS9Vc2VyLzQ2ZmI3NGM5LTFhZTUtNDYyNi1iZTdmLWU0YThjM2NiOTNkOS9Qcm9maWxlLzRhODc0ZGMyLTA3MGEtNDgwNy04Y2M5LTc4MzI1NWIzZmU5OS5wbmciLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9kZWZhdWx0VGltZVpvbmVJZCI6IkF1c3RyYWxpYS9TeWRuZXkiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJOaXJhaiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzRW1haWxWZXJpZmllZCI6IkZhbHNlIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNQaG9uZVZlcmlmaWVkIjoiVHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2NvbXBhbnlOYW1lIjoiQTEgR3JvdXAxIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvaXNPZmZzaG9yZSI6IkZhbHNlIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvb2Zmc2hvcmVCcmFuY2hJZCI6IiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0NsaWVudElkIjoiaW5mcmFieXRlX3JlcG9ydGluZ19jbGllbnQiLCJzaWQiOiIyNEY2M0Q1NTlDRUVBMDlEMDMyMURGRUE5Q0M5NzBBNyIsImp0aSI6IjY3RUQ2RjMxMURCNzZDRkVFOTZCQ0NGRUNEMUU3OTcwIn0.rk9qfnjArzxCkA8PN5Jbvk4Il8RNzfK0Fa-NC-aaZcLhzmxRlpXQ8RstDQ-pQ05BoFEtSJ6JKdOKLd02X3l4LigcJ2qMgnN9p1XYJWELZwwv4DLqjHXQxD7i4q8OlEVZxkj8IL9msxAv6kOrB_Nrsj2Ffvkmio14GPql-LP8kRSjNECvtKOoAk1Mlp1wJj9bP4mBuTfo1MBs4Uag9pHJvCz-GSqcNtpKaMx7H5jTe2BNO7KIljKDaZEkS76KndGX9qOw7Iu-uGbkpe5QxVHeKXKOfjm6eF-TglYT7UDntor8pyDfNPzFIK2M2NIZT0uOQ6eyUARo2Hsy1B8CdurF0Q";

    // Save tokens to localStorage or state management
    localStorage.setItem("access_token", accessToken);

    localStorage.setItem("token", accessToken);
    var token = jwtDecode(accessToken);
    localStorage.setItem(
      "userName",
      token["http://schemas.a1gaas.com/identity/claims/name"]
    );

    var roles =
      token["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    //if admins then true
    if (
      // roles.includes("Admin") ||
      roles.includes("System Admin") ||
      roles.includes("Super Admin")
    ) {
      localStorage.setItem("role", true);
    } else {
      localStorage.setItem("role", false);
    }
    navigate("/videos", { replace: true });
  };

  useEffect(() => {
    // setTimeout(() => {

    const code = query.get("code");
    if (code) {
      // console.log("Authorization code:", code);

      // localStorage.setItem("code", code);
      getToken(code);
    } else {
      setLoading(false);
      if (process.env.REACT_APP_ENVIRONMENT === "dev") {
        developmentAccess();
      } else {
        navigate("/", { replace: true });
      }
    }
    //  else {
    //   // const item = sessionStorage.getItem(
    //   //   `oidc.user:${oidcConfig.authority}:react_tutorial_client`
    //   // );
    //   // if (item != null) { setLoading(false);
    //   //   navigate("/videos",{replace:true});
    //   // }
    // }
    // }, 3000);
  }, [navigate]);

  const getToken = async (code) => {
    const codeVerifier = Cookies.get("pkce_code_verifier");
    // const tokenParams = new URLSearchParams();
    // tokenParams.append("grant_type", "authorization_code");
    // tokenParams.append("client_id", oidcConfig.clientId);
    // tokenParams.append("code", code);
    // tokenParams.append("redirect_uri", oidcConfig.redirectUri);
    // tokenParams.append("code_verifier", codeVerifier);

    var payload = {
      grant_type: "authorization_code",
      client_id: oidcConfig.clientId,
      // client_secret: oidcConfig.clientSecret,
      code: code,
      redirect_uri: oidcConfig.redirectUri,
      code_verifier: codeVerifier,
    };

    await axios
      .post(getTokenUrl, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        const accessToken =
          process.env.REACT_APP_ENVIRONMENT != "dev"
            ? response.data.access_token
            : "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcwNjc5RDUyNUE5NEVFNDExRjFFRDg4NUZDNzI4ODVEIiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdSIsIm5iZiI6MTcyMjU3MzQ5MywiaWF0IjoxNzIyNTczNDkzLCJleHAiOjE3MjI2MzgyOTMsImF1ZCI6WyJqb2Jib29raW5nYXBpIiwiaHR0cHM6Ly9zZWN1cml0eS5zdGFnaW5nLmluZnJhYnl0ZS5jb20uYXUvcmVzb3VyY2VzIl0sInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsImpvYmJvb2tpbmdhcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6InJlYWN0X3R1dG9yaWFsX2NsaWVudCIsInN1YiI6ImIwNmJhOWZjLTBiZjQtNGMzYi1iMTJiLWVkOTY4ODAxOThmMiIsImF1dGhfdGltZSI6MTcyMjU3MjExOCwiaWRwIjoibG9jYWwiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9mdWxsTmFtZSI6Ik5pcmFqICBMQU1BIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdXNlck5hbWUiOiJOaXJhai5MYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZmlyc3ROYW1lIjoiTmlyYWoiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9taWRkbGVOYW1lIjoiIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbGFzdE5hbWUiOiJMYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZW1haWxBZGRyZXNzIjoiaHNuc3dyc2FAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlTm8iOiI5ODY5MzQ0MTIyIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdGVuYW50SWQiOiI5MzY1OTA3OC1iOTU5LTQyMWEtOTE4NC05YTI2NDg1ZTM2M2IiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hjb2RlIjoiMTAwMDAxNCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaGlkIjoiMWRlNGY5MzMtODgzYy00ZjllLTIyMDYtMDhkYzM0ZmNhMWU3IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNobmFtZSI6Ik5ld2Nhc3RsZSBCcmFuY2giLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25UeXBlIjoiUGFpZCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL3N1YnNjcmlwdGlvbkVuZERhdGUiOiIyMDMwLTA3LTE1VDE0OjAwOjAwLjAwMDAwMDBcdTAwMkIwMDowMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzU3Vic2NyaXB0aW9uQWN0aXZlIjoidHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2RlZmF1bHRUaW1lWm9uZUlkIjoiUGFjaWZpYy9NYXJxdWVzYXMiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJJRkIwMDAwOC1jMTk0NS1Nb2JpbGUgQXBwIEFkbWluIiwiU3VwZXIgQWRtaW4iLCJJRkIwMDAwOC1jMTk0NS1JRkIwMDAwOC1jMTk0NS1XZWIgQXBwIEFkbWluIl0sImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJOaXJhai5MYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNFbWFpbFZlcmlmaWVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1Bob25lVmVyaWZpZWQiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2NvbXBhbnlOYW1lIjoiRGVtbyBDb21wYW55IDEiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9pc09mZnNob3JlIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9vZmZzaG9yZUJyYW5jaElkIjoiIiwic2lkIjoiQTNDRjE1OTkxMzRGRkY5RDc1NThFNzhFRkEzMjU1MEMiLCJqdGkiOiJCOTgyMjBDMkQyNUVCMjY1MzA1RDgwMURFM0FFREZGMyJ9.jknsYJFg6fH6jcO62PAvqNqvemyEtJqRtBZcGbcRNGXckcHmyLREhui9j-OjSBoBFtidxwGcRXRQ-KbHyQG6gBo8Nb4lq6Sq9j0iiIgvi_qzy8JBCqD2VI1PrMOrRHVDemTJekHS08veneetXSNXS0DCciI7aJNG3jgqy2o9SvrobqMImmWQdAlsuwYL8nCIr7fiubMKqGtCYG-vZVTJz6OloecdlfAvqZ2oIr6m07dzrmUj5zvoaTMg6ACTaZlc-uZJ-XTs6tLfoL2lNfigkxumCedlsk3DSS2MJHs4I_I9ET3dr7SvZ6JSJyOSQUdC3OmBs5k18zHGosK9TB-ZwQ";
        // const accessToken =
        const idToken = response.data.id_token;

        // Save tokens to localStorage or state management
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("id_token", idToken);
        localStorage.setItem("token", accessToken);
        var token = jwtDecode(accessToken);
        localStorage.setItem(
          "userName",
          token["http://schemas.a1gaas.com/identity/claims/name"]
        );

        var roles =
          token["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        //if admins then true
        if (
          // roles.includes("Admin") ||
          roles.includes("System Admin") ||
          roles.includes("Super Admin")
        ) {
          localStorage.setItem("role", true);
        } else {
          localStorage.setItem("role", false);
        }
        navigate("/videos", { replace: true });
      })
      .catch((error) => {
        setLoading(false);
        console.error(
          "Error fetching token:",
          error.response ? error.response.data : error.message
        );
      });
  };

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Please wait ...</p>
    </div>
  );
};

export default Loading;
