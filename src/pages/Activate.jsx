import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/Input.jsx";
import ResendActivationButton from "../components/ResendActivationButton.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { getErrorMessage } from "../util/util.js";

// Opened from the link in the activation email: /activate?token=...
const Activate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState(token ? "loading" : "error"); // loading | success | error
  const [message, setMessage] = useState(token ? "" : "Falta el enlace de activación.");
  const [email, setEmail] = useState("");
  const requested = useRef(false);

  useEffect(() => {
    // Tokens are single-use: never call twice (React StrictMode mounts effects twice in development)
    if (!token || requested.current) return;
    requested.current = true;

    axiosConfig
      .get(API_ENDPOINTS.ACTIVATE, { params: { token } })
      .then((response) => {
        setStatus("success");
        setMessage(response.data?.message || "¡Cuenta activada! Ya puedes iniciar sesión.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err, "No se ha podido activar la cuenta. Inténtalo de nuevo."));
      });
  }, [token]);

  if (status === "loading") {
    return (
      <AuthLayout title="Activando tu cuenta...">
        <div className="flex justify-center py-6">
          <LoaderCircle className="w-10 h-10 animate-spin text-purple-800" />
        </div>
        <p className="text-sm text-slate-600 text-center">
          Si tarda un poco es porque el servidor se está despertando.
        </p>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout title="¡Cuenta activada!">
        <div className="flex flex-col items-center text-center gap-4">
          <CircleCheck className="w-14 h-14 text-green-700" />
          <p className="text-sm text-slate-700">{message}</p>
          <Link
            to="/login"
            className="w-full py-2 text-lg font-medium bg-purple-950 rounded-lg text-white hover:bg-purple-600 text-center"
          >
            Iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="No hemos podido activar tu cuenta">
      <div className="flex flex-col items-center text-center gap-4">
        <CircleX className="w-14 h-14 text-red-700" />
        <p className="text-sm text-slate-700">{message}</p>
        <p className="text-sm text-slate-700">
          Si tu cuenta ya está activada, simplemente inicia sesión. Si no, escribe tu email y te enviaremos un
          enlace nuevo:
        </p>
        <div className="w-full text-left">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            placeholder="nombre@ejemplo.com"
            type="email"
          />
        </div>
        <ResendActivationButton email={email} />
        <Link to="/login" className="text-sm font-medium text-purple-800 underline">
          Ir a iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Activate;
