import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "./Components/Footer";
import AppRoute from "./router";
import { useAuthContext } from "./context/AuthContext";
import "./Assets/Css/HeaderFooter.css";

function App() {
  const hideFooter = ["/", "/callback"].includes(window.location.pathname);

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/videos");
    }
  }, [navigate, isAuthenticated, isLoading]);

  return (
    <>
      <ToastContainer />
      <AppRoute />
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
