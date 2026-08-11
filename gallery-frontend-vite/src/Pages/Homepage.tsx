import { useState } from "react";
import "../Assets/Css/Homepage.css";
import logo from "../Assets/images/nonon.png";
import { useAuthContext } from "../context/AuthContext";

function Homepage() {
  const { isLoading, isAuthenticated, user, login } = useAuthContext();

  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <div>Welcome, {user?.name ?? user?.preferred_username}!</div>;
  }

  const handleLogin = () => {
    setIsSigningIn(true);
    login();
  };

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
                  <img src={logo} alt="logo" width="100" height="100" />
                </span>{" "}
                videos are ready to play .
              </h1>

              <button className="button-container  mx-0" onClick={handleLogin}>
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
      <div className={isSigningIn ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default Homepage;
