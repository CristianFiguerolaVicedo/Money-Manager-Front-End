import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/Input.jsx";
import { PASSWORD_HINT, validateEmail, validatePassword } from "../util/validation.js";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { LoaderCircle, MailCheck } from "lucide-react";
import ResendActivationButton from "../components/ResendActivationButton.jsx";
import { getErrorMessage } from "../util/util.js";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    // Problems with a field are shown under that field; server answers go in the box below
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Introduce tu nombre completo";
    if (!validateEmail(email)) errors.email = "Introduce un email válido";
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    setFieldErrors(errors);
    const first = ["fullName", "email", "password"].find((field) => errors[field]);
    if (first) {
      setError("");
      setIsLoading(false);
      document.getElementById(`signup-${first}`)?.focus();
      return;
    }

    setError("");

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.REGISTER, {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      if (response.status === 201) {
        setRegisteredEmail(email.trim());
      }
    } catch (err) {
      console.error("Something went wrong", err);
      setError(getErrorMessage(err, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthLayout title="¡Ya casi está! Revisa tu email">
        <div className="flex flex-col items-center text-center gap-4">
          <MailCheck className="w-12 h-12 text-purple-800" />
          <p className="text-sm text-slate-700">
            Te hemos enviado un enlace de activación a <strong>{registeredEmail}</strong>. Ábrelo para activar
            tu cuenta; caduca en 24 horas. Si no lo ves, mira en la carpeta de spam.
          </p>
          <ResendActivationButton email={registeredEmail} />
          <Link to="/login" className="font-medium text-purple-800 underline">
            Ir a iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a controlar tus gastos con Money Manager.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            label="Nombre completo"
            placeholder="Ana García"
            type="text"
            name="name"
            autoComplete="name"
            id="signup-fullName"
            error={fieldErrors.fullName}
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            placeholder="nombre@ejemplo.com"
            type="email"
            name="email"
            autoComplete="email"
            id="signup-email"
            error={fieldErrors.email}
          />
          <div className="sm:col-span-2">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              type="password"
              name="new-password"
              autoComplete="new-password"
              id="signup-password"
              error={fieldErrors.password}
              hint={PASSWORD_HINT}
            />
          </div>
        </div>
        {error && (
          <p role="alert" className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          disabled={isLoading}
          className={`w-full py-2 text-lg font-medium bg-violet-700 rounded-lg text-white hover:bg-violet-800 hover:cursor-pointer flex items-center justify-center gap-2 ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          type="submit"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5" />
              Creando cuenta...
            </>
          ) : (
            "Registrarme"
          )}
        </button>

        <p className="text-sm text-slate-800 text-center mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-purple-800 underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
