import React, { useEffect, useState } from "react";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import logo from "../Assets/images/nonon.png";
import { Link, redirect, useNavigate } from "react-router-dom";
import {
  getHeaders,
  isAuthenticated,
  isAuthenticatedUser,
} from "../services/auth";
import UserDropdown from "./UserDropdown";
// import { useAuth } from "oidc-react";
import { jwtDecode } from "jwt-decode";
import {
  getAuthorizationUrl,
  getJobsTutorialByTags,
  getTokenUrl,
  oidcConfig,
  tutorialUpload,
} from "../config/config";
import axios from "axios";
import { toast } from "react-toastify";
// import * as jwt_decode from "jwt-decode";

function Header() {
  let navigate = useNavigate();

  // const auth = useAuth();

  const [username, setUsername] = useState("Username");

  const [searchKeyword, setSearchKeyword] = useState("");

  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
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
    setLoading(false);
    // navigate("/", { replace: true });

    // window.location.href = "/";
  };

  const getUserName = () => {
    const userName = localStorage.getItem("userName");
    if (userName != null) {
      setUsername(userName);
    } else {
    }
  };

  useEffect(() => {
    // const item = sessionStorage.getItem(
    //   `oidc.user:${oidcConfig.authority}:react_tutorial_client`
    // );
    // console.warn(JSON.parse(item));
    // console.log(JSON.parse(item)["access_token"]);
    const item = localStorage.getItem("access_token");
    getUserName();
    if (item != null) {
      // var token = jwtDecode(JSON.parse(item)["access_token"]);
      var token = jwtDecode(item);
      // localStorage.setItem("token", JSON.parse(item)["access_token"]);

      // console.info(JSON.stringify(item["access_token"]));
      // const userName= localStorage.setItem("userName",token["http://schemas.a1gaas.com/identity/claims/name"])

      // setUsername(token["http://schemas.a1gaas.com/identity/claims/name"]);
      // var roles =
      //   token["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      // if (
      //   roles.includes("Admin") ||
      //   roles.includes("System Admin") ||
      //   roles.includes("Super Admin")
      // ) {
      //   localStorage.setItem("role", true);
      // }else{
      //   localStorage.setItem("role", false);
      // }
      // setTokenUser(item);
      // getUserName();
    } else {
      // navigate("/callback", { replace: true });
    }
  }, []);
  useEffect(() => {
    if (!isAuthenticatedUser()) {
      window.location.href = "/";
    }
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!searchKeyword) {
      toast.info("Please enter any search keyword");
      return;
    }
    setLoading(true);

    try {
      setLoading(false);
      window.location.href = `/search-result/${searchKeyword}`;
      // navigate(`/search-result/${searchKeyword}`);
    } catch (err) {
      // console.error("fetch failed:", err);
      toast.info("Error fetching data: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="nav-bottom">
      <Navbar bg="white" variant="#201f41" className="container" expand="lg">
        <Navbar.Brand as={Link} to="/videos">
          <img src={logo} alt="logo" width="100" hight="100" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* <Nav className="mx-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/">Dasboard</Nav.Link>
            <Nav.Link href="/videos">
              courses
            </Nav.Link>
          </Nav> */}
          <Nav className="mx-auto navbar-item">
            <Nav.Link as={Link} to="/videos">
              Home
            </Nav.Link>
            <Nav.Link href="/videos/web">Web</Nav.Link>
            <Nav.Link href="/videos/mobile">Mobile</Nav.Link>
          </Nav>
          <Form
            className="d-flex justify-content-end mt-2 mb-2"
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
            {loading && (
              <span>
                <div className="loading-spinner"></div>
              </span>
            )}
          </Form>

          <UserDropdown username={username} onLogout={handleLogout} />
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
export default Header;
