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

function Homepage() {
  let navigate = useNavigate();
  // const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const isLoggedOut = location.state?.isLoggedOut || false;

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
    const codeVerifier = generateCodeVerifier(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    Cookies.set("pkce_code_verifier", codeVerifier);

    window.location.href = `${getAuthorizationUrl}?client_id=${oidcConfig.clientId}&redirect_uri=${oidcConfig.redirectUri}&response_type=${oidcConfig.response_type}&scope=${oidcConfig.scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  };

  useEffect(() => {
    if (document.referrer === "") {
    } else {
      if (isLoggedOut) {
      } else {
        login();
      }
    }
  }, []);

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
          <p className="my-5 poweredby ">
            <strong style={{ color: "orange" }}>
              Powered by{" "}
              <a href="https://infrabyte.com.au/" style={{ color: "white" }}>
                Infrabyte
              </a>
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
