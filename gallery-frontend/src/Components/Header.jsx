import React, { useEffect, useState } from "react";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import logo from "../Assets/images/nonon.png";
import { redirect, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";
import UserDropdown from "./UserDropdown";
import { useAuth } from "oidc-react";
var jwt = require("jsonwebtoken");

function Header() {
  let navigate = useNavigate();

  const auth = useAuth();

  const [username,setUserName] = useState("Username");
  const token = localStorage.getItem("token");

  var link = `https://localhost:5020/connect/endsession?id_token=${token}&post_logout_redirect_uri=http://localhost:3000`;

  const handleLogout = async () => {
    localStorage.removeItem("token");

    // var res = await  auth
    // .signOut()
    //   .then(() => {})
    //   .catch((error) => {
    //     console.error("Error during signout:", error);
    //   });
    auth.signOut();
    navigate("/", { replace: true });

    window.location.href = "/";
  };

  useEffect(() => {
    // var decode1 = jwt.decode(auth.userData.access_token.toString())
    // setUserName(decode1)
  }, []);
  return (
    <div className="nav-bottom">
      <Navbar bg="white" variant="#201f41" className="container" expand="lg">
        <Navbar.Brand href="#">
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
          <Form className="d-flex justify-content-end w-100 mt-2 mb-2">
            <Form.Control
              type="text"
              placeholder="Search infrabyte videos . . . "
              className="search-container"
            />
            <Button variant=" mx-2 button-container">Search</Button>
          </Form>

          <UserDropdown username={username} onLogout={handleLogout} />
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
export default Header;
