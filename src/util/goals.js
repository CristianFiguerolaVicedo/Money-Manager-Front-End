// Savings goals (F14): short status text for a goal card
import { formatCurrency } from "./util.js";

export const goalStatusText = (goal) => {
  if (goal.achieved) return "¡Objetivo conseguido!";
  if (goal.deadline && goal.monthsLeft === 0) return "La fecha límite ya ha pasado";
  if (goal.monthlyNeeded != null) {
    const months = goal.monthsLeft === 1 ? "1 mes" : `${goal.monthsLeft} meses`;
    return `Ahorra ${formatCurrency(goal.monthlyNeeded)} al mes durante ${months} para llegar a tiempo`;
  }
  return `Te faltan ${formatCurrency(goal.remainingAmount)}`;
};
