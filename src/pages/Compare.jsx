import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDownRight, ArrowRight, ArrowUpRight, LoaderCircle } from "lucide-react";
import Dashboard from "../components/Dashboard";
import MonthSelector from "../components/MonthSelector";
import useUser from "../hooks/useUser";
import useDarkTheme from "../hooks/useDarkTheme";
import { chartColors } from "../components/chartColors";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { compareMonths } from "../util/compare";
import { formatCurrency, formatMonthLabel, getCurrentMonth, getErrorMessage, shiftMonth } from "../util/util";

// "+12 %" with an arrow; `goodWhenUp` decides the colour (more income is good, more spending is not)
const Change = ({ change, goodWhenUp }) => {
  if (change.diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
        <ArrowRight size={14} aria-hidden="true" /> Sin cambios
      </span>
    );
  }
  const up = change.diff > 0;
  const good = up === goodWhenUp;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${good ? "text-green-800" : "text-red-800"}`}>
      <Icon size={15} aria-hidden="true" />
      {up ? "+" : "−"}
      {formatCurrency(Math.abs(change.diff))}
      {change.pct != null && ` (${up ? "+" : "−"}${Math.abs(change.pct)} %)`}
    </span>
  );
};

const SummaryCard = ({ title, change, goodWhenUp, labelA, labelB }) => (
  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-semibold text-gray-800 mt-1">{formatCurrency(change.b)}</p>
    <p className="text-xs text-gray-500 mt-0.5">
      {labelB} · antes {formatCurrency(change.a)} en {labelA}
    </p>
    <div className="mt-2">
      <Change change={change} goodWhenUp={goodWhenUp} />
    </div>
  </div>
);

// Per-category table with two thin bars per row (month A muted, month B in colour)
const CategoryComparison = ({ title, rows, goodWhenUp, labelA, labelB, colorB }) => {
  const max = rows.reduce((top, row) => Math.max(top, row.a, row.b), 0);
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-lg">{title}</h5>
        <div className="flex items-center gap-4 text-xs text-gray-600" aria-hidden="true">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-gray-300" />{labelA}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm" style={{ backgroundColor: colorB }} />{labelB}</span>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No hay movimientos en ninguno de los dos meses</p>
      ) : (
        <table className="w-full mt-3 text-sm">
          <caption className="sr-only">{title}: {labelA} comparado con {labelB}</caption>
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th scope="col" className="py-2 font-normal">Categoría</th>
              <th scope="col" className="py-2 font-normal text-right">{labelA}</th>
              <th scope="col" className="py-2 font-normal text-right">{labelB}</th>
              <th scope="col" className="py-2 font-normal text-right hidden sm:table-cell">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-gray-100 align-top">
                <th scope="row" className="py-2.5 pr-3 font-normal text-gray-700 text-left">
                  {row.name}
                  <div className="mt-1.5 space-y-1" aria-hidden="true">
                    <div className="h-1.5 rounded-full bg-gray-300" style={{ width: `${max ? (row.a / max) * 100 : 0}%` }} />
                    <div className="h-1.5 rounded-full" style={{ width: `${max ? (row.b / max) * 100 : 0}%`, backgroundColor: colorB }} />
                  </div>
                </th>
                <td className="py-2.5 text-right text-gray-600 whitespace-nowrap">{formatCurrency(row.a)}</td>
                <td className="py-2.5 text-right text-gray-800 font-medium whitespace-nowrap">{formatCurrency(row.b)}</td>
                <td className="py-2.5 pl-2 text-right hidden sm:table-cell whitespace-nowrap">
                  <Change change={row} goodWhenUp={goodWhenUp} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const fetchMonth = async (month) => {
  const [incomes, expenses] = await Promise.all([
    axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOMES, { params: { month } }),
    axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSES, { params: { month } }),
  ]);
  return { incomes: incomes.data || [], expenses: expenses.data || [] };
};

const Compare = () => {
  useUser();
  const colors = chartColors(useDarkTheme());
  const [monthB, setMonthB] = useState(getCurrentMonth());
  const [monthA, setMonthA] = useState(shiftMonth(getCurrentMonth(), -1));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  useEffect(() => {
    const requestId = ++latest.current;
    setLoading(true);
    Promise.all([fetchMonth(monthA), fetchMonth(monthB)])
      .then(([a, b]) => {
        if (requestId === latest.current) {
          setData({ incomesA: a.incomes, expensesA: a.expenses, incomesB: b.incomes, expensesB: b.expenses });
        }
      })
      .catch((error) => {
        if (requestId === latest.current) toast.error(getErrorMessage(error, "No se han podido cargar los meses"));
      })
      .finally(() => {
        if (requestId === latest.current) setLoading(false);
      });
  }, [monthA, monthB]);

  const result = useMemo(() => (data ? compareMonths(data) : null), [data]);
  const labelA = formatMonthLabel(monthA);
  const labelB = formatMonthLabel(monthB);

  return (
    <Dashboard activeMenu="Compare">
      <div className="my-5 mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800">Comparar meses</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Mira en qué ha cambiado tu dinero de un mes a otro.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Mes de referencia</p>
            <MonthSelector month={monthA} onChange={setMonthA} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Comparar con</p>
            <MonthSelector month={monthB} onChange={setMonthB} />
          </div>
        </div>

        {!result ? (
          <div className="flex justify-center py-16 text-gray-400">
            <LoaderCircle className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
            {monthA === monthB && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Has elegido el mismo mes en los dos lados.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard title="Ingresos" change={result.income} goodWhenUp labelA={labelA} labelB={labelB} />
              <SummaryCard title="Gastos" change={result.expense} goodWhenUp={false} labelA={labelA} labelB={labelB} />
              <SummaryCard title="Saldo del mes" change={result.balance} goodWhenUp labelA={labelA} labelB={labelB} />
            </div>
            <CategoryComparison title="Gastos por categoría" rows={result.expenseCategories} goodWhenUp={false} labelA={labelA} labelB={labelB} colorB={colors.expense} />
            <CategoryComparison title="Ingresos por categoría" rows={result.incomeCategories} goodWhenUp labelA={labelA} labelB={labelB} colorB={colors.income} />
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default Compare;
