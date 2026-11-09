import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Category from "./pages/Category";
import Filter from "./pages/Filter";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Activate from "./pages/Activate";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { hasValidSession } from "./util/auth";

const App = () => {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/category" element={<Category />} />
            <Route path="/filter" element={<Filter />} />
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

          <Route path="*" element={<Root />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

// "/" and unknown paths: send the user wherever makes sense for their session
const Root = () => {
  return hasValidSession() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default App;
