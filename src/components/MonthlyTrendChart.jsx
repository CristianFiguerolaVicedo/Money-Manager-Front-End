import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAxisCurrency, formatCurrency, formatMonthLabel } from "../util/util";
import { CHART_COLORS } from "./chartColors";

const shortMonth = (month) =>
  new Intl.DateTimeFormat("es-ES", { month: "short" })
    .format(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1))
    .replace(".", "");

const SERIES = [
  { key: "income", label: "Ingresos", color: CHART_COLORS.income },
  { key: "expense", label: "Gastos", color: CHART_COLORS.expense },
];

const MonthTotals = ({ row }) => {
  const balance = Number(row.balance) || 0;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
      <span className="font-medium text-gray-800">{formatMonthLabel(row.month)}</span>
      {SERIES.map((series) => (
        <span key={series.key} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: series.color }} />
          {series.label}: <span className="font-semibold text-gray-800">{formatCurrency(row[series.key])}</span>
        </span>
      ))}
      <span>
        Saldo:{" "}
        <span className={`font-semibold ${balance < 0 ? "text-red-800" : "text-gray-800"}`}>{formatCurrency(balance)}</span>
      </span>
    </div>
  );
};

const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-md rounded-lg p-3 border border-gray-200">
      <MonthTotals row={payload[0].payload} />
    </div>
  );
};

// Income vs expenses of the last months (grouped bars) with the hovered month's totals written out below
const MonthlyTrendChart = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const rows = data.map((row) => ({ ...row, income: Number(row.income) || 0, expense: Number(row.expense) || 0 }));
  const hasData = rows.some((row) => row.income > 0 || row.expense > 0);
  const shown = rows[activeIndex ?? rows.length - 1];

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h5 className="text-lg">Ingresos y gastos</h5>
          <p className="text-xs text-gray-400 mt-0.5">Últimos {rows.length} meses</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600" aria-hidden="true">
          {SERIES.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: series.color }} />
              {series.label}
            </span>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="text-sm text-gray-500 py-12 text-center">
          Aún no hay movimientos en los últimos meses. Cuando añadas ingresos o gastos verás aquí su evolución.
        </p>
      ) : (
        <>
          <div className="mt-4" role="img" aria-label="Gráfica de barras de ingresos y gastos por mes">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={rows}
                barGap={2}
                barCategoryGap="28%"
                onMouseMove={(state) => state?.activeTooltipIndex != null && setActiveIndex(Number(state.activeTooltipIndex))}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" tickFormatter={shortMonth} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<TrendTooltip />} cursor={{ fill: "rgba(126, 34, 206, 0.06)" }} />
                {SERIES.map((series) => (
                  <Bar key={series.key} dataKey={series.key} name={series.label} fill={series.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {shown && (
            <div className="mt-2 pt-3 border-t border-gray-100" aria-live="polite">
              <MonthTotals row={shown} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyTrendChart;
