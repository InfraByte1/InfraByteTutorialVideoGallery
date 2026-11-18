import { getDevAccessToken, isTokenExpired } from "./devAuth";

const b64 = (o) =>
  Buffer.from(JSON.stringify(o)).toString("base64").replace(/=+$/, "");
const makeToken = (claims) => `${b64({ alg: "none" })}.${b64(claims)}.sig`;
const now = () => Math.floor(Date.now() / 1000);
const valid = () => makeToken({ exp: now() + 3600 });
const expired = () => makeToken({ exp: now() - 10 });

beforeEach(() => {
  localStorage.clear();
  window.prompt = jest.fn();
});

test("isTokenExpired", () => {
  expect(isTokenExpired(valid())).toBe(false);
  expect(isTokenExpired(expired())).toBe(true);
  expect(isTokenExpired(makeToken({}))).toBe(true);
  expect(isTokenExpired("garbage")).toBe(true);
});

test("reuses a stored valid token without asking", () => {
  const token = valid();
  localStorage.setItem("access_token", token);
  expect(getDevAccessToken()).toBe(token);
  expect(window.prompt).not.toHaveBeenCalled();
});

test("asks for a token when the stored one is expired, and trims it", () => {
  localStorage.setItem("access_token", expired());
  const pasted = valid();
  window.prompt.mockReturnValue(`  ${pasted}  `);
  expect(getDevAccessToken()).toBe(pasted);
  expect(window.prompt).toHaveBeenCalledTimes(1);
});

test("rejects an expired, invalid or cancelled paste", () => {
  window.prompt.mockReturnValueOnce(expired());
  expect(getDevAccessToken()).toBeNull();
  window.prompt.mockReturnValueOnce("not-a-token");
  expect(getDevAccessToken()).toBeNull();
  window.prompt.mockReturnValueOnce(null);
  expect(getDevAccessToken()).toBeNull();
});

test("never asks when not interactive", () => {
  expect(getDevAccessToken({ interactive: false })).toBeNull();
  expect(window.prompt).not.toHaveBeenCalled();
});
