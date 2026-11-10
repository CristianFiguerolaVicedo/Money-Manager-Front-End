import { assets } from "../assets/assets";

// Shared frame for login, signup and password recovery pages.
// min-h-[100dvh] + scrolling so the form is never cut off on phones (e.g. with the keyboard open).
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-[100dvh] w-full relative flex items-center justify-center overflow-x-hidden py-6">
      <img
        src={assets.login_bg}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover filter blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2 mb-4 text-white drop-shadow">
          <img src={assets.logo} alt="" className="w-9 h-9" />
          <span className="text-xl font-semibold tracking-tight">Money Manager</span>
        </div>
        <main className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 text-center mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-slate-700 text-center mb-8">{subtitle}</p>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
