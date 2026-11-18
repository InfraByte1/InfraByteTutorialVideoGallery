import { oidcConfig } from "../config/config";
import { removeAllCookies } from "./auth";

// Forget everything this browser tab knows about the signed-in user.
export const clearLocalSession = () => {
  removeAllCookies(); // also clears localStorage
  sessionStorage.removeItem("globalPermissions");
};

/**
 * Signs the user out for real.
 *
 * Clearing localStorage only logs the user out of this website. The identity
 * server keeps its own session cookie, so signing in again would just log
 * straight back in. To end that session the browser has to visit the identity
 * server's end-session endpoint as a normal page (not a hidden iframe, where
 * its "do you want to log out?" page can never be answered) and send the
 * id_token as `id_token_hint` so it signs out without asking and then sends the
 * user back to the site. The post-logout address must be one registered for the
 * client on the identity server (the site root).
 */
export const signOut = () => {
  // Must be read before the local session is cleared.
  const idToken = localStorage.getItem("id_token");

  clearLocalSession();

  // Local "dev" mode has no real identity server session (login is skipped
  // with a pasted token), and its authority address is not reachable.
  if (process.env.REACT_APP_ENVIRONMENT === "dev") {
    window.location.assign("/");
    return;
  }

  const params = new URLSearchParams();
  if (idToken) {
    params.set("id_token_hint", idToken);
    params.set("post_logout_redirect_uri", oidcConfig.hostUrl);
  }
  const query = params.toString();
  window.location.assign(
    `${oidcConfig.authority}/connect/endsession${query ? `?${query}` : ""}`
  );
};
