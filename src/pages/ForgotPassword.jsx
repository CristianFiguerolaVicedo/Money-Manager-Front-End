import { useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, MailCheck } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { validateEmail } from "../util/validation.js";
import { getErrorMessage } from "../util/util.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Introduce un email válido");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await axiosConfig.post(API_ENDPOINTS.FORGOT_PASSWORD, { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "No se ha podido enviar el email. Inténtalo de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Revisa tu email">
        <div className="flex flex-col items-center text-center gap-4">
          <MailCheck className="w-12 h-12 text-purple-800" />
          <p className="text-sm text-slate-700">
            Si existe una cuenta con <strong>{email.trim()}</strong>, te hemos enviado un enlace para
            elegir una contraseña nueva. Caduca en 1 hora. Mira también en la carpeta de spam.
          </p>
          <Link to="/login" className="font-medium text-purple-800 underline">
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="¿Has olvidado tu contraseña?"
      subtitle="Escribe tu email y te enviaremos un enlace para elegir una nueva."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          placeholder="nombre@ejemplo.com"
          type="email"
        />

        {error && <p className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-lg font-medium bg-violet-700 rounded-lg text-white hover:bg-violet-800 hover:cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5" />
              Enviando...
            </>
          ) : (
            "Enviar enlace"
          )}
        </button>

        <p className="text-sm text-slate-800 text-center mt-6">
          <Link to="/login" className="font-medium text-purple-800 underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
