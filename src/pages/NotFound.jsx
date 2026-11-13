import { Link } from "react-router-dom";
import { useSession } from "../util/session";

// Unknown paths: Netlify answers them with a real 404 and the app explains it instead of silently redirecting
const NotFound = () => {
  const { status } = useSession();
  const home = status === "authenticated" ? "/dashboard" : "/login";

  return (
    <main id="main" className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-violet-700">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Esta página no existe</h1>
        <p className="mt-3 text-gray-600">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
        <Link
          to={home}
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-violet-700 px-5 font-semibold text-white hover:bg-violet-800"
        >
          {status === "authenticated" ? "Volver al panel" : "Ir a iniciar sesión"}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
