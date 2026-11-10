// Budget status helpers shared by the budgets page, the dashboard alert and the expense toasts.
// status comes from the backend: "none" | "ok" | "warning" (>= 80 %) | "over"

export const BUDGET_STATUS = {
  ok: { label: "En orden", bar: "bg-purple-700", text: "text-gray-600" },
  warning: { label: "Cerca del límite", bar: "bg-amber-500", text: "text-amber-800" },
  over: { label: "Superado", bar: "bg-red-700", text: "text-red-800" },
};

// Budgets that need attention, worst first
export const budgetAlerts = (budgets = []) =>
  budgets
    .filter((budget) => budget.status === "over" || budget.status === "warning")
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0));

// Totals of the categories that have a budget
export const budgetTotals = (budgets = []) =>
  budgets
    .filter((budget) => budget.amount != null)
    .reduce(
      (totals, budget) => ({
        budget: totals.budget + Number(budget.amount),
        spent: totals.spent + Number(budget.spent || 0),
        count: totals.count + 1,
      }),
      { budget: 0, spent: 0, count: 0 }
    );

// Text for a toast after saving an expense, or null when the category is fine
export const budgetToastMessage = (budget) => {
  if (!budget || budget.amount == null) return null;
  if (budget.status === "over") {
    return `Has superado el presupuesto de ${budget.categoryName} (${budget.percent} %)`;
  }
  if (budget.status === "warning") {
    return `Llevas el ${budget.percent} % del presupuesto de ${budget.categoryName}`;
  }
  return null;
};
