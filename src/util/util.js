import moment from "moment";

const LOCALE = "es-ES";

const euroFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always", // "1.234,50 €" (Spanish locale skips the dot for 4-digit numbers by default)
});

const numberFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  useGrouping: "always",
});

// 1234.5 -> "1.234,50 €"
export const formatCurrency = (num) => {
  const value = Number(num);
  if (num == null || Number.isNaN(value)) return euroFormatter.format(0);
  return euroFormatter.format(value);
};

// Same as formatCurrency but always positive, for "+ 1.234,50 €" / "- 1.234,50 €" badges
export const formatCurrencyAbs = (num) => formatCurrency(Math.abs(Number(num) || 0));

// Compact axis labels: 1500 -> "1.500 €"
export const formatAxisCurrency = (num) => `${numberFormatter.format(Number(num) || 0)} €`;

// Kept for compatibility: plain number with Spanish separators (1.234,5)
export const addThousandSeparator = (num) => {
  if (num == null || isNaN(num)) return "";
  return numberFormatter.format(Number(num));
};

// "2026-10-05" -> "05/10/2026" (parsed as a local date, never shifted by time zones)
export const formatDate = (date) => {
  if (!date) return "";
  const parsed = moment(date, "YYYY-MM-DD");
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
};

// "2026-10-05" -> "5 oct"
export const formatShortDate = (date) => {
  const parsed = moment(date, "YYYY-MM-DD");
  if (!parsed.isValid()) return "";
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" })
    .format(parsed.toDate())
    .replace(".", "");
};

// Month helpers for the month selector ("2026-10" <-> "octubre de 2026")
export const getCurrentMonth = () => moment().format("YYYY-MM");

export const shiftMonth = (month, delta) =>
  moment(month, "YYYY-MM").add(delta, "months").format("YYYY-MM");

export const formatMonthLabel = (month) => {
  const label = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" })
    .format(moment(month, "YYYY-MM").toDate());
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// Today's date as YYYY-MM-DD in the user's local timezone.
// (new Date().toISOString() is UTC, which is the wrong day around midnight in Spain.)
export const getTodayLocalDate = () => moment().format("YYYY-MM-DD");

// Best human-readable message from an axios error
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again") =>
  error?.response?.data?.message || fallback;

// One entry per day of the month (days without movements are 0), for the daily bar chart.
// "2026-10" + transactions -> [{ day: 1, date: "2026-10-01", total: 0, items: [] }, ...]
export const buildDailySeries = (transactions = [], month) => {
  const start = moment(month, "YYYY-MM");
  if (!start.isValid()) return [];
  const days = start.daysInMonth();
  const series = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    date: `${month}-${String(index + 1).padStart(2, "0")}`,
    total: 0,
    items: [],
  }));
  transactions.forEach((item) => {
    if (!item?.date || !item.date.startsWith(month)) return;
    const entry = series[Number(item.date.slice(8, 10)) - 1];
    if (!entry) return;
    entry.total += Number(item.amount) || 0;
    entry.items.push(item);
  });
  return series;
};

// Totals per category, biggest first: [{ key, name, icon, amount }]
export const groupByCategory = (transactions = []) => {
  const groups = new Map();
  transactions.forEach((item) => {
    const key = item.categoryId ?? item.categoryName ?? "none";
    const group = groups.get(key) || { key, name: item.categoryName || "Sin categoría", icon: item.categoryIcon, amount: 0 };
    group.amount += Number(item.amount) || 0;
    groups.set(key, group);
  });
  return [...groups.values()].sort((a, b) => b.amount - a.amount);
};

// Keeps the biggest `max - 1` groups and folds the rest into "Otras" (so a long tail never crowds the list)
export const foldSmallGroups = (groups = [], max = 6) => {
  if (groups.length <= max) return groups;
  const kept = groups.slice(0, max - 1);
  const rest = groups.slice(max - 1);
  return [
    ...kept,
    { key: "others", name: `Otras (${rest.length})`, amount: rest.reduce((sum, group) => sum + group.amount, 0) },
  ];
};
