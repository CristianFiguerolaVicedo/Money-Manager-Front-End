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
  prepareIncomeLineChartData,
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

test("prepareIncomeLineChartData groups by day and sorts by date", () => {
  const data = prepareIncomeLineChartData([
    { date: "2026-10-05", amount: 10 },
    { date: "2026-10-01", amount: "5.5" },
    { date: "2026-10-05", amount: 2 },
  ]);
  assert.deepEqual(data.map((d) => [d.date, d.totalAmount, d.items.length]), [
    ["2026-10-01", 5.5, 1],
    ["2026-10-05", 12, 2],
  ]);
});
