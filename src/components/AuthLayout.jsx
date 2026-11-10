import Logo from "./Logo";

// Shared frame for login, signup and password recovery pages: brand mark and one card on the app background.
// min-h-[100dvh] + scrolling so the form is never cut off on phones (e.g. with the keyboard open).
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-10">
      <Logo size={36} className="mb-8" />
      <main className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1.5">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600 mb-7">{subtitle}</p>}
        {children}
      </main>
      <p className="mt-6 text-xs text-gray-500">Tus datos solo los ves tú.</p>
    </div>
  );
};

export default AuthLayout;
