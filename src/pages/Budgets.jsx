import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CircleAlert, LoaderCircle, Pencil, PiggyBank, Trash2, TriangleAlert } from "lucide-react";
import Dashboard from "../components/Dashboard";
import MonthSelector from "../components/MonthSelector";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { BUDGET_STATUS, budgetTotals } from "../util/budgets";
import { formatCurrency, getCurrentMonth, getErrorMessage } from "../util/util";

const StatusLabel = ({ budget }) => {
  if (budget.status === "over") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-800">
        <CircleAlert size={14} /> {BUDGET_STATUS.over.label}
      </span>
    );
  }
  if (budget.status === "warning") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-800">
        <TriangleAlert size={14} /> {BUDGET_STATUS.warning.label}
      </span>
    );
  }
  return null;
};

// One expense category: progress against its budget, or a button to set one
const BudgetRow = ({ budget, onSave, onRemove }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(budget.amount ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setValue(budget.amount ?? "");
    setEditing(true);
  };

  const save = async () => {
    const amount = Number(String(value).replace(",", "."));
    if (!amount || amount <= 0) {
      toast.error("El presupuesto debe ser un importe mayor que 0");
      return;
    }
    setSaving(true);
    const ok = await onSave(budget.categoryId, amount);
    setSaving(false);
    if (ok) setEditing(false);
  };

  const hasBudget = budget.amount != null;
  const status = BUDGET_STATUS[budget.status] || BUDGET_STATUS.ok;
  const remaining = Number(budget.remaining);

  return (
    <li className="p-4 bg-white rounded-2xl border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
            {budget.icon ? <img src={budget.icon} alt="" className="w-5 h-5" /> : <PiggyBank size={18} className="text-purple-800" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate">{budget.categoryName}</p>
            {hasBudget ? (
              <p className="text-sm text-gray-600">
                {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Sin presupuesto · gastado este mes: {formatCurrency(budget.spent)}
              </p>
            )}
          </div>
        </div>

        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <label className="sr-only" htmlFor={`budget-${budget.categoryId}`}>
              Presupuesto mensual de {budget.categoryName}
            </label>
            <div className="relative">
              <input
                id={`budget-${budget.categoryId}`}
                ref={inputRef}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
                placeholder="p. ej., 300"
                className="w-32 border border-gray-300 rounded-md py-1.5 pl-3 pr-7 text-gray-700 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1 bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-violet-800 cursor-pointer disabled:opacity-60"
            >
              {saving && <LoaderCircle className="w-4 h-4 animate-spin" />} Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              Cancelar
            </button>
          </form>
        ) : hasBudget ? (
          <div className="flex items-center gap-1">
            <button type="button" onClick={startEditing} aria-label={`Cambiar presupuesto de ${budget.categoryName}`} className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-purple-50 hover:text-purple-800 cursor-pointer">
              <Pencil size={16} />
            </button>
            <button type="button" onClick={() => onRemove(budget)} aria-label={`Quitar presupuesto de ${budget.categoryName}`} className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-800 cursor-pointer">
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="text-sm font-semibold text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 cursor-pointer"
          >
            Poner presupuesto
          </button>
        )}
      </div>

      {hasBudget && !editing && (
        <div className="mt-3">
          <div
            className="h-2.5 rounded-full bg-gray-100 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(budget.percent, 100)}
            aria-label={`${budget.percent} % del presupuesto de ${budget.categoryName}`}
          >
            <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${Math.min(budget.percent, 100)}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-sm">
            <span className="flex items-center gap-2">
              <span className="text-gray-600">{budget.percent} %</span>
              <StatusLabel budget={budget} />
            </span>
            <span className={remaining < 0 ? "text-red-800 font-medium" : "text-gray-600"}>
              {remaining < 0 ? `Te has pasado ${formatCurrency(-remaining)}` : `Quedan ${formatCurrency(remaining)}`}
            </span>
          </div>
        </div>
      )}
    </li>
  );
};

const Budgets = () => {
  useUser();
  const [month, setMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const latestRequest = useRef(0);

  const fetchBudgets = useCallback(async (targetMonth) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.BUDGETS, { params: { month: targetMonth } });
      if (requestId === latestRequest.current) setBudgets(response.data || []);
    } catch (error) {
      if (requestId === latestRequest.current) toast.error(getErrorMessage(error, "No se han podido cargar los presupuestos"));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets(month);
  }, [month, fetchBudgets]);

  const handleSave = async (categoryId, amount) => {
    try {
      const response = await axiosConfig.put(API_ENDPOINTS.SET_BUDGET(categoryId), { amount }, { params: { month } });
      setBudgets((prev) => prev.map((b) => (b.categoryId === categoryId ? response.data : b)));
      toast.success("Presupuesto guardado");
      fetchBudgets(month); // re-sort
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido guardar el presupuesto"));
      return false;
    }
  };

  const handleRemove = async (budget) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_BUDGET(budget.categoryId));
      toast.success(`Presupuesto de ${budget.categoryName} quitado`);
      fetchBudgets(month);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido quitar el presupuesto"));
    }
  };

  const totals = budgetTotals(budgets);
  const totalPercent = totals.budget > 0 ? Math.round((totals.spent / totals.budget) * 100) : 0;

  return (
    <Dashboard activeMenu="Budgets">
      <div className="my-5 mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Presupuestos</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Pon un límite mensual a tus categorías de gastos. Se aplica solo todos los meses, sin tener que volver a ponerlo; lo gastado se cuenta desde el día 1 de cada mes.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <MonthSelector month={month} onChange={setMonth} />

          {totals.count > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-gray-200">
              <p className="text-sm text-gray-500">Total de las categorías con presupuesto</p>
              <p className="text-lg text-gray-800 mt-1">
                <span className="font-semibold">{formatCurrency(totals.spent)}</span> de {formatCurrency(totals.budget)}
                <span className="text-sm text-gray-500"> · {totalPercent} %</span>
              </p>
            </div>
          )}

          {loading && budgets.length === 0 ? (
            <div className="flex justify-center py-12 text-gray-400">
              <LoaderCircle className="w-6 h-6 animate-spin" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
              <p className="text-sm text-gray-600">Para poner presupuestos necesitas al menos una categoría de gastos.</p>
              <Link to="/category" className="inline-block mt-3 text-sm font-semibold text-purple-800 underline">
                Crear una categoría
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {budgets.map((budget) => (
                <BudgetRow key={`${budget.categoryId}-${budget.amount}`} budget={budget} onSave={handleSave} onRemove={handleRemove} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </Dashboard>
  );
};

export default Budgets;
