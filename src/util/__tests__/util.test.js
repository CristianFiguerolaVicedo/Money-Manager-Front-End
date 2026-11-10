import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatCurrency,
  formatCurrencyAbs,
  formatAxisCurrency,
  formatDate,
  shiftMonth,
  formatMonthLabel,
  getErrorMessage,
  buildDailySeries,
  groupByCategory,
  foldSmallGroups,
  getCurrentMonth,
  getTodayLocalDate,
} from "../util.js";

// Intl uses non-breaking spaces before "€"; compare with normal spaces
const plain = (text) => text.replace(/\s/g, " ");

test("formatCurrency uses Spanish format with thousands separator", () => {
  assert.equal(plain(formatCurrency(1234.5)), "1.234,50 €");
  assert.equal(plain(formatCurrency(1000000)), "1.000.000,00 €");
  assert.equal(plain(formatCurrency("12.3")), "12,30 €");
});

test("formatCurrency treats missing or invalid values as 0", () => {
  assert.equal(plain(formatCurrency(null)), "0,00 €");
  assert.equal(plain(formatCurrency(undefined)), "0,00 €");
  assert.equal(plain(formatCurrency("abc")), "0,00 €");
});

test("formatCurrencyAbs is always positive", () => {
  assert.equal(plain(formatCurrencyAbs(-2500)), "2.500,00 €");
});

test("formatAxisCurrency drops decimals when not needed", () => {
  assert.equal(plain(formatAxisCurrency(1500)), "1.500 €");
});

test("formatDate shows dd/mm/yyyy without time zone shifts", () => {
  assert.equal(formatDate("2026-10-05"), "05/10/2026");
  assert.equal(formatDate("2026-01-01"), "01/01/2026");
  assert.equal(formatDate(""), "");
  assert.equal(formatDate(null), "");
});

test("shiftMonth moves across years", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-05", 0), "2026-05");
});

test("formatMonthLabel is capitalised Spanish", () => {
  assert.equal(formatMonthLabel("2026-10"), "Octubre de 2026");
});

test("getErrorMessage prefers the backend message", () => {
  assert.equal(getErrorMessage({ response: { data: { message: "Email ya registrado" } } }, "x"), "Email ya registrado");
  assert.equal(getErrorMessage(new Error("network"), "Sin conexión"), "Sin conexión");
  assert.equal(getErrorMessage(undefined, "Sin conexión"), "Sin conexión");
});

test("buildDailySeries has one entry per day, with zeros for empty days", () => {
  const series = buildDailySeries(
    [
      { date: "2026-02-03", amount: 10, categoryName: "Comida" },
      { date: "2026-02-03", amount: "2.5", categoryName: "Ocio" },
      { date: "2026-02-28", amount: 4 },
      { date: "2026-03-01", amount: 99 }, // another month: ignored
    ],
    "2026-02"
  );
  assert.equal(series.length, 28);
  assert.deepEqual(series[2], { day: 3, date: "2026-02-03", total: 12.5, items: series[2].items });
  assert.equal(series[2].items.length, 2);
  assert.equal(series[0].total, 0);
  assert.equal(series[27].total, 4);
  assert.equal(buildDailySeries([], "2024-02").length, 29); // leap year
});

test("groupByCategory sums per category, biggest first", () => {
  const groups = groupByCategory([
    { categoryId: 1, categoryName: "Comida", amount: 10 },
    { categoryId: 2, categoryName: "Ocio", amount: 30 },
    { categoryId: 1, categoryName: "Comida", amount: "5" },
  ]);
  assert.deepEqual(groups.map((g) => [g.name, g.amount]), [["Ocio", 30], ["Comida", 15]]);
});

test("foldSmallGroups keeps the biggest and folds the rest into Otras", () => {
  const groups = [50, 40, 30, 20, 10, 5, 1].map((amount, i) => ({ key: i, name: `C${i}`, amount }));
  const folded = foldSmallGroups(groups, 4);
  assert.deepEqual(folded.map((g) => [g.name, g.amount]), [["C0", 50], ["C1", 40], ["C2", 30], ["Otras (4)", 36]]);
  assert.equal(foldSmallGroups(groups.slice(0, 3), 4).length, 3);
});

test("formatDate rejects impossible dates", () => {
  assert.equal(formatDate("2026-02-30"), "");
  assert.equal(formatDate("abc"), "");
});

test("shiftMonth handles invalid input and long jumps", () => {
  assert.equal(shiftMonth("2026-10", -13), "2025-09");
  assert.equal(shiftMonth("nope", 1), "nope");
});

test("getTodayLocalDate and getCurrentMonth use local time", () => {
  const now = new Date();
  const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  assert.equal(getCurrentMonth(), expected);
  assert.ok(getTodayLocalDate().startsWith(expected));
});
