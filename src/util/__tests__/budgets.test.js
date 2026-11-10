import { test } from "node:test";
import assert from "node:assert/strict";
import { budgetAlerts, budgetToastMessage, budgetTotals } from "../budgets.js";

const budgets = [
  { categoryId: 1, categoryName: "Comida", amount: 100, spent: 105, percent: 105, status: "over" },
  { categoryId: 2, categoryName: "Ocio", amount: 50, spent: 42, percent: 84, status: "warning" },
  { categoryId: 3, categoryName: "Casa", amount: 500, spent: 100, percent: 20, status: "ok" },
  { categoryId: 4, categoryName: "Otros", amount: null, spent: 30, percent: null, status: "none" },
];

test("budgetAlerts keeps over and warning, worst first", () => {
  assert.deepEqual(budgetAlerts(budgets).map((b) => b.categoryName), ["Comida", "Ocio"]);
  assert.deepEqual(budgetAlerts([]), []);
});

test("budgetTotals only counts categories with a budget", () => {
  assert.deepEqual(budgetTotals(budgets), { budget: 650, spent: 247, count: 3 });
});

test("budgetToastMessage warns only when needed", () => {
  assert.match(budgetToastMessage(budgets[0]), /superado.*Comida/);
  assert.match(budgetToastMessage(budgets[1]), /84 %/);
  assert.equal(budgetToastMessage(budgets[2]), null);
  assert.equal(budgetToastMessage(budgets[3]), null);
  assert.equal(budgetToastMessage(undefined), null);
});
