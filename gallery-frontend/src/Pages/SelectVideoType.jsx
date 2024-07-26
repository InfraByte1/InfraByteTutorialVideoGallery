import React, { useCallback, useEffect, useState } from "react";
import "../Assets/Css/Homepage.css";
import { useNavigate } from "react-router-dom";
import UserDropdown from "../Components/UserDropdown";
import { handleLogout, isAuthenticatedUser } from "../services/auth";
import { toast } from "react-toastify";
import { Form, Button } from "react-bootstrap";
import logo from "../Assets/images/nonon.png";

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
    window.location.href = `/videos/web`;
  };

  const openMobileVideos = async () => {
    window.location.href = `/videos/mobile`;
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
  },[]);
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
              <h1 className="heading2 mt-3 mb-3">Watch video about InfraByte web or mobile.</h1>
              <button
                className="button-container  mx-0"
                onClick={openWebVideos}
              >
                <i className="fas fa-globe"></i> {"  " }
                Web
              </button>
              <button   
                className="button-container  mx-3"
                onClick={openMobileVideos}
              ><i className="fa fa-mobile"></i> {"  " }
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
