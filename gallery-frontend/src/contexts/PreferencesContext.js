import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Viewer preferences kept in this browser only (nothing is sent to the API).
export const THEME_KEY = "theme"; // "dark" | "light"
export const FLOATING_PLAYER_KEY = "floatingPlayer"; // "on" | "off"

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage blocked (private mode etc.): use defaults
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* the choice just won't persist */
  }
};

// Dark is the default; only an explicit "light" switches it.
export const readTheme = () => (read(THEME_KEY) === "light" ? "light" : "dark");
export const readFloatingPlayer = () => read(FLOATING_PLAYER_KEY) !== "off";

const DEFAULTS = {
  theme: "dark",
  setTheme: () => {},
  floatingPlayer: true,
  setFloatingPlayer: () => {},
};

const PreferencesContext = createContext(DEFAULTS);

export function PreferencesProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme);
  const [floatingPlayer, setFloatingPlayerState] = useState(readFloatingPlayer);

  // data-theme drives our own CSS (Theme.css); data-bs-theme switches
  // Bootstrap's built-in dark mode; color-scheme themes scrollbars/inputs.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-bs-theme", theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next) => {
    const value = next === "light" ? "light" : "dark";
    setThemeState(value);
    write(THEME_KEY, value);
  }, []);

  const setFloatingPlayer = useCallback((on) => {
    setFloatingPlayerState(!!on);
    write(FLOATING_PLAYER_KEY, on ? "on" : "off");
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, floatingPlayer, setFloatingPlayer }),
    [theme, setTheme, floatingPlayer, setFloatingPlayer],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);
