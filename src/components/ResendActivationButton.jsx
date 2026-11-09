import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { getErrorMessage } from "../util/util.js";

const COOLDOWN_SECONDS = 60;

// "Reenviar email de activación" with a short cooldown so it is not pressed repeatedly
const ResendActivationButton = ({ email, className = "" }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.RESEND_ACTIVATION, { email: email.trim() });
      setMessage(response.data?.message || "Te hemos enviado un enlace nuevo.");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err, "No se ha podido reenviar el email. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <button
        type="button"
        onClick={handleResend}
        disabled={loading || cooldown > 0 || !email?.trim()}
        className="inline-flex items-center gap-2 text-sm font-medium text-purple-800 underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
      >
        {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
        {cooldown > 0 ? `Reenviar email de activación (${cooldown}s)` : "Reenviar email de activación"}
      </button>
      {message && <p className="text-sm text-green-800 mt-2">{message}</p>}
      {error && <p className="text-sm text-red-800 mt-2">{error}</p>}
    </div>
  );
};

export default ResendActivationButton;
