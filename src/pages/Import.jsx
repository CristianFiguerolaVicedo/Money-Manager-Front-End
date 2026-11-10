import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CircleCheck, FileUp, LoaderCircle, TriangleAlert } from "lucide-react";
import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { buildImportRows, guessColumns, parseCsv } from "../util/csv";
import { formatCurrency, formatDate, getErrorMessage } from "../util/util";

const MAX_BYTES = 2 * 1024 * 1024;
const FIELDS = [
  { key: "date", label: "Fecha", required: true },
  { key: "name", label: "Concepto", required: true },
  { key: "amount", label: "Importe", required: true },
  { key: "category", label: "Categoría", required: false },
  { key: "note", label: "Nota", required: false },
];
const MODES = [
  { value: "expense", label: "Todo son gastos" },
  { value: "income", label: "Todo son ingresos" },
  { value: "sign", label: "Según el signo (negativo = gasto, positivo = ingreso)" },
];

const selectClass = "w-full border border-gray-300 rounded-md py-2 px-3 bg-transparent text-gray-700 focus:outline-none focus:border-blue-500";
const card = "p-5 bg-white rounded-2xl border border-gray-200";

// Bank exports are often Windows-1252: if UTF-8 decoding produces replacement characters, retry with it
const readText = async (file) => {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  return utf8.includes("�") ? new TextDecoder("windows-1252").decode(buffer) : utf8;
};

