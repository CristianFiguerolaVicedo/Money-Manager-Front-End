import { test } from "node:test";
import assert from "node:assert/strict";
import { countOccurrencesUntil, frequencyLabel, occurrence } from "../recurring.js";

test("monthly occurrences keep the day of month when it exists", () => {
  assert.equal(occurrence("2026-01-31", "monthly", 1), "2026-02-28");
  assert.equal(occurrence("2026-01-31", "monthly", 2), "2026-03-31");
  assert.equal(occurrence("2026-11-15", "monthly", 2), "2027-01-15");
});

test("weekly and yearly occurrences", () => {
  assert.equal(occurrence("2026-12-28", "weekly", 1), "2027-01-04");
  assert.equal(occurrence("2024-02-29", "yearly", 1), "2025-02-28");
  assert.equal(occurrence("2024-02-29", "yearly", 4), "2028-02-29");
});

test("countOccurrencesUntil counts past occurrences including today", () => {
  assert.equal(countOccurrencesUntil("2026-09-10", "monthly", "2026-11-10"), 3);
  assert.equal(countOccurrencesUntil("2026-11-11", "monthly", "2026-11-10"), 0);
  assert.equal(countOccurrencesUntil("2026-11-10", "none", "2026-11-10"), 0);
  assert.equal(countOccurrencesUntil("2026-10-20", "weekly", "2026-11-10"), 4);
});

test("frequencyLabel", () => {
  assert.equal(frequencyLabel("monthly"), "Cada mes");
});
