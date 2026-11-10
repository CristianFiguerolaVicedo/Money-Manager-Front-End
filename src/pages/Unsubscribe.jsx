import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { getErrorMessage } from "../util/util.js";

// Opened from the "no quiero recibir más estos emails" link: /unsubscribe?token=...
const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "Falta el enlace para darte de baja.");
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    axiosConfig
      .post(API_ENDPOINTS.UNSUBSCRIBE, { token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(getErrorMessage(err, "No se ha podido completar la baja. Inténtalo de nuevo."));
      });
  }, [token]);

  if (status === "loading") {
    return (
      <AuthLayout title="Dándote de baja...">
        <div className="flex justify-center py-6">
          <LoaderCircle className="w-10 h-10 animate-spin text-purple-800" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={status === "success" ? "Te has dado de baja" : "No hemos podido darte de baja"}>
      <div className="flex flex-col items-center text-center gap-4">
        {status === "success" ? <CircleCheck className="w-14 h-14 text-green-700" /> : <CircleX className="w-14 h-14 text-red-700" />}
        <p className="text-sm text-slate-700">
          {status === "success"
            ? "Ya no recibirás el recordatorio diario, el resumen diario ni el informe mensual. Los emails de tu cuenta (como restablecer la contraseña) seguirán llegando."
            : message}
        </p>
        <p className="text-sm text-slate-700">Puedes volver a activarlos cuando quieras en tu perfil.</p>
        <Link to="/profile" className="w-full py-2 text-lg font-medium bg-purple-950 rounded-lg text-white hover:bg-purple-600 text-center">
          Ir a mi perfil
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Unsubscribe;
