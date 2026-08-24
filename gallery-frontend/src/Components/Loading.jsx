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

  const developmentAccess = async () => {
    const accessToken =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IjM3RjY5Rjg3REIzQzVEOUE2NjgzN0FGNjBERTk1QzM0IiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL3NlY3VyaXR5LnN0YWdpbmcuaW5mcmFieXRlLmNvbS5hdSIsIm5iZiI6MTc4NzU1MDMwNiwiaWF0IjoxNzg3NTUwMzA2LCJleHAiOjE3ODc2MTUxMDYsImF1ZCI6WyJqb2Jib29raW5nYXBpIiwiaHR0cHM6Ly9zZWN1cml0eS5zdGFnaW5nLmluZnJhYnl0ZS5jb20uYXUvcmVzb3VyY2VzIl0sInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJlbWFpbCIsImpvYmJvb2tpbmdhcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6ImluZnJhYnl0ZV90dXRvcmlhbF9jbGllbnQiLCJzdWIiOiI0NmZiNzRjOS0xYWU1LTQ2MjYtYmU3Zi1lNGE4YzNjYjkzZDkiLCJhdXRoX3RpbWUiOjE3ODc1NTAzMDMsImlkcCI6ImxvY2FsIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjpbIkNhciBJbnZlbnRvcnkiLCJBZG1pbiIsIlN1cGVyIEFkbWluIl0sImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2Z1bGxOYW1lIjoiTmlyYWogIExBTUEiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy91c2VyTmFtZSI6Ik5pcmFqIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZW1haWxBZGRyZXNzIjoibmlyYWpAYTFleHByZXNzY2FycmVtb3ZhbC5jb20uYXUiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9kYXRlT2ZCaXJ0aCI6IjYvNS8yMDIyIDEyOjAwOjAwIEFNIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvZmlyc3ROYW1lIjoiTmlyYWoiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9taWRkbGVOYW1lIjoiIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbGFzdE5hbWUiOiJMYW1hIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvbW9iaWxlTm8iOiIwNDMzMDQyNDY4IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvdGVuYW50SWQiOiI0NjJmMTdjYy00YTk3LTQyNjQtYmE1My1mZDBlMzhiZGQyM2EiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hjb2RlIjoiMTAwMDAwMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2JyYW5jaGlkIjoiOGYxNTQ2ZDEtOWE5NS00ZjQyLTk1ZjMtOGFiZGEwMWI3MTQ1IiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvYnJhbmNobmFtZSI6IkExIFNwYXJlIFBhcnRzIFB0eSBMdGQuIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNUcmFja0xvY2F0aW9uIjoiZmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy90ZW5hbnRTdWJzY3JpcHRpb24iOlsiSW5mcmFCeXRlIEZ1bGwgU3Vic2NyaXB0aW9uIiwiSW5mcmFieXRlIFJlcG9ydGluZyBGdWxsIFN1YnNjcmlwdGlvbiAiLCJKb2IgQm9va2luZyBUcmFja2VyIFN1YnNjcmlwdGlvbiJdLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9zdWJzY3JpcHRpb25UeXBlIjoiUGFpZCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL3N1YnNjcmlwdGlvbkVuZERhdGUiOiIyMDMwLTA1LTA1VDA2OjA4OjI2LjU2MDgwOTJcdTAwMkIwMDowMCIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzU3Vic2NyaXB0aW9uQWN0aXZlIjoidHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL1Byb2ZpbGVJbWFnZSI6Imh0dHBzOi8vaW5mcmFieXRlc3RvcmFnZXN0YWdpbmcuYmxvYi5jb3JlLndpbmRvd3MubmV0L2luZnJhYnl0ZS1zdG9yYWdlLzQ2MmYxN2NjLTRhOTctNDI2NC1iYTUzLWZkMGUzOGJkZDIzYS9Vc2VyLzQ2ZmI3NGM5LTFhZTUtNDYyNi1iZTdmLWU0YThjM2NiOTNkOS9Qcm9maWxlL2NkODA3ZmJkLTY5ZjItNGUwZi1hMWI0LTYzYThlYzFiMjA1ZC5qcGciLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9kZWZhdWx0VGltZVpvbmVJZCI6IkF1c3RyYWxpYS9TeWRuZXkiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9icmFuY2hUaW1lWm9uZUlkIjoiQXVzdHJhbGlhL1N5ZG5leSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJOaXJhaiIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL0lzRW1haWxWZXJpZmllZCI6IkZhbHNlIiwiaHR0cDovL3NjaGVtYXMuYTFnYWFzLmNvbS9pZGVudGl0eS9jbGFpbXMvSXNQaG9uZVZlcmlmaWVkIjoiRmFsc2UiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9jb21wYW55TmFtZSI6IkExIEdyb3VwMSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL2lzT2Zmc2hvcmUiOiJGYWxzZSIsImh0dHA6Ly9zY2hlbWFzLmExZ2Fhcy5jb20vaWRlbnRpdHkvY2xhaW1zL29mZnNob3JlQnJhbmNoSWQiOiIiLCJodHRwOi8vc2NoZW1hcy5hMWdhYXMuY29tL2lkZW50aXR5L2NsYWltcy9DbGllbnRJZCI6ImluZnJhYnl0ZV90dXRvcmlhbF9jbGllbnQiLCJzaWQiOiJBNTg4NDdFRDdBOENFRUI5OEU4MzNCREY2RjZEMTI1QSIsImp0aSI6IjM1MzNCOTI2OTY4OTFBNjVFNDVGMDlGRDBFQzlGQzcxIn0.IGxLEc-hWBJJklQOXDfhnstubOVZaeQ8ij8NxaVdTOSEjGaEl6rWWldKyKIa3XROHu4-LFl7jz2_DJj4Fn1NHvCqEXYPzn533f7EJtbhzW6asaJHJVBemnjJEQ6vlW-90UXNBNG_zvxyhpifo3tTLiO7t6Z8a2gUKc_3itK5sZoqqKIbVvVeT_hUl3evXJgCivf6Ft6UDwsJp3eE6XmUTS7CSHYGoUN7ryveUlByWzomLwgdYG4E4Q89UGkwdVI6PR1m8wERXREq2IyGmOJ3sgI9BtWRTJ-d0R43nEE385uFiGE8ofvqcF4H68910dLYrP3vY2b7cS3RaqPYsu7RoA";

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

    // This bypass sets localStorage directly instead of going through
    // saveAuthSession(), which would normally clear any permissions cached
    // for a previous session's user - do that here too, otherwise a stale
    // cache from a different user could get reused for this token.
    sessionStorage.removeItem("globalPermissions");

    // PermissionProvider's own mount effect already ran once, before this
    // token existed (this route is reached via client-side navigate(), not
    // a full page reload), so it never picks this token up on its own -
    // fetch permissions explicitly here, same as the real OIDC getToken()
    // flow below does.
    await fetchPermissions(token["sub"]);

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
        const accessToken = response.data.access_token;
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
