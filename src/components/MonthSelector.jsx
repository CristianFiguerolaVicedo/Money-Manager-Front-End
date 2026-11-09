import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel, getCurrentMonth, shiftMonth } from "../util/util";

// "◀ Octubre de 2026 ▶" — months are "YYYY-MM" strings
const MonthSelector = ({ month, onChange, disabled = false }) => {
  const currentMonth = getCurrentMonth();
  const isCurrent = month >= currentMonth;

  const buttonClass =
    "w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 " +
    "hover:bg-purple-50 hover:text-purple-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Mes anterior"
          className={buttonClass}
          disabled={disabled}
          onClick={() => onChange(shiftMonth(month, -1))}
        >
          <ChevronLeft size={18} />
        </button>

        <span className="min-w-[170px] text-center font-medium text-gray-800" aria-live="polite">
          {formatMonthLabel(month)}
        </span>

        <button
          type="button"
          aria-label="Mes siguiente"
          className={buttonClass}
          disabled={disabled || isCurrent}
          onClick={() => onChange(shiftMonth(month, 1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!isCurrent && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(currentMonth)}
          className="text-sm font-medium text-purple-800 hover:underline cursor-pointer disabled:opacity-40"
        >
          Volver al mes actual
        </button>
      )}
    </div>
  );
};

export default MonthSelector;
