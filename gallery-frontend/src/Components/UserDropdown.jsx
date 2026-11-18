import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";

import "../Assets/Css/UserDropdown.css";
import { useNavigate } from "react-router-dom";
import { canManageVideos } from "../services/permissions";

// drop="up" is for placements at the bottom of the viewport, where a menu
// opening downward would be cut off.
const UserDropdown = ({ username, onLogout, drop = "down" }) => {
  let navigate = useNavigate();
  const [roleAdmin, setRoleAdmin] = useState(false);

  useEffect(() => {
    // Same rule the /your-video, /add/video and /edit/video pages enforce.
    setRoleAdmin(canManageVideos());
  }, []);
  return (
    <Dropdown align="end" drop={drop} className="user-dropdown">
      <Dropdown.Toggle
        variant="success"
        id="dropdown-basic"
        className="dropdown-toggle-custom"
      >
        <FaUserCircle size={24} className="user-icon" /> {username}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {roleAdmin && (
          <Dropdown.Item
            onClick={() => {
              navigate("/your-video", { replace: true });
            }}
          >
            Your videos
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;
