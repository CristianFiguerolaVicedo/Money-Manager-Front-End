const TOKEN_KEY = "token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable: the session will only last for this page
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable: nothing to clear
  }
};

// Reads the JWT payload (no signature check: the backend still validates every request).
const decodePayload = (token) => {
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
  const token = getToken();
  if (!token) return false;

  const payload = decodePayload(token);
  if (!payload) return false;
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
};

// Milliseconds since epoch when the current token expires, or null if unknown
export const getTokenExpiry = () => {
  const token = getToken();
  if (!token) return null;
  const payload = decodePayload(token);
  return payload && typeof payload.exp === "number" ? payload.exp * 1000 : null;
};
