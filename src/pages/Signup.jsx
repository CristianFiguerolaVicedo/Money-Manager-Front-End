import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/Input.jsx";
import { validateEmail } from "../util/validation.js";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { toast } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import ProfileImageSelector from "../components/ProfileImageSelector.jsx";
import uploadProfileImage from "../util/uploadProfileImage.js";
import { getErrorMessage } from "../util/util.js";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    setIsLoading(true);

    if (!fullName.trim()) {
      setError("Introduce tu nombre completo");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Introduce un email válido");
      setIsLoading(false);

      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setIsLoading(false);
      return;
    }

    setError("");

    try {
      if (profilePhoto) {
        const imageUrl = await uploadProfileImage(profilePhoto);
        profileImageUrl = imageUrl || "";
      }

      const response = await axiosConfig.post(API_ENDPOINTS.REGISTER, {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        profileImageUrl,
      });
      if (response.status === 201) {
        toast.success("¡Cuenta creada! Revisa tu email y actívala antes de iniciar sesión.", { duration: 6000 });
        navigate("/login");
      }
    } catch (err) {
      console.error("Something went wrong", err);
      setError(getErrorMessage(err, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a controlar tus gastos con Money Manager.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center mb-6">
          <ProfileImageSelector image={profilePhoto} setImage={setProfilePhoto} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            label="Nombre completo"
            placeholder="Ana García"
            type="text"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            placeholder="nombre@ejemplo.com"
            type="email"
          />
          <div className="sm:col-span-2">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              type="password"
            />
          </div>
        </div>
        {error && (
          <p className="text-red-800 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          disabled={isLoading}
          className={`w-full py-2 text-lg font-medium bg-purple-950 rounded-lg text-white hover:bg-purple-600 hover:cursor-pointer flex items-center justify-center gap-2 ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
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
