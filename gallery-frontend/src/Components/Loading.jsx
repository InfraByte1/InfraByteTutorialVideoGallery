import React, { useEffect, useState } from "react";

import "../Assets/Css/Loading.css";
import { isAuthenticatedUser } from "../services/auth";
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
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIxNTFGQTE5NDQ0MTQ1RDUzQUQzQ0Y4MURDN0REOTU3IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdSIsIm5iZiI6MTc3MDYwNTczMywiaWF0IjoxNzcwNjA1NzMzLCJleHAiOjE3NzA2NzA1MzMsImF1ZCI6WyJqb2Jib29raW5nYXBpIiwiaHR0cHM6Ly9zZWN1cml0eS5zdGFnaW5nLmluZnJhYnl0ZS5jb20uYXUvcmVzb3VyY2VzIl0sInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsImpvYmJvb2tpbmdhcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6ImluZnJhYnl0ZV90dXRvcmlhbF9jbGllbnQiLCJzdWIiOiI4NWMzYmYyZi0yNTY0LTRiMDItYTQ1ZC01ODYzYzg1MDViMjciLCJhdXRoX3RpbWUiOjE3NzA2MDU3MzEsImlkcCI6ImxvY2FsIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNobmFtZSI6Ik5ld2Nhc3RsZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaGNvZGUiOiIxMDAwMTA1IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZnVsbE5hbWUiOiJSYWdlbiBtaWQgTUFIQVJKQU4iLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy91c2VyTmFtZSI6InJhZ2VubWFoIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZmlyc3ROYW1lIjoiUmFnZW4iLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9taWRkbGVOYW1lIjoibWlkIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbGFzdE5hbWUiOiJNYWhhcmphbiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2VtYWlsQWRkcmVzcyI6InJhZ2VubWFoOTlAZ21haWwuY29tIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlTm8iOiIwMjQzMzMzMzMzIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNoaWQiOiI5MGY3MzU5MS04N2EyLTRjYTAtMjg3MS0wOGRlMTUzYzE4NmYiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy90ZW5hbnRJZCI6ImUwOGM3Njg3LWViZDAtNDY1Mi1hMWZmLWE4YWI2NTU3ZjM2YiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzVHJhY2tMb2NhdGlvbiI6InRydWUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy90ZW5hbnRTdWJzY3JpcHRpb24iOiJJbmZyYUJ5dGUgRnVsbCBTdWJzY3JpcHRpb24iLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25UeXBlIjoiUGFpZCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL3N1YnNjcmlwdGlvbkVuZERhdGUiOiIyMDMwLTA5LTI2VDA0OjAwOjAwLjAwMDAwMDBcdTAwMkIwMDowMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzU3Vic2NyaXB0aW9uQWN0aXZlIjoidHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL1Byb2ZpbGVJbWFnZSI6Imh0dHBzOi8vcHJvZHVjdGlvbmFnYWFzLmJsb2IuY29yZS53aW5kb3dzLm5ldC9hMWdhYXMtcHJvZC1kcmlsbDEvZTA4Yzc2ODctZWJkMC00NjUyLWExZmYtYThhYjY1NTdmMzZiL1VzZXIvODVjM2JmMmYtMjU2NC00YjAyLWE0NWQtNTg2M2M4NTA1YjI3L1Byb2ZpbGUvMGZlNmM4MjMtMTFhMC00OTFiLWE5ZjYtMjExNjlmYjc0MzQ5LmpwZyIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2RlZmF1bHRUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaFRpbWVab25lSWQiOiJBdXN0cmFsaWEvU3lkbmV5IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjpbIklGQjAwMTE0LWQ3MGFhLU1vYmlsZSBGdWxsIFBlcm1pc3Npb24iLCJJRkIwMDExNC1kNzBhYS1XZWIgZnVsbCBQZXJtaXNzaW9uIl0sImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJyYWdlbm1haCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzRW1haWxWZXJpZmllZCI6IlRydWUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9Jc1Bob25lVmVyaWZpZWQiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2NvbXBhbnlOYW1lIjoiVGVzdCBJbmZyYWJ5dGUgRGVtbyIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2lzT2Zmc2hvcmUiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL29mZnNob3JlQnJhbmNoSWQiOiIiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9DbGllbnRJZCI6ImluZnJhYnl0ZV90dXRvcmlhbF9jbGllbnQiLCJzaWQiOiIwQzI4QzM5OTFGMEIzNEM2QkFBMzRFOTQyQTVFRUY5RCIsImp0aSI6IjU5MTcxNEZCQjY4NTdFQ0Q5NTM5NTFENTI1NTJFMEFFIn0.W7MYmG1TuotPQPgpCsP-gtE212cv4CCBjSXlF5wOqsdseoFtRf3binahPN3sy428jwQImAkY2KfAGRcvgwAXqBH_2k_YhuB5X2j1_mHVNsA1w7dUV4LJ4Fo5WdOkENhS4NU33lEZK6s8KRwBzBTXCioRd3IMRObPZptnMMO8N0s6isFUgYH4e_OrW-AZj5IvYY5QMZn0bxzvqnl3-XbPdMGoK7aKOjU7mokvaVQWuro7MP2kn1F24NoI0KSATbG615sjlwn4LEUi-OWzTTMvx_6zkiFzpMmHLYegVUtOAneCimrk20hClGhMUh2N0-9VCXwF07vD-fhaq83t3kUsxA";

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
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("id_token", idToken);
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
