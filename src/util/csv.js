// CSV import (F12): everything is parsed in the browser, then clean rows are sent to POST /import.

// Picks the delimiter that splits the first rows most consistently into 2+ columns
// (; is common in Spanish bank exports). Uses the real parser, so quoted newlines don't confuse it.
export const detectDelimiter = (text) => {
  const sample = (text || "").replace(/^\uFEFF/, "").slice(0, 4000);
  let best = ",";
  let bestScore = 0;
  for (const delimiter of [";", ",", "\t", "|"]) {
    const counts = parseCsv(sample, delimiter).rows.slice(0, 5).map((row) => row.length);
    if (!counts.length) continue;
    const consistent = counts.every((count) => count === counts[0]);
    const score = consistent && counts[0] > 1 ? counts[0] : 0;
    if (score > bestScore) {
      best = delimiter;
      bestScore = score;
    }
  }
  return best;
};

// Full parser: quotes, escaped quotes, newlines inside quotes, CRLF and a UTF-8 BOM
export const parseCsv = (input, delimiter = null) => {
  const text = (input || "").replace(/^\uFEFF/, "");
  const sep = delimiter || detectDelimiter(text);
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === sep) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return { delimiter: sep, rows: rows.filter((r) => r.some((cell) => cell.trim() !== "")) };
};

// "1.234,56 €" -> 1234.56 · "-12,30" -> -12.3 · "1,234.56" -> 1234.56 · "(45,00)" -> -45 · null when not a number
export const parseAmount = (value) => {
  if (value == null) return null;
  let text = String(value).trim().replace(/[€$£\s\u00a0]/g, "").replace(/EUR$/i, "");
  if (!text) return null;
  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }
  if (text.startsWith("-")) {
    negative = !negative;
    text = text.slice(1);
  } else if (text.startsWith("+")) {
    text = text.slice(1);
  }
  if (text.endsWith("-")) {
    negative = !negative;
    text = text.slice(0, -1);
  }
  if (!/^[\d.,]+$/.test(text)) return null;
  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  let normalized;
  if (lastComma > -1 && lastDot > -1) {
    // Both: the last one is the decimal separator
    normalized = lastComma > lastDot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  } else if (lastComma > -1) {
    const decimals = text.length - lastComma - 1;
    const commas = (text.match(/,/g) || []).length;
    normalized = commas === 1 && decimals !== 3 ? text.replace(",", ".") : text.replace(/,/g, "");
  } else if (lastDot > -1) {
    // Spanish style "1.234" / "1.234.567" are thousands; "12.5" or "12.50" are decimals
    normalized = /^\d{1,3}(\.\d{3})+$/.test(text) ? text.replace(/\./g, "") : text;
  } else {
    normalized = text;
  }
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  return Math.round((negative ? -number : number) * 100) / 100;
};

// "05/10/2026", "5-10-26", "2026-10-05", "05.10.2026" -> "2026-10-05" (day first, as in Spain); null when invalid
export const parseDate = (value) => {
  const text = String(value ?? "").trim().split(/[ T]/)[0];
  let year;
  let month;
  let day;
  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(text);
  if (match) {
    [, year, month, day] = match.map(Number);
  } else {
    match = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/.exec(text);
    if (!match) return null;
    [, day, month, year] = match.map(Number);
    if (year < 100) year += 2000;
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const COLUMN_NAMES = {
  date: ["fecha", "fecha operacion", "fecha valor", "date", "dia"],
  name: ["concepto", "descripcion", "nombre", "detalle", "name", "description", "movimiento"],
  amount: ["importe", "cantidad", "monto", "amount", "valor", "importe (eur)", "importe eur"],
  category: ["categoria", "category", "tipo de gasto"],
  note: ["nota", "notas", "observaciones", "comentario", "note", "notes"],
};

// Best guess of which column holds each field: { date: 0, name: 1, amount: 2, category: -1, note: -1 }
export const guessColumns = (headers = []) => {
  const names = headers.map(normalize);
  const mapping = {};
  for (const [field, candidates] of Object.entries(COLUMN_NAMES)) {
    let index = names.findIndex((name) => candidates.includes(name));
    if (index === -1) index = names.findIndex((name) => candidates.some((candidate) => name.startsWith(candidate)));
    mapping[field] = index;
  }
  return mapping;
};

/**
 * Turns parsed CSV rows into import rows.
 * mode: "expense" | "income" | "sign" (negative amounts are expenses, positive are incomes)
 * Returns { income: [...], expense: [...], errors: [{ line, message }] } — line is the line in the file.
 */
export const buildImportRows = (dataRows, mapping, { mode, defaultCategory = "", firstLine = 2 }) => {
  const result = { income: [], expense: [], errors: [] };
  dataRows.forEach((cells, index) => {
    const line = firstLine + index;
    const get = (field) => (mapping[field] >= 0 ? (cells[mapping[field]] ?? "").trim() : "");
    const date = parseDate(get("date"));
    const name = get("name");
    const amount = parseAmount(get("amount"));
    const category = get("category") || defaultCategory.trim();
    const note = get("note");

    let message = null;
    if (!date) message = `fecha no válida («${get("date")}»)`;
    else if (!name) message = "falta el concepto";
    else if (amount == null) message = `importe no válido («${get("amount")}»)`;
    else if (amount === 0) message = "el importe es 0";
    else if (!category) message = "falta la categoría";
    if (message) {
      result.errors.push({ line, message });
      return;
    }

    const type = mode === "sign" ? (amount < 0 ? "expense" : "income") : mode;
    result[type].push({ date, name: name.slice(0, 255), amount: Math.abs(amount), category: category.slice(0, 100), note: note ? note.slice(0, 500) : null, line });
  });
  return result;
};
