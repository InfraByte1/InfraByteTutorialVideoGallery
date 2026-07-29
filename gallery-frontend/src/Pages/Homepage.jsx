import React, { useCallback, useEffect, useState } from "react";
import "../Assets/Css/Homepage.css";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import LoginPage from "./LoginPage";
import { useAuth } from "oidc-react";
import logo from "../Assets/images/nonon.png";

function Homepage() {
  let navigate = useNavigate();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return <div>Welcome, {auth.user.profile.name}!</div>;
  }

  const handleLogin = () => {
    setIsLoading(true);
    var result = auth.signIn();
  };

  // useEffect(()=>{
  //   const isRedirect = ["a1mobile://a1Express.oidc.callback"].includes(window.location.href);
  //   if(isRedirect)
  //     navigate("/videos");
  // });

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
                // href={loginUrl}
                // onClick={auth.signIn}
                onClick={handleLogin}
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
