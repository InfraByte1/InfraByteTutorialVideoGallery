import { jwtDecode } from "jwt-decode";

// LOCAL DEVELOPMENT ONLY (REACT_APP_ENVIRONMENT=dev). Same idea as the
// reporting portal: the "Get Started" button asks the developer to paste an
// access token, so no token ever lives in source code or an env file.

export const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;
    return exp <= Math.floor(Date.now() / 1000);
  } catch (err) {
    return true;
  }
};

/**
 * A token to sign in with: the one already stored while it is still valid,
 * otherwise (when `interactive`) one pasted into a prompt. Returns null when
 * there is no usable token.
 *
 * Only ask from a click handler - React StrictMode runs effects twice in
 * development, which would show the prompt twice.
 */
export const getDevAccessToken = ({ interactive = true } = {}) => {
  const stored = localStorage.getItem("access_token");
  if (stored && !isTokenExpired(stored)) return stored;
  if (!interactive) return null;

  const pasted = window.prompt(
    "Paste an access token to continue.\n" +
      "(Sign in on the real site, then DevTools > Application > Local Storage > access_token)",
    ""
  );
  const token = pasted && pasted.trim();
  return token && !isTokenExpired(token) ? token : null;
};
