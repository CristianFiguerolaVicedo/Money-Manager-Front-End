// The access token lives only in memory (audit: a token in localStorage can be stolen by an XSS).
// It lasts 15 minutes; util/session.js renews it with the HttpOnly refresh cookie.

let accessToken = null;

export const getToken = () => accessToken;

export const setToken = (token) => {
  accessToken = token || null;
};

export const clearToken = () => {
  accessToken = null;
};

// Reads the JWT payload (no signature check: the backend still validates every request).
export const decodePayload = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

// True when there is a well-formed token that has not expired yet.
export const hasValidSession = () => {
  const payload = accessToken ? decodePayload(accessToken) : null;
  if (!payload) return false;
  return !(typeof payload.exp === "number" && payload.exp * 1000 <= Date.now());
};

// Milliseconds since epoch when the current token expires, or null if unknown
export const getTokenExpiry = () => {
  const payload = accessToken ? decodePayload(accessToken) : null;
  return payload && typeof payload.exp === "number" ? payload.exp * 1000 : null;
};
