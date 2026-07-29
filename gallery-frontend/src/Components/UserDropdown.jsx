import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

import "../Assets/Css/UserDropdown.css";

const UserDropdown = ({ username, onLogout }) => {
  return (
    <Dropdown align="end" className="user-dropdown">
      <Dropdown.Toggle variant="success" id="dropdown-basic" className="dropdown-toggle-custom">
        <FaUserCircle size={24} className="user-icon" /> {username}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;