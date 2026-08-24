import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AuthProvider } from "oidc-react";
import { oidcConfig } from "./config/config";
import { consumeTokenFromUrl } from "./services/auth";

// Must run before the tree mounts: a ?token= handoff can arrive on any
// route, and PermissionProvider's own mount effect needs the token already
// in localStorage the moment it checks for one.
consumeTokenFromUrl();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <AuthProvider {...oidcConfig} autoSignIn={false}> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    {/* </AuthProvider> */}
  </React.StrictMode>
);

reportWebVitals();
