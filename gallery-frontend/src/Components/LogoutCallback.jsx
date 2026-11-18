import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearLocalSession } from "../services/session";

const LogoutCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearLocalSession();
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
