import React, { useEffect, useState } from "react";

import "../Assets/Css/Loading.css";
import { isAuthenticatedUser, saveAuthSession } from "../services/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { getTokenUrl, oidcConfig } from "../config/config";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Cookies from "js-cookie";
import { usePermissions } from "../contexts/PermissionContext";

const Loading = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const { fetchPermissions } = usePermissions();

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  const developmentAccess = () => {
    const accessToken =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5NzUzRjlBQUY3QjZBNzEzODBCNjI1NDE0QjU2OUYxIiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LmluZnJhYnl0ZS5jb20uYXUiLCJuYmYiOjE3ODc1NDIwMzIsImlhdCI6MTc4NzU0MjAzMiwiZXhwIjoxNzg3NjA2ODMyLCJhdWQiOlsiam9iYm9va2luZ2FwaSIsImExaXRzaWduYWxyYXBpIiwiaWRlbnRpdHlTZXJ2ZXJhcGkiLCJpbmZyYWJ5dGUubWNwIiwiaHR0cHM6Ly9zZWN1cml0eS5pbmZyYWJ5dGUuY29tLmF1L3Jlc291cmNlcyJdLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiZW1haWwiLCJqb2Jib29raW5nYXBpIiwiYTFpdHNpZ25hbHJhcGkiLCJpZGVudGl0eVNlcnZlcmFwaSIsImluZnJhYnl0ZS5tY3AudGVuYW50LmFkbWluIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdLCJjbGllbnRfaWQiOiJibGF6b3Jfc2VydmVyIiwic3ViIjoiNDZmYjc0YzktMWFlNS00NjI2LWJlN2YtZTRhOGMzY2I5M2Q5IiwiYXV0aF90aW1lIjoxNzg3NTQyMDMxLCJpZHAiOiJsb2NhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJDYXIgSW52ZW50b3J5IiwiQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9mdWxsTmFtZSI6Ik5pcmFqICBMQU1BIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdXNlck5hbWUiOiJOaXJhaiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2VtYWlsQWRkcmVzcyI6Im5pcmFqQGExZXhwcmVzc2NhcnJlbW92YWwuY29tLmF1IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZGF0ZU9mQmlydGgiOiI2LzUvMjAyMiAxMjowMDowMCBBTSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2ZpcnN0TmFtZSI6Ik5pcmFqIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbWlkZGxlTmFtZSI6IiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2xhc3ROYW1lIjoiTGFtYSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL21vYmlsZU5vIjoiOTg2OTM0NDEyMSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL3RlbmFudElkIjoiNDYyZjE3Y2MtNGE5Ny00MjY0LWJhNTMtZmQwZTM4YmRkMjNhIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNoY29kZSI6IjEwMDAwMDAiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hpZCI6IjhmMTU0NmQxLTlhOTUtNGY0Mi05NWYzLThhYmRhMDFiNzE0NSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaG5hbWUiOiJBMSBTcGFyZSBQYXJ0cyBQdHkgTHRkLiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzVHJhY2tMb2NhdGlvbiI6InRydWUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy90ZW5hbnRTdWJzY3JpcHRpb24iOlsiT2Zmc2hvcmUgU3Vic2NyaXB0aW9uIiwiSW5mcmFCeXRlIEZ1bGwgU3Vic2NyaXB0aW9uIiwiSW5mcmFieXRlIFJlcG9ydGluZyBGdWxsIFN1YnNjcmlwdGlvbiAiLCJJbmZyYUJ5dGUgV2ViIFNjcmFwIFlpZWxkIFBlcm1pc3Npb25zIiwiSW5mcmFCeXRlIE1vYmlsZSBZYXJkIFlpZWxkIEFzc2Vzc21lbnQgUGVybWlzaW9ucyIsIlRvdyBKb2IiXSwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvc3Vic2NyaXB0aW9uVHlwZSI6IlBhaWQiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25FbmREYXRlIjoiMjAzMC0wNS0wNVQwNjowODoyNi41NjA4MDkyXHUwMDJCMDA6MDAiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1N1YnNjcmlwdGlvbkFjdGl2ZSI6InRydWUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Qcm9maWxlSW1hZ2UiOiJodHRwczovL3Byb2R1Y3Rpb25hZ2Fhcy5ibG9iLmNvcmUud2luZG93cy5uZXQvYTFnYWFzLXByb2QvNDYyZjE3Y2MtNGE5Ny00MjY0LWJhNTMtZmQwZTM4YmRkMjNhL1VzZXIvNDZmYjc0YzktMWFlNS00NjI2LWJlN2YtZTRhOGMzY2I5M2Q5L1Byb2ZpbGUvM2VmYzNiY2MtMmY5MC00NjM4LWE2MzktMGZlM2E5MThhODNjLmpwZyIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2RlZmF1bHRUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaFRpbWVab25lSWQiOiJBdXN0cmFsaWEvU3lkbmV5IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Ik5pcmFqIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNFbWFpbFZlcmlmaWVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1Bob25lVmVyaWZpZWQiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2NvbXBhbnlOYW1lIjoiQTEgR3JvdXAxIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvaXNPZmZzaG9yZSI6IkZhbHNlIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvb2Zmc2hvcmVCcmFuY2hJZCI6IiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0NsaWVudElkIjoiYmxhem9yX3NlcnZlciIsInNpZCI6IjkxODQ5OTAyQjczMzM0QjdEQzg4MTQzREM3QTMyN0MyIiwianRpIjoiNjc5MDZEOTUwRjM1M0NENTBBMzk0MzQ1MEQxMzc2N0UifQ.yyIFpxM1Dh0ADViGVatF5fnM3p7g06L9HWyarCMx4yhXycrtkYbmzLfIkoZO6Wyvw13guugWS56lOr3wGY7EzItEGVL7TN855hNqezFABudlBmO5ogKGcRlbrjgUi949iMf1fc3ELtI0KcT4ej7NDSE_v128_UHO7uT1BW1YlxZ3GOxv69SpX32ymMj8dlrjAc820hg-ARr0USDYokeePr4NO3hQ1fBiPuAQMiXVwr6LxxRxCtTvhq67rCLDORJ622rc2syTeXPcDwufqMDuKdCzdi3IRFFO2WH56G0pch_0pdi4hNzAudwdvhQ2HGYmgRInCI_BvsTFBenosT9nDQ";

    // Save tokens to localStorage or state management
    localStorage.setItem("access_token", accessToken);

    localStorage.setItem("token", accessToken);
    var token = jwtDecode(accessToken);
    localStorage.setItem(
      "userName",
      token["http://schemas.a1gaas.com/identity/claims/name"],
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
      sessionStorage.removeItem("globalPermissions");

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
      .then(async (response) => {
        const accessToken =
          process.env.REACT_APP_ENVIRONMENT != "dev"
            ? response.data.access_token
            : "";
        // : "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcwNjc5RDUyNUE5NEVFNDExRjFFRDg4NUZDNzI4ODVEIiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdSIsIm5iZiI6MTcyMjU3MzQ5MywiaWF0IjoxNzIyNTczNDkzLCJleHAiOjE3MjI2MzgyOTMsImF1ZCI6WyJqb2Jib29raW5nYXBpIiwiaHR0cHM6Ly9zZWN1cml0eS5zdGFnaW5nLmluZnJhYnl0ZS5jb20uYXUvcmVzb3VyY2VzIl0sInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsImpvYmJvb2tpbmdhcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6InJlYWN0X3R1dG9yaWFsX2NsaWVudCIsInN1YiI6ImIwNmJhOWZjLTBiZjQtNGMzYi1iMTJiLWVkOTY4ODAxOThmMiIsImF1dGhfdGltZSI6MTcyMjU3MjExOCwiaWRwIjoibG9jYWwiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9mdWxsTmFtZSI6Ik5pcmFqICBMQU1BIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdXNlck5hbWUiOiJOaXJhai5MYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZmlyc3ROYW1lIjoiTmlyYWoiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9taWRkbGVOYW1lIjoiIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbGFzdE5hbWUiOiJMYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZW1haWxBZGRyZXNzIjoiaHNuc3dyc2FAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlTm8iOiI5ODY5MzQ0MTIyIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdGVuYW50SWQiOiI5MzY1OTA3OC1iOTU5LTQyMWEtOTE4NC05YTI2NDg1ZTM2M2IiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hjb2RlIjoiMTAwMDAxNCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaGlkIjoiMWRlNGY5MzMtODgzYy00ZjllLTIyMDYtMDhkYzM0ZmNhMWU3IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNobmFtZSI6Ik5ld2Nhc3RsZSBCcmFuY2giLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25UeXBlIjoiUGFpZCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL3N1YnNjcmlwdGlvbkVuZERhdGUiOiIyMDMwLTA3LTE1VDE0OjAwOjAwLjAwMDAwMDBcdTAwMkIwMDowMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzU3Vic2NyaXB0aW9uQWN0aXZlIjoidHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2RlZmF1bHRUaW1lWm9uZUlkIjoiUGFjaWZpYy9NYXJxdWVzYXMiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJJRkIwMDAwOC1jMTk0NS1Nb2JpbGUgQXBwIEFkbWluIiwiU3VwZXIgQWRtaW4iLCJJRkIwMDAwOC1jMTk0NS1JRkIwMDAwOC1jMTk0NS1XZWIgQXBwIEFkbWluIl0sImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJOaXJhai5MYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNFbWFpbFZlcmlmaWVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1Bob25lVmVyaWZpZWQiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2NvbXBhbnlOYW1lIjoiRGVtbyBDb21wYW55IDEiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9pc09mZnNob3JlIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9vZmZzaG9yZUJyYW5jaElkIjoiIiwic2lkIjoiQTNDRjE1OTkxMzRGRkY5RDc1NThFNzhFRkEzMjU1MEMiLCJqdGkiOiJCOTgyMjBDMkQyNUVCMjY1MzA1RDgwMURFM0FFREZGMyJ9.jknsYJFg6fH6jcO62PAvqNqvemyEtJqRtBZcGbcRNGXckcHmyLREhui9j-OjSBoBFtidxwGcRXRQ-KbHyQG6gBo8Nb4lq6Sq9j0iiIgvi_qzy8JBCqD2VI1PrMOrRHVDemTJekHS08veneetXSNXS0DCciI7aJNG3jgqy2o9SvrobqMImmWQdAlsuwYL8nCIr7fiubMKqGtCYG-vZVTJz6OloecdlfAvqZ2oIr6m07dzrmUj5zvoaTMg6ACTaZlc-uZJ-XTs6tLfoL2lNfigkxumCedlsk3DSS2MJHs4I_I9ET3dr7SvZ6JSJyOSQUdC3OmBs5k18zHGosK9TB-ZwQ";
        // const accessToken =
        const idToken = response.data.id_token;

        // Save tokens to localStorage or state management
        const token = saveAuthSession(accessToken, idToken);

        const sharedQuery = sessionStorage.getItem("shared");

        var userId = token["sub"];
        await fetchPermissions(userId);

        if (sharedQuery) {
          sessionStorage.removeItem("shared");
          navigate(`/video/${encodeURIComponent(sharedQuery)}`, {
            replace: true,
          });
        } else {
          navigate("/videos", { replace: true });
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(
          "Error fetching token:",
          error.response ? error.response.data : error.message,
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
