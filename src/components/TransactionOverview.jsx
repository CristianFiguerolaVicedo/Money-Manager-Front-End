import { useMemo } from "react";
import { Plus } from "lucide-react";
import DailyBarChart from "./DailyBarChart";
import CategoryBreakdown from "./CategoryBreakdown";
import { btnPrimary } from "./ui";
import { buildDailySeries, formatCurrency, groupByCategory } from "../util/util";

// Monthly overview shared by incomes and expenses: total, bars per day and totals per category
const TransactionOverview = ({ config, transactions, month, onAdd }) => {
  const dailyData = useMemo(() => buildDailySeries(transactions, month), [transactions, month]);
  const byCategory = useMemo(() => groupByCategory(transactions), [transactions]);
  const total = useMemo(
    () => (transactions || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [transactions]
  );
  const hasData = (transactions || []).length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-4 bg-white rounded-2xl border border-gray-200 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">{config.overviewTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{config.overviewSubtitle}</p>
            <p className="text-sm text-gray-700 mt-2">
              Total del mes: <span className="font-semibold">{formatCurrency(total)}</span>
            </p>
          </div>
          <button
            onClick={onAdd}
            className={btnPrimary}
          >
            <Plus size={15} className="text-lg" /> {config.labels.add}
          </button>
        </div>

        <div className="mt-6">
          {hasData ? (
            <DailyBarChart data={dailyData} />
          ) : (
            <p className="text-sm text-gray-500 py-12 text-center">{config.labels.empty}</p>
          )}
        </div>
      </div>

      <CategoryBreakdown
        title="Por categoría"
        subtitle="Total del mes en cada categoría"
        items={byCategory}
        emptyText="Sin movimientos este mes"
      />
    </div>
  );
};

export default TransactionOverview;
