import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLES = {
  "/dashboard": "Panel",
  "/income": "Ingresos",
  "/expense": "Gastos",
  "/category": "Categorías",
  "/filter": "Buscar movimientos",
  "/budgets": "Presupuestos",
  "/goals": "Objetivos de ahorro",
  "/compare": "Comparar meses",
  "/import": "Importar CSV",
  "/profile": "Perfil",
  "/login": "Iniciar sesión",
  "/signup": "Crear cuenta",
  "/forgot-password": "Recuperar contraseña",
  "/reset-password": "Nueva contraseña",
  "/activate": "Activar cuenta",
  "/unsubscribe": "Darse de baja",
  "/privacy": "Política de privacidad",
  "/terms": "Términos de uso",
};

// One title per page ("Ingresos · Money Manager") so tabs, history and screen readers can tell pages apart
const PageTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = TITLES[pathname.replace(/\/+$/, "") || "/"];
    document.title = page ? `${page} · Money Manager` : pathname === "/" ? "Money Manager" : "Página no encontrada · Money Manager";
  }, [pathname]);
  return null;
};

export default PageTitle;
