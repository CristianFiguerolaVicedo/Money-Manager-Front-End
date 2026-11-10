// Month comparison (F11): totals and per-category differences between month A and month B.

const sum = (items = []) => items.reduce((total, item) => total + (Number(item.amount) || 0), 0);

// Change from a to b; pct is null when a is 0 (no meaningful percentage)
export const diff = (a, b) => ({
  a,
  b,
  diff: b - a,
  pct: a === 0 ? null : Math.round(((b - a) / Math.abs(a)) * 100),
});

const byCategory = (items = []) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.categoryId ?? item.categoryName ?? "none";
    const group = groups.get(key) || { key, name: item.categoryName || "Sin categoría", amount: 0 };
    group.amount += Number(item.amount) || 0;
    groups.set(key, group);
  });
  return groups;
};

// Categories present in either month, biggest first
const compareCategories = (itemsA, itemsB) => {
  const a = byCategory(itemsA);
  const b = byCategory(itemsB);
  const keys = new Set([...a.keys(), ...b.keys()]);
  return [...keys]
    .map((key) => ({
      key,
      name: (b.get(key) || a.get(key)).name,
      ...diff(a.get(key)?.amount || 0, b.get(key)?.amount || 0),
    }))
    .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b));
};

export const compareMonths = ({ incomesA = [], expensesA = [], incomesB = [], expensesB = [] }) => {
  const income = diff(sum(incomesA), sum(incomesB));
  const expense = diff(sum(expensesA), sum(expensesB));
  return {
    income,
    expense,
    balance: diff(income.a - expense.a, income.b - expense.b),
    expenseCategories: compareCategories(expensesA, expensesB),
    incomeCategories: compareCategories(incomesA, incomesB),
  };
};
