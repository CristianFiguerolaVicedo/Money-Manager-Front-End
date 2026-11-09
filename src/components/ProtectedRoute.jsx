import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearToken, hasValidSession } from "../util/auth";

// Private pages: without a valid (non-expired) session, go to /login before rendering
// anything, so the page never mounts or fires API requests without a token.
export const ProtectedRoute = () => {
  const location = useLocation();

  if (!hasValidSession()) {
    clearToken();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

// Login/signup: a user who is already logged in goes straight to the dashboard.
export const PublicOnlyRoute = () => {
  return hasValidSession() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
