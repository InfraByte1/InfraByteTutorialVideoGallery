import React from "react";
import { ToastContainer } from "react-toastify";
import { usePreferences } from "../contexts/PreferencesContext";

// react-toastify's container, following the viewer's light/dark choice.
const ThemedToastContainer = (props) => {
  const { theme } = usePreferences();
  return <ToastContainer theme={theme === "light" ? "light" : "dark"} {...props} />;
};

export default ThemedToastContainer;
