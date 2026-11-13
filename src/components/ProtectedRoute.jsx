import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../util/session";

// Shown while the app checks, on load, whether the session cookie still opens a session
export const SessionCheck = () => (
  <div className="min-h-[100dvh] flex items-center justify-center text-gray-500" role="status" aria-live="polite">
    <LoaderCircle className="w-6 h-6 animate-spin mr-2" aria-hidden="true" />
    Cargando…
  </div>
);

// Private pages: only with a session; otherwise go to /login (remembering where the user wanted to go)
export const ProtectedRoute = () => {
  const location = useLocation();
  const { status } = useSession();

  if (status === "checking") return <SessionCheck />;
  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

// Login/signup: a user who is already logged in goes straight to the dashboard.
export const PublicOnlyRoute = () => {
  const { status } = useSession();
  if (status === "checking") return <SessionCheck />;
  return status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
