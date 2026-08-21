import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "./Components/Footer";
import AppRoute from "./router";
import { useAuthContext } from "./context/AuthContext";
import "./Assets/Css/HeaderFooter.css";

// Pages where an already-authenticated visitor should skip straight to the
// app instead of seeing a marketing/login screen.
const ENTRY_PAGES = ["/", "/login"];

function App() {
  const location = useLocation();
  const hideFooter = ["/", "/callback"].includes(location.pathname);

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Scoped to entry pages only — this used to fire on every route, which
    // meant an authenticated user could never stay on /videos/web,
    // /videos/your-videos, etc.: any render of App bounced them straight
    // back to /videos regardless of where they actually navigated.
    if (isAuthenticated && !isLoading && ENTRY_PAGES.includes(location.pathname)) {
      navigate("/videos");
    }
  }, [navigate, isAuthenticated, isLoading, location.pathname]);

  return (
    <>
      <ToastContainer />
      <AppRoute />
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
