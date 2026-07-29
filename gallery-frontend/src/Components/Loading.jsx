import React, { useEffect, useState } from "react";

import "../Assets/Css/Loading.css";
import { isAuthenticatedUser } from "../services/auth";
import { useLocation, useNavigate } from "react-router-dom";

const Loading = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const useQuery = () => {  
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);

      const code = query.get("code");
      if (code) {
        console.log("Authorization code:", code);
        // connect/token
        localStorage.setItem("token", code);
        navigate("/videos");
        return;
      }
    }, 2000);
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Please wait ...</p>
    </div>
  );
};

export default Loading;
