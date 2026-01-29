import React from "react";
import { useNavigate } from "react-router-dom";
import notFoundImage from "../assets/images/404.webp";
import "../assets/css/NotFound.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <img
          src={notFoundImage}
          alt="Page Not Found"
          className="notfound-image"
          draggable={false}
        />

        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtitle">
          Sorry, the page you visited does not exist.
        </p>

        <button className="notfound-button" onClick={() => navigate("/")}>
          Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
