import { test } from "node:test";
import assert from "node:assert/strict";
import { buildImportRows, detectDelimiter, guessColumns, parseAmount, parseCsv, parseDate } from "../csv.js";

test("parseCsv handles quotes, escaped quotes, newlines, CRLF and BOM", () => {
  const text = '\uFEFFFecha;Concepto;Importe\r\n01/10/2026;"Cena; con ""amigos""";-30,50\r\n02/10/2026;"Línea\nde dos";12\r\n\r\n';
  const { delimiter, rows } = parseCsv(text);
  assert.equal(delimiter, ";");
  assert.deepEqual(rows, [
    ["Fecha", "Concepto", "Importe"],
    ["01/10/2026", 'Cena; con "amigos"', "-30,50"],
    ["02/10/2026", "Línea\nde dos", "12"],
  ]);
});

test("detectDelimiter prefers the consistent one", () => {
  assert.equal(detectDelimiter("a,b,c\n1,2,3"), ",");
  assert.equal(detectDelimiter("fecha;importe\n1/1/2026;1,50"), ";");
  assert.equal(detectDelimiter("a\tb\n1\t2"), "\t");
});

test("parseAmount understands Spanish and English formats", () => {
  assert.equal(parseAmount("1.234,56 €"), 1234.56);
  assert.equal(parseAmount("1,234.56"), 1234.56);
  assert.equal(parseAmount("-12,30"), -12.3);
  assert.equal(parseAmount("12.5"), 12.5);
  assert.equal(parseAmount("1.234"), 1234);
  assert.equal(parseAmount("1,5"), 1.5);
  assert.equal(parseAmount("(45,00)"), -45);
  assert.equal(parseAmount("45,00-"), -45);
  assert.equal(parseAmount("+7"), 7);
  assert.equal(parseAmount("abc"), null);
  assert.equal(parseAmount(""), null);
});

test("parseDate reads day-first and ISO dates and rejects impossible ones", () => {
  assert.equal(parseDate("05/10/2026"), "2026-10-05");
  assert.equal(parseDate("5-1-26"), "2026-01-05");
  assert.equal(parseDate("2026-10-05"), "2026-10-05");
  assert.equal(parseDate("05.10.2026 10:30"), "2026-10-05");
  assert.equal(parseDate("31/02/2026"), null);
  assert.equal(parseDate("ayer"), null);
});

test("guessColumns matches common Spanish bank headers", () => {
  assert.deepEqual(guessColumns(["Fecha operación", "Concepto", "Importe (EUR)", "Saldo"]), {
    date: 0, name: 1, amount: 2, category: -1, note: -1,
  });
  assert.equal(guessColumns(["Date", "Description", "Amount", "Category", "Notes"]).note, 4);
});

test("buildImportRows splits by sign, uses the default category and reports bad lines", () => {
  const rows = [
    ["01/10/2026", "Nómina", "1.800,00", ""],
    ["02/10/2026", "Super", "-45,20", "Comida"],
    ["xx", "Mal", "1", ""],
    ["03/10/2026", "", "-1", ""],
  ];
  const result = buildImportRows(rows, { date: 0, name: 1, amount: 2, category: 3, note: -1 }, { mode: "sign", defaultCategory: "Varios" });
  assert.deepEqual(result.income.map((r) => [r.name, r.amount, r.category]), [["Nómina", 1800, "Varios"]]);
  assert.deepEqual(result.expense.map((r) => [r.name, r.amount, r.category]), [["Super", 45.2, "Comida"]]);
  assert.deepEqual(result.errors.map((e) => e.line), [4, 5]);
});
