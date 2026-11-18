import React from "react";
import { Dropdown } from "react-bootstrap";
import { FiMoon, FiSettings, FiSun } from "react-icons/fi";
import { usePreferences } from "../contexts/PreferencesContext";
import "../Assets/Css/SettingsMenu.css";

// Gear menu in the navbar: appearance (dark/light) and the mini player.
const SettingsMenu = () => {
  const { theme, setTheme, floatingPlayer, setFloatingPlayer } =
    usePreferences();

  return (
    // autoClose="outside": the menu stays open while options are toggled
    <Dropdown align="end" autoClose="outside" className="settings-menu">
      <Dropdown.Toggle
        bsPrefix="settings-toggle"
        variant=""
        aria-label="Settings"
        title="Settings"
      >
        <FiSettings size={20} aria-hidden="true" />
      </Dropdown.Toggle>

      <Dropdown.Menu className="settings-panel">
        <div className="settings-heading">Settings</div>

        <div className="settings-row">
          <div className="settings-text">
            <span className="settings-label">Theme</span>
            <span className="settings-hint">Dark is the default</span>
          </div>
          <div className="theme-choice" role="radiogroup" aria-label="Theme">
            <button
              type="button"
              role="radio"
              aria-checked={theme === "dark"}
              className={theme === "dark" ? "is-active" : ""}
              onClick={() => setTheme("dark")}
            >
              <FiMoon aria-hidden="true" /> Dark
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={theme === "light"}
              className={theme === "light" ? "is-active" : ""}
              onClick={() => setTheme("light")}
            >
              <FiSun aria-hidden="true" /> Light
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-text">
            <span className="settings-label">Mini player</span>
            <span className="settings-hint">
              Keep the video in a small window while you scroll
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={floatingPlayer}
            aria-label="Mini player"
            className={`settings-switch${floatingPlayer ? " is-on" : ""}`}
            onClick={() => setFloatingPlayer(!floatingPlayer)}
          />
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SettingsMenu;
