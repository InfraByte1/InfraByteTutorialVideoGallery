import { useState, type FormEvent } from "react";
import { Navbar, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../Assets/images/nonon.png";
import { useAuthContext } from "../context/AuthContext";
import { getUserDisplayName } from "../services/auth";
import UserDropdown from "./UserDropdown";

function Header() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const username = getUserDisplayName(user);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (term) {
      navigate(`/search-result/${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="nav-bottom">
      <Navbar bg="white" variant="light" className="container" expand="lg">
        <Navbar.Brand href="#">
          <img src={logo} alt="logo" width="170" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Form className="d-flex justify-content-end w-100 mt-2 mb-2" onSubmit={handleSearch}>
            <Form.Control
              type="text"
              placeholder="Search infrabyte videos . . . "
              className="search-container"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" variant=" mx-2 button-container">
              Search
            </Button>
          </Form>

          <UserDropdown username={username} onLogout={logout} />
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
export default Header;
