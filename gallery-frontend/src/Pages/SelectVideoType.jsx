import React, { useCallback, useEffect, useState } from "react";
import "../Assets/Css/Homepage.css";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../Components/UserDropdown";
import { isAuthenticatedUser } from "../services/auth";
import { toast } from "react-toastify";
import { Form, Button } from "react-bootstrap";
import logo from "../Assets/images/nonon.png";
import { oidcConfig } from "../config/config";

function SelectVideoType() {
  let navigate = useNavigate();
  // const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("Username");
  const [searchKeyword, setSearchKeyword] = useState("");

  const getUserName = () => {
    const userName = localStorage.getItem("userName");
    if (userName != null) {
      setUsername(userName);
    } else {
    }
  };
  const openWebVideos = async () => {
    navigate(`/videos/web`);
  };

  const openMobileVideos = async () => {
    navigate(`/videos/mobile`);

    // window.location.href = `/videos/mobile`;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!searchKeyword) {
      toast.info("Please enter any search keyword");
      return;
    }
    setIsLoading(true);

    try {
      setIsLoading(false);
      window.location.href = `/search-result/${searchKeyword}`;
      // navigate(`/search-result/${searchKeyword}`);
    } catch (err) {
      // console.error("fetch failed:", err);
      toast.info("Error fetching data: " + err.message);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getUserName();
  });
  useEffect(() => {
    if (!isAuthenticatedUser()) {
      window.location.href = "/";
    }
  }, []);

  const handleLogout = async () => {
    // auth.signOut();
    // window.location.href = `${getAuthorizationUrl}?client_id=${oidcConfig.clientId}&redirect_uri=${oidcConfig.redirectUri}&response_type=${oidcConfig.response_type}&scope=${oidcConfig.scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    const idTokenFound = localStorage.getItem("id_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("token");
    const logoutUrl = `${oidcConfig.authority}/connect/endsession?id_token=${idTokenFound}&post_logout_redirect_uri=${oidcConfig.postLogoutRedirectUri}`;
    // if (idTokenFound) {

    //   window.location.href = `${oidcConfig.authority}/connect/endsession?id_token=${idTokenFound}&post_logout_redirect_uri=${oidcConfig.postLogoutRedirectUri}`;
    // } else {
    //   window.location.href = oidcConfig.postLogoutRedirectUri;
    // }
    // navigate("/", { replace: true });

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = logoutUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      document.body.removeChild(iframe);
      navigate("/", { state: { isLoggedOut: true } });
    };

    // navigate("/", { replace: true });

    // window.location.href = "/";
  };
  return (
    <div className="home-container ">
      <div className="home-page home-bg-container">
        <div className="overlay">
          <div className="inner-container ">
            <div className="">
              <h6 className="heading1 mb-2">
                Welcome to <span className="title-color">InfraByte</span> Videos
              </h6>
              <h1 className="heading2 mt-3 mb-5">
                <span>
                  <img src={logo} alt="logo" width="100" hight="100" />
                </span>{" "}
                videos are ready to play .
              </h1>
              <Form
                className="d-flex justify-content-end w-100 mt-2 mb-2"
                noValidate
                onSubmit={handleSubmit}
              >
                <Form.Control
                  type="text"
                  placeholder="Search infrabyte videos . . . "
                  className="search-container"
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                  }}
                />
                <Button type="submit" variant=" mx-2 button-container">
                  Search{" "}
                </Button>
                {isLoading && (
                  <span>
                    <div className="loading-spinner"></div>
                  </span>
                )}
              </Form>
              <h1 className="heading2 mt-3 mb-3">
                Watch video about InfraByte web or mobile.
              </h1>
              <button
                className="button-container  mx-0"
                onClick={openWebVideos}
              >
                <i className="fas fa-globe"></i> {"  "}
                Web
              </button>
              <button
                className="button-container  mx-3"
                onClick={openMobileVideos}
              >
                <i className="fa fa-mobile"></i> {"  "}
                Mobile
              </button>
            </div>
          </div>

          <p className="my-5 poweredby ">
            <UserDropdown username={username} onLogout={handleLogout} />
            {/* <strong style={{ color: "orange" }}>
              Powered by{" "}
              <a href="https://infrabyte.com.au/" style={{ color: "white" }}>
                Infrabyte
              </a>
            </strong> */}
          </p>
        </div>
      </div>
      {/* <LoginPage /> */}
      <div className={isLoading ? "loading-bar" : "d-none"}></div>
    </div>
  );
}

export default SelectVideoType;
