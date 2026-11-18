import React, { useCallback, useEffect, useState } from "react";
import "../Assets/Css/Homepage.css";
import "../Assets/Css/Landing.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiMonitor,
  FiPlay,
  FiPlayCircle,
  FiSearch,
} from "react-icons/fi";
import LoginPage from "./LoginPage";
// import { useAuth } from "oidc-react";
import logo from "../Assets/images/nonon.png";
import { getAuthorizationUrl, loginUrl, oidcConfig } from "../config/config";
import Cookies from "js-cookie";
import { generateCodeChallenge, generateCodeVerifier } from "../config/pkce";
import Loading from "../Components/Loading";
import { isAuthenticatedUser } from "../services/auth";
import { getDevAccessToken } from "../services/devAuth";
import { toast } from "react-toastify";

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

  const login = async ({ interactive = true } = {}) => {
    if (process.env.REACT_APP_ENVIRONMENT === "dev") {
      // Local development: reuse a valid stored token or ask for one to paste
      // (same as the reporting portal). Nothing is hard-coded.
      const token = getDevAccessToken({ interactive });
      if (token) {
        localStorage.setItem("access_token", token);
        navigate("/callback", { state: { isLoggedOut: true } });
      } else if (interactive) {
        toast.info("No valid access token provided.");
      }
    } else {
      const codeVerifier = generateCodeVerifier(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      Cookies.set("pkce_code_verifier", codeVerifier, {
        // secure requires HTTPS - only enable it when actually served over
        // HTTPS, otherwise the cookie would silently fail to be set on
        // local http:// dev and break the login flow entirely.
        secure: window.location.protocol === "https:",
        // "lax" (not "strict") because this cookie must still be sent when
        // the identity server redirects the browser back to /callback -
        // that's a top-level cross-site navigation, which "strict" blocks.
        sameSite: "lax",
        // PKCE verifiers are meant to be single-use and short-lived.
        expires: new Date(Date.now() + 10 * 60 * 1000),
      });

      window.location.href = `${getAuthorizationUrl}?client_id=${oidcConfig.clientId}&redirect_uri=${oidcConfig.redirectUri}&response_type=${oidcConfig.response_type}&scope=${oidcConfig.scope}&code_challenge=${codeChallenge}&code_challenge_method=S256&prompt=login`;
    }
  };

  useEffect(() => {
    if (isShared) {
      // Shared video links always require a fresh login to establish a session.
      // (Never prompt here: effects run twice in StrictMode.)
      login({ interactive: false });
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
    <div className="landing">
      <div className="landing-topbar">
        <span className="landing-logo">
          <img src={logo} alt="InfraByte" />
        </span>
      </div>

      <main className="landing-main">
        <section className="landing-content">
          <span className="landing-eyebrow">Tutorial Video Gallery</span>
          <h1 className="landing-title">
            Welcome to <span className="landing-title-accent">InfraByte</span>{" "}
            Videos
          </h1>
          <p className="landing-subtitle">
            Your tutorials are ready to play. Sign in to browse the library,
            pick up where you left off and learn at your own pace.
          </p>

          <button type="button" className="landing-cta" onClick={() => login()}>
            Get Started
            <FiArrowRight size={20} aria-hidden="true" />
          </button>

          <ul className="landing-features">
            <li className="landing-feature">
              <FiPlayCircle size={16} aria-hidden="true" />
              Step-by-step tutorials
            </li>
            <li className="landing-feature">
              <FiMonitor size={16} aria-hidden="true" />
              Watch on any device
            </li>
            <li className="landing-feature">
              <FiSearch size={16} aria-hidden="true" />
              Search by topic
            </li>
          </ul>
        </section>

        <div className="landing-preview" aria-hidden="true">
          <div className="landing-preview-card">
            <div className="landing-preview-screen">
              <span className="landing-play">
                <FiPlay size={28} />
              </span>
            </div>
            <div className="landing-preview-bar">
              <span />
            </div>
            <div className="landing-preview-lines">
              <span />
              <span />
            </div>
          </div>
        </div>
      </main>

      <div className="landing-footer">
        <span>Powered by</span>
        <a
          className="landing-footer-link"
          href="https://infrabyte.com.au/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Powered by InfraByte"
        >
          <img src={logo} alt="InfraByte" />
        </a>
      </div>

      {/* <LoginPage /> */}
      <div className={isLoading ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default Homepage;
