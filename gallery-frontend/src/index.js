import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AuthProvider } from "oidc-react";


const oidcConfig = {
  onSignIn: () => {
    onSigninCallback();
  },
  authority: "https://localhost:5020",
  clientId: "react_tutorial_client",
  redirectUri: "http://localhost:3000/callback",
  postLogoutRedirectUri: "http://localhost:3000/",
  response_type: "code",
  scope: "openid profile email jobbookingapi offline_access",
};

function onSigninCallback() {
  // localStorage.setItem("token", "mockToken");
  // window.location.href = "/videos";
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider
      {...oidcConfig}
      autoSignIn={false}
      onSignIn={onSigninCallback}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
