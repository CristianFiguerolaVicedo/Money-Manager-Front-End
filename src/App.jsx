import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import PageTitle from "./components/PageTitle";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute, PublicOnlyRoute, SessionCheck } from "./components/ProtectedRoute";
import { useSession } from "./util/session";

// Each page is downloaded when it is first opened (audit: a single 1 MB bundle). Login stays in the main
// bundle because it is the first screen for anyone without a session.
const Income = lazy(() => import("./pages/Income"));
const Expense = lazy(() => import("./pages/Expense"));
const Category = lazy(() => import("./pages/Category"));
const Filter = lazy(() => import("./pages/Filter"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Compare = lazy(() => import("./pages/Compare"));
const Goals = lazy(() => import("./pages/Goals"));
const Import = lazy(() => import("./pages/Import"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Activate = lazy(() => import("./pages/Activate"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  return (
    <>
      {/* Below the 64 px sticky header so messages never cover the logo or the menu (audit) */}
      <Toaster
        position="top-right"
        containerStyle={{ top: 76, right: 16 }}
        toastOptions={{ style: { background: "var(--toast-bg)", color: "var(--toast-fg)" } }}
      />
      <BrowserRouter>
        <PageTitle />
        <Suspense fallback={<SessionCheck />}>
        <Routes>
          <Route path="/" element={<Root />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/category" element={<Category />} />
            <Route path="/filter" element={<Filter />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/import" element={<Import />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Reachable from the email link whether or not someone is logged in */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

// "/": send the user wherever makes sense for their session
const Root = () => {
  const { status } = useSession();
  if (status === "checking") return <SessionCheck />;
  return status === "authenticated" ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default App;
