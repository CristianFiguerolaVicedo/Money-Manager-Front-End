import { useMemo } from "react";
import { Plus } from "lucide-react";
import CustomLineChart from "./CustomLineChart";
import { formatCurrency, prepareIncomeLineChartData } from "../util/util";

// Monthly chart shared by incomes and expenses
const TransactionOverview = ({ config, transactions, onAdd }) => {
  const chartData = useMemo(() => prepareIncomeLineChartData(transactions), [transactions]);
  const total = useMemo(
    () => (transactions || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [transactions]
  );

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h5 className="text-lg">{config.overviewTitle}</h5>
          <p className="text-xs text-gray-400 mt-0.5">{config.overviewSubtitle}</p>
          <p className="text-sm text-gray-700 mt-2">
            Total del mes: <span className="font-semibold">{formatCurrency(total)}</span>
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg hover:bg-green-500/30 font-semibold hover:cursor-pointer"
        >
          <Plus size={15} className="text-lg" /> {config.labels.add}
        </button>
      </div>

      <div className="mt-10">
        <CustomLineChart data={chartData} />
      </div>
    </div>
  );
};

export default TransactionOverview;
