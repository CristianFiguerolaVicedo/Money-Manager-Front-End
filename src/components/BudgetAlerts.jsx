import { Link } from "react-router-dom";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { budgetAlerts } from "../util/budgets";
import { formatCurrency } from "../util/util";

// Dashboard notice listing this month's budgets that are over or close to the limit (renders nothing otherwise)
const BudgetAlerts = ({ budgets }) => {
  const alerts = budgetAlerts(budgets);
  if (alerts.length === 0) return null;
  const anyOver = alerts.some((b) => b.status === "over");

  return (
    <div className={`p-4 rounded-xl border ${anyOver ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-start gap-3">
        {anyOver ? <CircleAlert className="w-5 h-5 shrink-0 text-red-800 mt-0.5" /> : <TriangleAlert className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />}
        <div className="text-sm text-gray-800 min-w-0">
          <p className="font-semibold">Presupuestos de este mes</p>
          <ul className="mt-1 space-y-0.5">
            {alerts.slice(0, 4).map((b) => (
              <li key={b.categoryId}>
                {b.categoryName}: {formatCurrency(b.spent)} de {formatCurrency(b.amount)} ({b.percent} %)
                {b.status === "over" ? " · superado" : " · cerca del límite"}
              </li>
            ))}
          </ul>
          <Link to="/budgets" className="inline-block mt-2 font-semibold text-purple-800 underline">
            Ver presupuestos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BudgetAlerts;
