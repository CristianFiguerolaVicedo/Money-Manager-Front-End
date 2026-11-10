import { foldSmallGroups, formatCurrency } from "../util/util";
import { chartColors } from "./chartColors";
import useDarkTheme from "../hooks/useDarkTheme";

// Ranked list of categories with a proportional bar (easier to compare than a pie)
// items: [{ key, name, icon, amount }]
const CategoryBreakdown = ({ title, subtitle, items = [], emptyText, className = "" }) => {
  const colors = chartColors(useDarkTheme());
  const groups = foldSmallGroups(items.filter((item) => Number(item.amount) > 0), 6);
  const total = groups.reduce((sum, item) => sum + Number(item.amount), 0);
  const max = groups.reduce((top, item) => Math.max(top, Number(item.amount)), 0);

  return (
    <div className={`p-4 bg-white rounded-2xl border border-gray-200 ${className}`}>
      <h2 className="text-lg">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}

      {groups.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {groups.map((item) => {
            const amount = Number(item.amount);
            const share = total > 0 ? Math.round((amount / total) * 100) : 0;
            return (
              <li key={item.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 min-w-0 text-gray-700">
                    {item.icon && <img src={item.icon} alt="" className="w-5 h-5 shrink-0" />}
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="shrink-0 text-gray-800 font-medium">
                    {formatCurrency(amount)} <span className="text-xs text-gray-400 font-normal">· {share}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-purple-100">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${max > 0 ? Math.max((amount / max) * 100, 2) : 0}%`, backgroundColor: colors.single }}
                  />
                </div>
              </li>
            );
          })}
          <li className="flex justify-between pt-3 border-t border-gray-100 text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-semibold text-gray-800">{formatCurrency(total)}</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default CategoryBreakdown;
