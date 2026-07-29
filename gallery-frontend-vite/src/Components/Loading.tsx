import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Assets/Css/Loading.css";
import { setToken } from "../services/auth";

const Loading = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      const code = new URLSearchParams(location.search).get("code");
      if (code) {
        // connect/token
        setToken(code);
        navigate("/videos");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, location.search]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Please wait ...</p>
    </div>
  );
};

export default Loading;
