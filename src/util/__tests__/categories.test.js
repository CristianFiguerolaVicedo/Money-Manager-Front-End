import { test } from "node:test";
import assert from "node:assert/strict";
import { categoryOptions, categoryTree, hasSubcategories, parentCandidates } from "../categories.js";

const cats = [
  { id: 1, name: "Transporte", type: "expense", parentId: null },
  { id: 2, name: "Comida", type: "expense", parentId: null },
  { id: 3, name: "Supermercado", type: "expense", parentId: 2 },
  { id: 4, name: "Bares", type: "expense", parentId: 2 },
  { id: 5, name: "Nómina", type: "income", parentId: null },
];

test("main categories in order, each followed by its subcategories", () => {
  assert.deepEqual(categoryTree(cats).map((c) => [c.name, c.depth]), [
    ["Comida", 0], ["Bares", 1], ["Supermercado", 1], ["Nómina", 0], ["Transporte", 0],
  ]);
});

test("a subcategory without its parent in the list is shown as main", () => {
  assert.deepEqual(categoryTree([cats[2]]).map((c) => c.depth), [0]);
});

test("select options indent subcategories", () => {
  const options = categoryOptions(cats);
  assert.equal(options[0].label, "Comida");
  assert.match(options[1].label, /↳ Bares$/);
  assert.equal(options[1].value, 4);
});

test("only main categories of the same type, other than itself, can be parents", () => {
  assert.deepEqual(parentCandidates(cats, { id: 1, type: "expense" }).map((c) => c.id), [2]);
  assert.deepEqual(parentCandidates(cats, { type: "income" }).map((c) => c.id), [5]);
  assert.equal(hasSubcategories(cats, 2), true);
  assert.equal(hasSubcategories(cats, 1), false);
});
