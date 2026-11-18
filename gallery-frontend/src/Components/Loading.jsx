import React, { useEffect, useState } from "react";

import "../Assets/Css/Loading.css";
import { isAuthenticatedUser, saveAuthSession } from "../services/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { getTokenUrl, oidcConfig } from "../config/config";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Cookies from "js-cookie";
import { usePermissions } from "../contexts/PermissionContext";
import { isTokenExpired } from "../services/devAuth";

const Loading = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const { fetchPermissions } = usePermissions();

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  const developmentAccess = async () => {
    const accessToken = localStorage.getItem("access_token");

    // Local development only. The token is pasted by the developer on the
    // landing page ("Get Started"); nothing is stored in source code.
    if (!accessToken || isTokenExpired(accessToken)) {
      navigate("/", { replace: true });
      return;
    }

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
