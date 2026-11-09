import toast from "react-hot-toast";
import { BASE_URL } from "./apiEndpoints";

// Render's free plan puts the backend to sleep after ~15 min without traffic and the
// first request then takes up to a minute. Instead of an unexplained spinner, show a
// notice whenever a request is slow, and close it when the slow requests finish.

const SLOW_REQUEST_MS = 3000;
const TOAST_ID = "server-waking";

let nextId = 0;
const timers = new Map();   // request id -> timeout
const slowRequests = new Set();
let noticeShown = false;

export const trackRequestStart = (config) => {
  const id = ++nextId;
  config.metadata = { ...(config.metadata || {}), requestId: id };
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      slowRequests.add(id);
      if (!noticeShown) {
        noticeShown = true;
        toast.loading("Despertando el servidor… La primera carga puede tardar hasta un minuto.", {
          id: TOAST_ID,
        });
      }
    }, SLOW_REQUEST_MS)
  );
  return config;
};

export const trackRequestEnd = (config) => {
  const id = config?.metadata?.requestId;
  if (!id) return;
  clearTimeout(timers.get(id));
  timers.delete(id);
  slowRequests.delete(id);
  if (noticeShown && slowRequests.size === 0) {
    noticeShown = false;
    toast.success("Servidor listo", { id: TOAST_ID, duration: 2000 });
  }
};

// Fire-and-forget request on page load so the server starts waking up
// while the user is still typing their email and password.
export const warmUpServer = () => {
  try {
    fetch(`${BASE_URL}/health`, { method: "GET", mode: "cors" }).catch(() => {});
  } catch {
    // ignore: this is only an optimisation
  }
};
