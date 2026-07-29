import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "oidc-react";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

const oidcConfig = {
  onSignIn: () => {
    onSigninCallback();
  },
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirectUri: `${window.location.origin}/callback`,
  postLogoutRedirectUri: window.location.origin,
  response_type: "code",
  scope: "openid profile email jobbookingapi offline_access",
};

function onSigninCallback() {
  // no-op: token is currently captured from the callback query string
  // in src/Components/Loading.tsx
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig} autoSignIn={false} onSignIn={onSigninCallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
