import { useState } from "react";
import { Navbar, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "oidc-react";
import logo from "../Assets/images/nonon.png";
import { clearToken } from "../services/auth";
import UserDropdown from "./UserDropdown";

function Header() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [username] = useState("Username");

  const handleLogout = () => {
    clearToken();
    auth.signOut();
    navigate("/", { replace: true });
    window.location.href = "/";
  };

  return (
    <div className="nav-bottom">
      <Navbar bg="white" variant="light" className="container" expand="lg">
        <Navbar.Brand href="#">
          <img src={logo} alt="logo" width="100" height="100" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
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
