import { useState } from "react";
import "../Assets/Css/Homepage.css";
import { useAuth } from "oidc-react";
import logo from "../Assets/images/nonon.png";

function Homepage() {
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.userData) {
    return <div>Welcome, {auth.userData.profile.name}!</div>;
  }

  const handleLogin = () => {
    setIsLoading(true);
    auth.signIn();
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
      <div className={isLoading ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default Homepage;
