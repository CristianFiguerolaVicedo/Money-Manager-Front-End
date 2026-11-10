import { test } from "node:test";
import assert from "node:assert/strict";
import { compareMonths, diff } from "../compare.js";
import { goalStatusText } from "../goals.js";

const plain = (text) => text.replace(/\s/g, " ");

test("diff gives change and percentage", () => {
  assert.deepEqual(diff(100, 150), { a: 100, b: 150, diff: 50, pct: 50 });
  assert.deepEqual(diff(200, 150), { a: 200, b: 150, diff: -50, pct: -25 });
  assert.equal(diff(0, 30).pct, null);
});

test("compareMonths totals, balance and categories from both months", () => {
  const result = compareMonths({
    incomesA: [{ amount: 1800, categoryId: 9, categoryName: "Nómina" }],
    expensesA: [
      { amount: 300, categoryId: 1, categoryName: "Comida" },
      { amount: 50, categoryId: 2, categoryName: "Ocio" },
    ],
    incomesB: [{ amount: "2000", categoryId: 9, categoryName: "Nómina" }],
    expensesB: [
      { amount: 250, categoryId: 1, categoryName: "Comida" },
      { amount: 120, categoryId: 3, categoryName: "Viajes" },
    ],
  });
  assert.equal(result.income.diff, 200);
  assert.equal(result.expense.a, 350);
  assert.equal(result.expense.b, 370);
  assert.deepEqual([result.balance.a, result.balance.b], [1450, 1630]);
  assert.deepEqual(
    result.expenseCategories.map((c) => [c.name, c.a, c.b]),
    [["Comida", 300, 250], ["Viajes", 0, 120], ["Ocio", 50, 0]]
  );
  assert.equal(result.expenseCategories[1].pct, null);
});

test("goalStatusText explains the goal", () => {
  assert.equal(goalStatusText({ achieved: true }), "¡Objetivo conseguido!");
  assert.equal(goalStatusText({ achieved: false, deadline: "2026-01-01", monthsLeft: 0 }), "La fecha límite ya ha pasado");
  assert.equal(
    plain(goalStatusText({ achieved: false, deadline: "2027-02-01", monthsLeft: 4, monthlyNeeded: 150 })),
    "Ahorra 150,00 € al mes durante 4 meses para llegar a tiempo"
  );
  assert.equal(plain(goalStatusText({ achieved: false, remainingAmount: 600 })), "Te faltan 600,00 €");
});
