import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogoutCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("token");

    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Logging out ...</p>
    </div>
  );
};

export default LogoutCallback;
