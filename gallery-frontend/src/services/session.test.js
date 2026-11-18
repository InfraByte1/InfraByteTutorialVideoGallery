import { signOut, clearLocalSession } from "./session";
import { removeAllCookies } from "./auth";

jest.mock("../config/config", () => ({
  oidcConfig: {
    authority: "https://idp.test",
    hostUrl: "https://app.test",
  },
}));
jest.mock("./auth", () => ({ removeAllCookies: jest.fn() }));

const realLocation = window.location;
beforeEach(() => {
  // CRA resets mock implementations before every test, so set it here.
  removeAllCookies.mockImplementation(() => localStorage.clear());
  localStorage.clear();
  sessionStorage.clear();
  delete window.location;
  window.location = { assign: jest.fn() };
});
afterAll(() => {
  window.location = realLocation;
});

test("ends the identity server session with the id token as hint", () => {
  localStorage.setItem("id_token", "abc.def.ghi");
  localStorage.setItem("access_token", "tok");

  signOut();

  const url = new URL(window.location.assign.mock.calls[0][0]);
  expect(url.origin + url.pathname).toBe("https://idp.test/connect/endsession");
  expect(url.searchParams.get("id_token_hint")).toBe("abc.def.ghi");
  expect(url.searchParams.get("post_logout_redirect_uri")).toBe("https://app.test");
  // the id token was read before the local session was wiped
  expect(localStorage.getItem("access_token")).toBeNull();
  expect(localStorage.getItem("id_token")).toBeNull();
});

test("still ends the session when there is no id token", () => {
  signOut();
  expect(window.location.assign).toHaveBeenCalledWith(
    "https://idp.test/connect/endsession"
  );
});

test("local dev mode just clears the session and goes home", () => {
  const original = process.env.REACT_APP_ENVIRONMENT;
  process.env.REACT_APP_ENVIRONMENT = "dev";
  localStorage.setItem("id_token", "abc");

  signOut();

  expect(window.location.assign).toHaveBeenCalledWith("/");
  expect(localStorage.getItem("id_token")).toBeNull();
  process.env.REACT_APP_ENVIRONMENT = original;
});

test("clearLocalSession wipes cookies, storage and cached permissions", () => {
  sessionStorage.setItem("globalPermissions", "x");
  clearLocalSession();
  expect(removeAllCookies).toHaveBeenCalled();
  expect(sessionStorage.getItem("globalPermissions")).toBeNull();
});
