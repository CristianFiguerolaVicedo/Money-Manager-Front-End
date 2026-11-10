import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import Modal from "./Modal";
import AppContext from "../context/AppContext";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { clearToken, getTokenExpiry, setToken } from "../util/auth";
import { getErrorMessage } from "../util/util";

const WARN_BEFORE_MS = 5 * 60 * 1000; // show the warning 5 minutes before the session ends

const formatRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

// Warns before the login token expires and lets the user extend the session,
// instead of being thrown out to the login page in the middle of something.
const SessionWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearUser } = useContext(AppContext);

  const [expiry, setExpiry] = useState(getTokenExpiry);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const logout = useCallback(
    (expired) => {
      clearToken();
      clearUser?.();
      navigate("/login", { replace: true, state: expired ? { sessionExpired: true, from: location.pathname } : undefined });
    },
    [clearUser, navigate, location.pathname]
  );

  // Tick every second only while the warning is visible; otherwise wake up when it is due.
  // Also re-check when the tab becomes visible again (timers are throttled in background tabs).
  useEffect(() => {
    if (!expiry) return;
    const remaining = expiry - Date.now();
    const delay = remaining > WARN_BEFORE_MS ? remaining - WARN_BEFORE_MS : 1000;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(delay, 2_147_000_000));
    const onVisible = () => document.visibilityState === "visible" && setNow(Date.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [expiry, now]);

  const remaining = expiry ? expiry - now : null;

  useEffect(() => {
    if (remaining !== null && remaining <= 0) {
      logout(true);
    }
  }, [remaining, logout]);

  const stayLoggedIn = async () => {
    setRefreshing(true);
    setError("");
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.REFRESH_TOKEN);
      setToken(response.data.token);
      setExpiry(getTokenExpiry());
      setNow(Date.now());
    } catch (err) {
      setError(getErrorMessage(err, "No se ha podido renovar la sesión."));
    } finally {
      setRefreshing(false);
    }
  };

  const showWarning = remaining !== null && remaining > 0 && remaining <= WARN_BEFORE_MS;

  return (
    <Modal isOpen={showWarning} onClose={stayLoggedIn} title="Tu sesión está a punto de caducar">
      <p className="text-sm">
        Por seguridad, tu sesión se cerrará en <strong>{formatRemaining(remaining ?? 0)}</strong>. ¿Quieres seguir
        conectado?
      </p>
      {error && <p className="text-sm text-red-800 bg-red-50 p-2 rounded mt-3">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={() => logout(false)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          Cerrar sesión
        </button>
        <button
          type="button"
          onClick={stayLoggedIn}
          disabled={refreshing}
          className="flex items-center gap-1 bg-violet-700 text-white px-3 py-2 rounded-lg hover:bg-violet-800 font-semibold cursor-pointer disabled:opacity-60"
        >
          {refreshing && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Seguir conectado
        </button>
      </div>
    </Modal>
  );
};

export default SessionWatcher;
