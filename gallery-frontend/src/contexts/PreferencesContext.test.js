import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  PreferencesProvider,
  usePreferences,
  THEME_KEY,
  FLOATING_PLAYER_KEY,
} from "./PreferencesContext";

function Probe() {
  const { theme, setTheme, floatingPlayer, setFloatingPlayer } =
    usePreferences();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="float">{String(floatingPlayer)}</span>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setFloatingPlayer(false)}>float-off</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <PreferencesProvider>
      <Probe />
    </PreferencesProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-bs-theme");
});

test("defaults to the dark theme with the mini player on", () => {
  renderProbe();
  expect(screen.getByTestId("theme").textContent).toBe("dark");
  expect(screen.getByTestId("float").textContent).toBe("true");
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
});

test("switching theme updates the page attributes and is remembered", () => {
  renderProbe();
  fireEvent.click(screen.getByText("light"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
  expect(localStorage.getItem(THEME_KEY)).toBe("light");
});

test("restores a saved light theme and a saved mini player choice", () => {
  localStorage.setItem(THEME_KEY, "light");
  localStorage.setItem(FLOATING_PLAYER_KEY, "off");
  renderProbe();
  expect(screen.getByTestId("theme").textContent).toBe("light");
  expect(screen.getByTestId("float").textContent).toBe("false");
});

test("turning the mini player off is saved", () => {
  renderProbe();
  fireEvent.click(screen.getByText("float-off"));
  expect(screen.getByTestId("float").textContent).toBe("false");
  expect(localStorage.getItem(FLOATING_PLAYER_KEY)).toBe("off");
});

test("an unknown stored theme falls back to dark", () => {
  localStorage.setItem(THEME_KEY, "purple");
  renderProbe();
  expect(screen.getByTestId("theme").textContent).toBe("dark");
});

test("works without a provider (safe defaults)", () => {
  render(<Probe />);
  expect(screen.getByTestId("theme").textContent).toBe("dark");
});
