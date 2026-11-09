import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAxisCurrency, formatCurrency, formatDate, groupByCategory } from "../util/util";
import { CHART_COLORS } from "./chartColors";

const DayTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;
  const categories = groupByCategory(day.items);
  return (
    <div className="bg-white shadow-md rounded-lg p-3 border border-gray-200 min-w-40">
      <p className="text-sm font-semibold text-gray-800">{formatDate(day.date)}</p>
      <p className="text-sm text-gray-700 mt-1">
        Total: <span className="font-semibold">{formatCurrency(day.total)}</span>
      </p>
      {categories.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5">
          {categories.map((category) => (
            <div key={category.key} className="flex justify-between gap-4 text-xs text-gray-600">
              <span>{category.name}</span>
              <span>{formatCurrency(category.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// One bar per day of the month (empty days included, so gaps are visible instead of interpolated)
const DailyBarChart = ({ data = [] }) => (
  <div role="img" aria-label="Gráfica de barras por día del mes">
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
        <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={80} />
        <Tooltip content={<DayTooltip />} cursor={{ fill: "rgba(126, 34, 206, 0.06)" }} />
        <Bar dataKey="total" fill={CHART_COLORS.single} radius={[4, 4, 0, 0]} maxBarSize={18} minPointSize={0} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default DailyBarChart;
