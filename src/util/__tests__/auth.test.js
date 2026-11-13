import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const { getToken, setToken, clearToken, hasValidSession, getTokenExpiry } = await import("../auth.js");

const base64url = (value) =>
  btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const fakeJwt = (payload) => `${base64url({ alg: "HS256" })}.${base64url(payload)}.signature`;

beforeEach(() => clearToken());

test("the token only lives in memory", () => {
  setToken("abc");
  assert.equal(getToken(), "abc");
  assert.equal(typeof globalThis.localStorage, "undefined");
});

test("no token means no session", () => {
  assert.equal(getToken(), null);
  assert.equal(hasValidSession(), false);
  assert.equal(getTokenExpiry(), null);
});

test("a token that has not expired is a valid session", () => {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  setToken(fakeJwt({ sub: "ana@example.com", exp }));
  assert.equal(hasValidSession(), true);
  assert.equal(getTokenExpiry(), exp * 1000);
});

test("an expired token is not a valid session", () => {
  setToken(fakeJwt({ sub: "ana@example.com", exp: Math.floor(Date.now() / 1000) - 10 }));
  assert.equal(hasValidSession(), false);
});

test("a malformed token is not a valid session", () => {
  setToken("not-a-jwt");
  assert.equal(hasValidSession(), false);
  assert.equal(getTokenExpiry(), null);
});

test("clearToken removes the session", () => {
  setToken(fakeJwt({ exp: Math.floor(Date.now() / 1000) + 60 }));
  clearToken();
  assert.equal(getToken(), null);
});
