import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <PermissionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PermissionProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
