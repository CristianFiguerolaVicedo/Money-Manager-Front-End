import { useContext, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/Input.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { validateEmail } from "../util/validation.js";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import AppContext from "../context/AppContext.jsx";
import { LoaderCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (!validateEmail(email)) {
      setError("Introduce un email válido");
      setIsLoading(false);

      return;
    }

    if (!password.trim()) {
      setError("Introduce tu contraseña");
      setIsLoading(false);
      return;
    }

    setError("");

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.LOGIN, {
        email: email.trim(),
        password,
      });
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        setUser(user);
        // Return to the private page the user tried to open before logging in
        const from = location.state?.from;
        navigate(from && from !== "/login" ? from : "/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        console.error("Something went wrong", err);
        setError("No se ha podido conectar con el servidor. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Introduce tus datos para iniciar sesión">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          placeholder="nombre@ejemplo.com"
          type="email"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Contraseña"
          placeholder="Tu contraseña"
          type="password"
        />

        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-sm text-purple-800 hover:underline">
            ¿Has olvidado tu contraseña?
          </Link>
        </div>

        {error && (
          <p className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          disabled={isLoading}
          className={`w-full py-2 text-lg font-medium bg-purple-950 rounded-lg text-white hover:bg-purple-600 hover:cursor-pointer flex items-center justify-center gap-2 ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          type="submit"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5" />
              Entrando...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>

        <p className="text-sm text-slate-800 text-center mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="font-medium text-purple-800 underline">
            Regístrate
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
