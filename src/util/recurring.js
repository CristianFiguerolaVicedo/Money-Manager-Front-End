// Recurring incomes/expenses (F9): labels and the "next date" preview shown in the form

export const FREQUENCIES = [
  { value: "none", label: "No se repite" },
  { value: "weekly", label: "Cada semana" },
  { value: "monthly", label: "Cada mes" },
  { value: "yearly", label: "Cada año" },
];

export const frequencyLabel = (frequency) =>
  ({ weekly: "Cada semana", monthly: "Cada mes", yearly: "Cada año" })[frequency] || frequency;

// Same rule as the backend: occurrences are counted from the start date, so the 31st becomes
// the last day in shorter months and goes back to the 31st afterwards. Dates are "YYYY-MM-DD".
export const occurrence = (start, frequency, k) => {
  const [y, m, d] = start.split("-").map(Number);
  let date;
  if (frequency === "weekly") {
    date = new Date(Date.UTC(y, m - 1, d + 7 * k));
  } else {
    const months = frequency === "yearly" ? 12 * k : k;
    const target = new Date(Date.UTC(y, m - 1 + months, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    date = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, lastDay)));
  }
  return date.toISOString().slice(0, 10);
};

// How many occurrences fall between start and `until` (inclusive) — e.g. how many movements a past start date creates now
export const countOccurrencesUntil = (start, frequency, until, max = 500) => {
  if (!start || !frequency || frequency === "none" || start > until) return 0;
  let k = 0;
  while (k < max && occurrence(start, frequency, k) <= until) k++;
  return k;
};
