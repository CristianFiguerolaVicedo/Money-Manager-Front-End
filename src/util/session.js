import axios from "axios";
import { useSyncExternalStore } from "react";
import { BASE_URL } from "./apiEndpoints";
import { clearToken, getTokenExpiry, setToken } from "./auth";

// Session state shared by the whole app.
// "checking" while the app asks the backend, on load, whether the refresh cookie still opens a session.
let state = { status: "checking" };
const listeners = new Set();
const setState = (next) => {
  state = next;
  listeners.forEach((listener) => listener());
};

export const useSession = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state
  );

export const getSessionStatus = () => state.status;

// Plain client without the app's interceptors (avoids loops while refreshing)
const raw = axios.create({ baseURL: BASE_URL, headers: { Accept: "application/json" } });

let refreshTimer = null;
const scheduleRenewal = () => {
  clearTimeout(refreshTimer);
  const expiry = getTokenExpiry();
  if (!expiry) return;
  // Renew one minute before the access token expires
  const wait = Math.max(5_000, expiry - Date.now() - 60_000);
  refreshTimer = setTimeout(() => {
    refreshAccessToken();
  }, wait);
};

/** After login (or a password change, which returns a new token). */
export const startSession = (token) => {
  setToken(token);
  scheduleRenewal();
  setState({ status: "authenticated" });
};

/** Forgets the session in this tab. `revoke` also tells the backend to invalidate the cookie. */
export const endSession = async ({ revoke = false } = {}) => {
  clearTimeout(refreshTimer);
  clearToken();
  setState({ status: "anonymous" });
  if (revoke) {
    try {
      await raw.post("/logout");
    } catch {
      // the local session is gone anyway
    }
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let inFlight = null;
/**
 * Exchanges the HttpOnly refresh cookie for a new access token. Concurrent callers share one request.
 * Returns the new token, or null when there is no valid session (the user has to log in again).
 * Gateway errors (the free backend waking up behind Netlify's 26 s proxy limit) are retried.
 */
export const refreshAccessToken = () => {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const response = await raw.post("/refresh-token");
        startSession(response.data.token);
        return response.data.token;
      } catch (error) {
        const status = error.response?.status;
        if ((status === 502 || status === 503 || status === 504 || !error.response) && attempt < 3) {
          await sleep(3000);
          continue;
        }
        await endSession();
        return null;
      }
    }
    return null;
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
};

/** On app start: restore the session from the cookie, if there is one. */
export const restoreSession = async () => {
  try {
    // Sessions from older versions kept the token in localStorage: drop it
    localStorage.removeItem("token");
  } catch {
    // storage unavailable
  }
  await refreshAccessToken();
};

// Coming back to a tab after a while: renew straight away if the token is about to expire
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const expiry = getTokenExpiry();
    if (document.visibilityState === "visible" && state.status === "authenticated" && expiry && expiry - Date.now() < 60_000) {
      refreshAccessToken();
    }
  });
}
