import { CircleCheck, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// First-steps guide for new users; disappears once everything is done
const GettingStarted = ({ hasCategories, hasIncome, hasExpense }) => {
  if (hasCategories && hasIncome && hasExpense) return null;

  const steps = [
    {
      done: hasCategories,
      title: "Crea tus categorías",
      text: "Por ejemplo «Nómina» para ingresos o «Supermercado» y «Alquiler» para gastos.",
      to: "/category",
      cta: "Ir a categorías",
    },
    {
      done: hasIncome,
      title: "Añade tu primer ingreso",
      text: "Tu nómina, una paga extra o cualquier dinero que entre.",
      to: "/income",
      cta: "Añadir ingreso",
    },
    {
      done: hasExpense,
      title: "Añade tu primer gasto",
      text: "A partir de aquí verás tu saldo y en qué se va el dinero.",
      to: "/expense",
      cta: "Añadir gasto",
    },
  ];
  const next = steps.find((s) => !s.done);

  return (
    <section className="bg-white rounded-2xl border border-purple-200 shadow-sm p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">¡Bienvenido! Empieza en 3 pasos</h2>
      <p className="text-sm text-gray-500 mt-1">
        Completa estos pasos para empezar a ver tus cuentas en el panel.
      </p>
      <ol className="mt-5 space-y-4">
        {steps.map((step) => (
          <li key={step.title} className="flex gap-3">
            {step.done ? (
              <CircleCheck className="w-6 h-6 shrink-0 text-green-700" aria-label="Hecho" />
            ) : (
              <Circle className="w-6 h-6 shrink-0 text-gray-300" aria-label="Pendiente" />
            )}
            <div className="min-w-0">
              <p className={`font-medium ${step.done ? "text-gray-400 line-through" : "text-gray-900"}`}>{step.title}</p>
              {!step.done && <p className="text-sm text-gray-500">{step.text}</p>}
              {step === next && (
                <Link
                  to={step.to}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-white bg-purple-800 hover:bg-violet-800 px-3 py-1.5 rounded-lg"
                >
                  {step.cta} <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default GettingStarted;
