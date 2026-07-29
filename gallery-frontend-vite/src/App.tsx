import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "oidc-react";
import Footer from "./Components/Footer";
import AppRoute from "./router";
import { isAuthenticatedUser } from "./services/auth";
import "./Assets/Css/HeaderFooter.css";

function App() {
  const hideFooter = ["/", "/callback"].includes(window.location.pathname);

  const navigate = useNavigate();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticatedUser() || !isLoading) {
      navigate("/videos");
      return;
    }
  }, [navigate, isLoading]);

  return (
    <>
      <AppRoute />
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
