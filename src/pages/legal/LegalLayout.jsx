import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { TERMS_UPDATED } from "../../util/legal";

// Public, readable page for the privacy policy and the terms (reachable with or without a session)
const LegalLayout = ({ title, children }) => (
  <div className="min-h-[100dvh] w-full px-4 py-10">
    <div className="mx-auto max-w-2xl">
      <Link to="/" aria-label="Money Manager, ir al inicio" className="inline-block mb-8">
        <Logo size={32} />
      </Link>
      <main id="main" className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Última actualización: {TERMS_UPDATED}</p>
        <div className="legal mt-8 space-y-6 text-[15px] leading-relaxed text-gray-700">{children}</div>
      </main>
      <nav aria-label="Páginas legales" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
        <Link to="/privacy" className="hover:text-gray-800 underline">Política de privacidad</Link>
        <Link to="/terms" className="hover:text-gray-800 underline">Términos de uso</Link>
        <Link to="/" className="hover:text-gray-800 underline">Volver a Money Manager</Link>
      </nav>
    </div>
  </div>
);

export const Section = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export default LegalLayout;
