import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Assets/Css/Loading.css";
import { useAuthContext } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionContext";

const CallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCallback, importToken } = useAuthContext();
  const { fetchPermissions } = usePermissions();

  const ranRef = useRef(false);

  useEffect(() => {
    // StrictMode double-invokes effects in dev; an authorization code can
    // only be exchanged once, so guard against firing this twice.
    if (ranRef.current) return;
    ranRef.current = true;

    const goToVideosOrSharedTarget = () => {
      const sharedQuery = sessionStorage.getItem("shared");
      if (sharedQuery) {
        sessionStorage.removeItem("shared");
        navigate(`/video/${encodeURIComponent(sharedQuery)}`, { replace: true });
      } else {
        navigate("/videos", { replace: true });
      }
    };

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state) {
      // Dev-only convenience: skip the OIDC redirect entirely if a real
      // access token was supplied via env (see vite-env.d.ts) — never a
      // hardcoded value in source.
      const devToken = import.meta.env.VITE_DEV_ACCESS_TOKEN;
      if (import.meta.env.VITE_APP_ENV === "development" && devToken && importToken(devToken)) {
        goToVideosOrSharedTarget();
      } else {
        navigate("/", { replace: true });
      }
      return;
    }

    sessionStorage.removeItem("globalPermissions");

    handleCallback(code, state).then((claims) => {
      if (!claims) {
        navigate("/", { replace: true });
        return;
      }
      fetchPermissions(claims.sub).finally(goToVideosOrSharedTarget);
    });
  }, [handleCallback, importToken, fetchPermissions, navigate, location.search]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Please wait ...</p>
    </div>
  );
};

export default CallbackPage;
