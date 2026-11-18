import React, { useEffect, useState } from "react";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import { FiSearch } from "react-icons/fi";
import logo from "../Assets/images/nonon.png";
import { Link, NavLink, redirect, useNavigate } from "react-router-dom";
import {
  getHeaders,
  isAuthenticated,
  isAuthenticatedUser,
} from "../services/auth";
import UserDropdown from "./UserDropdown";
import SettingsMenu from "./SettingsMenu";
import { signOut } from "../services/session";
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
import Cookies from "js-cookie";

function Header() {
  let navigate = useNavigate();

  // const auth = useAuth();

  const [username, setUsername] = useState("Username");

  const [searchKeyword, setSearchKeyword] = useState("");

  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    signOut();
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
      <Navbar className="container" expand="xl">
        <Navbar.Brand as={Link} to="/videos">
          <img src={logo} alt="InfraByte" />
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
          <Nav className="navbar-item ms-xl-4">
            <Nav.Link as={NavLink} to="/videos" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/videos/web">
              Web
            </Nav.Link>
            <Nav.Link as={NavLink} to="/videos/mobile">
              Mobile
            </Nav.Link>
          </Nav>
          <div className="navbar-right-group d-flex align-items-center ms-xl-auto">
            <Form className="nav-search" noValidate onSubmit={handleSubmit}>
              <FiSearch className="nav-search-icon" aria-hidden="true" />
              <Form.Control
                type="text"
                placeholder="Search InfraByte videos"
                aria-label="Search videos"
                className="nav-search-input"
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                }}
              />
              <Button type="submit" variant="" className="nav-search-btn">
                Search
              </Button>
              {loading && (
                <span>
                  <div className="loading-spinner"></div>
                </span>
              )}
            </Form>

            <SettingsMenu />
            <UserDropdown username={username} onLogout={handleLogout} />
          </div>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
export default Header;
