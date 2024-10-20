import Header from "./Components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./Pages/Homepage";
import Footer from "./Components/Footer";
import "./Assets/Css/HeaderFooter.css";
import AppRoute from "./router";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticatedUser } from "./services/auth";

import Loading from "./Components/Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // const location = useLocation(); , '/login', '/logout'
  const hideFooter = ["/", "/callback", "/videos"].includes(window.location.pathname);
  const hideHeader = ["/", "*"].includes(window.location.pathname);
  // const hideFooter = false;
  const callback = ["/callback"].includes(window.location.pathname);

  const navigate = useNavigate();

  return (
    <>
      {/* {!hideHeader && <Header />} */}
      <ToastContainer />
      <AppRoute />
      {!hideFooter && <Footer />}
      {/* <Footer /> */}
    </>
  );
}

export default App;
