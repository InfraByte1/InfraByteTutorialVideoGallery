import React, { useCallback, useEffect, useState } from "react";
import "../Assets/Css/Homepage.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import LoginPage from "./LoginPage";
// import { useAuth } from "oidc-react";
import logo from "../Assets/images/nonon.png";
import { getAuthorizationUrl, loginUrl, oidcConfig } from "../config/config";
import Cookies from "js-cookie";
import { generateCodeChallenge, generateCodeVerifier } from "../config/pkce";
import Loading from "../Components/Loading";
import { isAuthenticatedUser } from "../services/auth";

function Homepage() {
  let navigate = useNavigate();
  // const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const isLoggedOut = location.state?.isLoggedOut || false;
  const isShared = location.state?.isShared || false;

  // if (auth.isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (auth.error) {
  //   return <div>Error: {auth.error.message}</div>;
  // }

  // if (auth.isAuthenticated) {
  //   return <div>Welcome, {auth.user.profile.name}!</div>;
  // }

  // const handleLogin = () => {
  //   setIsLoading(true);
  //   var result = auth.signIn();
  // };

  const login = async () => {
    // if (process.env.REACT_APP_ENVIRONMENT === "dev") {
    //   navigate("/callback", { state: { isLoggedOut: true } });
    //   return;
    // }
    if (process.env.REACT_APP_ENVIRONMENT === "dev") {
      navigate("/callback", { state: { isLoggedOut: true } });
    } else {
      const codeVerifier = generateCodeVerifier(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      Cookies.set("pkce_code_verifier", codeVerifier);

      window.location.href = `${getAuthorizationUrl}?client_id=${oidcConfig.clientId}&redirect_uri=${oidcConfig.redirectUri}&response_type=${oidcConfig.response_type}&scope=${oidcConfig.scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=login`;
    }
  };

  useEffect(() => {
    if (isShared) {
      // Shared video links always require a fresh login to establish a session.
      login();
      return;
    }

    if (isAuthenticatedUser()) {
      // Users arriving with a token already saved (e.g. handed off from
      // app.infrabyte.com.au via /callback or /videos?token=...) are already
      // logged in - send them straight to the videos page instead of
      // forcing them through the login screen again.
      navigate("/videos", { replace: true });
      return;
    }

    // No session yet: show the landing page. isLoggedOut is only used to
    // avoid immediately re-triggering anything special right after a
    // deliberate sign-out; a direct visitor otherwise has to click
    // "Get Started" to log in.
  }, [isShared, isLoggedOut, navigate]);

  return (
    <div className="home-container">
      <div className="home-page ">
        <div className="overlay">
          <div className="inner-container ">
            <div className="">
              <h6 className="heading1">
                Welcome to <span className="title-color">InfraByte</span> Videos
              </h6>
              <h1 className="heading2 mt-3 mb-5">
                <span>
                  <img src={logo} alt="logo" width="100" hight="100" />
                </span>{" "}
                videos are ready to play .
              </h1>

              <button
                className="button-container  mx-0"
                // onClick={handleLogin}
                onClick={login}
              >
                Get Started
              </button>
            </div>
          </div>
          <p className="poweredby">
            <strong style={{ color: "orange" }}>
              Powered by <a href="https://infrabyte.com.au/">Infrabyte</a>
            </strong>
          </p>
        </div>
      </div>
      {/* <LoginPage /> */}
      <div className={isLoading ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default Homepage;
