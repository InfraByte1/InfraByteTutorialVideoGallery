import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Reached after the identity server's end-session redirect. auth.ts's
// logout() already clears local tokens/cookies before this page loads, so
// this is just the landing spot that sends the user back home.
const LogoutCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default LogoutCallback;