const Import = () => {
  useUser();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(["income", "expense", "sign"].includes(searchParams.get("type")) ? searchParams.get("type") : "expense");
  const [fileName, setFileName] = useState("");
  const [table, setTable] = useState(null); // { delimiter, rows }
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState({ date: -1, name: -1, amount: -1, category: -1, note: -1 });
  const [defaultCategory, setDefaultCategory] = useState("");
  const [createCategories, setCreateCategories] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosConfig
      .get(API_ENDPOINTS.GET_ALL_CATEGORIES)
      .then((response) => setCategories(response.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleFile = async (file) => {
    setResult(null);
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("El archivo pasa de 2 MB");
      return;
    }
    try {
      const parsed = parseCsv(await readText(file));
      if (parsed.rows.length === 0) {
        toast.error("El archivo está vacío");
        return;
      }
      setFileName(file.name);
      setTable(parsed);
      const guessed = guessColumns(parsed.rows[0]);
      const looksLikeHeader = guessed.date >= 0 || guessed.amount >= 0 || guessed.name >= 0;
      setHasHeader(looksLikeHeader);
      setMapping(looksLikeHeader ? guessed : { date: 0, name: 1, amount: 2, category: -1, note: -1 });
    } catch {
      toast.error("No se ha podido leer el archivo");
    }
  };

  const columnCount = table ? Math.max(...table.rows.map((row) => row.length)) : 0;
  const columnNames = table
    ? Array.from({ length: columnCount }, (_, i) => (hasHeader ? table.rows[0][i] || `Columna ${i + 1}` : `Columna ${i + 1}`))
    : [];
  const dataRows = useMemo(() => (table ? table.rows.slice(hasHeader ? 1 : 0) : []), [table, hasHeader]);
  const missingRequired = FIELDS.filter((f) => f.required && mapping[f.key] < 0);

  const built = useMemo(
    () => (table && missingRequired.length === 0
      ? buildImportRows(dataRows, mapping, { mode, defaultCategory, firstLine: hasHeader ? 2 : 1 })
      : null),
    [table, dataRows, mapping, mode, defaultCategory, hasHeader, missingRequired.length]
  );
  const validCount = built ? built.income.length + built.expense.length : 0;
  const preview = built ? [...built.expense.map((r) => ({ ...r, type: "expense" })), ...built.income.map((r) => ({ ...r, type: "income" }))].sort((a, b) => a.line - b.line).slice(0, 8) : [];
  const categorySuggestions = categories.filter((c) => mode === "sign" || c.type === mode);

  const handleImport = async () => {
    if (!built || validCount === 0) return;
    setImporting(true);
    const summary = { created: 0, skipped: 0, newCategories: [] };
    try {
      for (const type of ["expense", "income"]) {
        if (built[type].length === 0) continue;
        const response = await axiosConfig.post(API_ENDPOINTS.IMPORT, {
          type,
          rows: built[type].map((row) => {
            const clean = { ...row };
            delete clean.line;
            return clean;
          }),
          createMissingCategories: createCategories,
          skipDuplicates,
        });
        summary.created += response.data.created;
        summary.skipped += response.data.skippedDuplicates;
        summary.newCategories.push(...response.data.createdCategories);
      }
      setResult(summary);
      toast.success(`${summary.created} movimientos importados`);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido importar"), { duration: 8000 });
      if (summary.created > 0) setResult(summary);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dashboard activeMenu="Import">
      <div className="my-5 mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Importar desde CSV</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Sube el CSV que exporta tu banco u otra app. Antes de guardar nada verás cómo quedan los movimientos.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <section className={card} aria-labelledby="import-step-1">
            <h3 id="import-step-1" className="font-semibold text-gray-800">1. Elige el archivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="import-mode" className="block text-[13px] text-gray-700 mb-1">¿Qué contiene?</label>
                <select id="import-mode" value={mode} onChange={(e) => setMode(e.target.value)} className={selectClass}>
                  {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="import-file" className="block text-[13px] text-gray-700 mb-1">Archivo CSV (máx. 2 MB)</label>
                <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-md py-2 px-3 text-gray-600 cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-purple-300">
                  <FileUp size={18} className="text-purple-800" />
                  <span className="truncate">{fileName || "Seleccionar archivo…"}</span>
                  <input id="import-file" type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </section>

          {table && (
            <section className={card} aria-labelledby="import-step-2">
              <h3 id="import-step-2" className="font-semibold text-gray-800">2. Indica qué es cada columna</h3>
              <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="accent-purple-800" />
                La primera fila son los nombres de las columnas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                {FIELDS.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`map-${field.key}`} className="block text-[13px] text-gray-700 mb-1">
                      {field.label}{field.required ? " *" : ""}
                    </label>
                    <select
                      id={`map-${field.key}`}
                      value={mapping[field.key]}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                      className={selectClass}
                    >
                      <option value={-1}>— Ninguna —</option>
                      {columnNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="default-category" className="block text-[13px] text-gray-700 mb-1">
                    Categoría para las filas que no traen una
                  </label>
                  <input
                    id="default-category"
                    list="import-categories"
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    placeholder="p. ej., Varios"
                    className={selectClass}
                  />
                  <datalist id="import-categories">
                    {categorySuggestions.map((c) => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div className="flex flex-col justify-end gap-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={createCategories} onChange={(e) => setCreateCategories(e.target.checked)} className="accent-purple-800" />
                    Crear las categorías que no existan
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} className="accent-purple-800" />
                    Saltar los que ya tengo (misma fecha, concepto e importe)
                  </label>
                </div>
              </div>
              {missingRequired.length > 0 && (
                <p className="mt-4 text-sm text-amber-800">Falta indicar: {missingRequired.map((f) => f.label.toLowerCase()).join(", ")}.</p>
              )}
            </section>
          )}

          {built && (
            <section className={card} aria-labelledby="import-step-3">
              <h3 id="import-step-3" className="font-semibold text-gray-800">3. Revisa y confirma</h3>
              <p className="text-sm text-gray-600 mt-2" aria-live="polite">
                {built.expense.length} gastos y {built.income.length} ingresos listos para importar
                {built.errors.length > 0 && <> · <span className="text-amber-800">{built.errors.length === 1 ? "1 fila se saltará" : `${built.errors.length} filas se saltarán`} por errores</span></>}
              </p>

              {preview.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Primeras filas que se importarán</caption>
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th scope="col" className="py-2 pr-3 font-normal">Fecha</th>
                        <th scope="col" className="py-2 pr-3 font-normal">Concepto</th>
                        <th scope="col" className="py-2 pr-3 font-normal">Categoría</th>
                        <th scope="col" className="py-2 font-normal text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row) => (
                        <tr key={row.line} className="border-t border-gray-100">
                          <td className="py-2 pr-3 whitespace-nowrap text-gray-600">{formatDate(row.date)}</td>
                          <td className="py-2 pr-3 text-gray-800">{row.name}</td>
                          <td className="py-2 pr-3 text-gray-600">{row.category}</td>
                          <td className={`py-2 text-right whitespace-nowrap ${row.type === "expense" ? "text-red-800" : "text-green-800"}`}>
                            {row.type === "expense" ? "−" : "+"}{formatCurrency(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {validCount > preview.length && <p className="text-xs text-gray-500 mt-2">… y {validCount - preview.length} más</p>}
                </div>
              )}

              {built.errors.length > 0 && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-amber-800 flex items-center gap-1.5">
                    <TriangleAlert size={15} /> Ver filas con errores
                  </summary>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    {built.errors.slice(0, 20).map((e) => <li key={e.line}>Línea {e.line}: {e.message}</li>)}
                    {built.errors.length > 20 && <li>… y {built.errors.length - 20} más</li>}
                  </ul>
                </details>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || validCount === 0}
                  className="flex items-center gap-2 bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {importing && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  Importar {validCount} movimientos
                </button>
              </div>
            </section>
          )}

          {result && (
            <section className={`${card} border-green-200`} aria-live="polite">
              <div className="flex items-start gap-3">
                <CircleCheck className="w-6 h-6 text-green-700 shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-800">Importación terminada</p>
                  <p className="mt-1">
                    {result.created} movimientos nuevos
                    {result.skipped > 0 && ` · ${result.skipped} ya los tenías y se han saltado`}
                    {result.newCategories.length > 0 && ` · categorías creadas: ${result.newCategories.join(", ")}`}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <Link to="/expense" className="font-semibold text-purple-800 underline">Ver gastos</Link>
                    <Link to="/income" className="font-semibold text-purple-800 underline">Ver ingresos</Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </Dashboard>
  );
};

export default Import;
