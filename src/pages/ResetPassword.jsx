import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { getErrorMessage } from "../util/util.js";
import { clearToken } from "../util/auth.js";

const MIN_LENGTH = 8;

// Opened from the link in the password reset email: /reset-password?token=...
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await axiosConfig.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
      clearToken(); // any old session in this browser belongs to the previous password
      toast.success("Contraseña actualizada. Ya puedes iniciar sesión.", { duration: 6000 });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "No se ha podido cambiar la contraseña. Inténtalo de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Enlace no válido">
        <p className="text-sm text-slate-700 text-center mb-6">
          Este enlace de recuperación no es válido. Pide uno nuevo.
        </p>
        <p className="text-center">
          <Link to="/forgot-password" className="font-medium text-purple-800 underline">
            Pedir un enlace nuevo
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Elige una contraseña nueva" subtitle={`Mínimo ${MIN_LENGTH} caracteres.`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Contraseña nueva"
          placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
          type="password"
        />
        <Input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Repite la contraseña"
          placeholder="Repite la contraseña"
          type="password"
        />

        {error && (
          <div className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">
            <p>{error}</p>
            {/caducado|no es válido/i.test(error) && (
              <Link to="/forgot-password" className="underline font-medium">
                Pedir un enlace nuevo
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-lg font-medium bg-purple-950 rounded-lg text-white hover:bg-purple-600 hover:cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5" />
              Guardando...
            </>
          ) : (
            "Guardar contraseña"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
