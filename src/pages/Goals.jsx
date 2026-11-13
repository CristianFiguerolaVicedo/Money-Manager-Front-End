import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, LoaderCircle, Minus, Pencil, Plus, Target, Trash2, Trophy } from "lucide-react";
import Dashboard from "../components/Dashboard";
import EmojiPickerPopup from "../components/EmojiPickerPopup";
import Input from "../components/Input";
import Modal from "../components/Modal";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { goalStatusText } from "../util/goals";
import { formatCurrency, formatDate, getErrorMessage, getTodayLocalDate } from "../util/util";

const primaryButton =
  "flex items-center gap-1.5 bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButton =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer";

const GoalForm = ({ goal, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: goal?.name ?? "",
    targetAmount: goal?.targetAmount ?? "",
    deadline: goal?.deadline ?? "",
    icon: goal?.icon ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => ({ target }) => setForm((prev) => ({ ...prev, [key]: target.value }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Ponle un nombre al objetivo");
    if (!Number(form.targetAmount) || Number(form.targetAmount) <= 0) return toast.error("El objetivo debe ser un importe mayor que 0");
    setSaving(true);
    await onSave({ name: form.name.trim(), targetAmount: Number(form.targetAmount), deadline: form.deadline || null, icon: form.icon || null });
    setSaving(false);
  };

  return (
    <div>
      <EmojiPickerPopup icon={form.icon} onSelect={(icon) => setForm((prev) => ({ ...prev, icon }))} />
      <Input label="Nombre" value={form.name} onChange={set("name")} placeholder="p. ej., Viaje a Japón" type="text" />
      <Input label="Cantidad a ahorrar (€)" value={form.targetAmount} onChange={set("targetAmount")} placeholder="p. ej., 2000" type="number" />
      <Input label="Fecha límite (opcional)" value={form.deadline} onChange={set("deadline")} type="date" />
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">Cancelar</button>
        <button type="button" onClick={submit} disabled={saving} className={primaryButton}>
          {saving && <LoaderCircle className="w-4 h-4 animate-spin" />} {goal ? "Guardar cambios" : "Crear objetivo"}
        </button>
      </div>
    </div>
  );
};

const ContributionForm = ({ goal, withdraw, onSave, onCancel }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayLocalDate());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return toast.error("Escribe un importe mayor que 0");
    if (withdraw && value > Number(goal.savedAmount)) return toast.error(`Solo tienes ${formatCurrency(goal.savedAmount)} ahorrados`);
    setSaving(true);
    await onSave({ amount: withdraw ? -value : value, date, note: note.trim() || null });
    setSaving(false);
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        {withdraw ? "Saca dinero de" : "Guarda dinero en"} «{goal.name}». Ahorrado ahora: {formatCurrency(goal.savedAmount)}.
      </p>
      <Input label="Importe (€)" value={amount} onChange={({ target }) => setAmount(target.value)} placeholder="p. ej., 100" type="number" />
      <Input label="Fecha" value={date} onChange={({ target }) => setDate(target.value)} type="date" />
      <Input label="Nota (opcional)" value={note} onChange={({ target }) => setNote(target.value)} placeholder="p. ej., paga extra" type="text" />
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">Cancelar</button>
        <button type="button" onClick={submit} disabled={saving} className={primaryButton}>
          {saving && <LoaderCircle className="w-4 h-4 animate-spin" />} {withdraw ? "Retirar" : "Aportar"}
        </button>
      </div>
    </div>
  );
};

const GoalCard = ({ goal, onContribute, onWithdraw, onEdit, onDelete, onDeleteContribution }) => {
  const [showHistory, setShowHistory] = useState(false);
  const percent = Math.min(goal.percent, 100);
  const historyId = `goal-history-${goal.id}`;

  return (
    <li className="p-5 bg-white rounded-2xl border border-gray-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 flex items-center justify-center rounded-full bg-purple-50 shrink-0">
            {goal.icon ? <img src={goal.icon} alt="" className="w-6 h-6" /> : goal.achieved ? <Trophy size={20} className="text-purple-800" /> : <Target size={20} className="text-purple-800" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{goal.name}</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{formatCurrency(goal.savedAmount)}</span> de {formatCurrency(goal.targetAmount)}
              {goal.deadline && <span className="text-gray-500"> · hasta el {formatDate(goal.deadline)}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => onEdit(goal)} aria-label={`Editar ${goal.name}`} className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"><Pencil size={16} /></button>
          <button type="button" onClick={() => onDelete(goal)} aria-label={`Borrar ${goal.name}`} className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-800 cursor-pointer"><Trash2 size={16} /></button>
        </div>
      </div>

      <div
        className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`${goal.percent} % de ${goal.name}`}
      >
        <div className={`h-full rounded-full ${goal.achieved ? "bg-green-700" : "bg-purple-700"}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 mt-1.5 text-sm">
        <span className="text-gray-600">{goal.percent} %</span>
        <span className={goal.achieved ? "text-green-800 font-medium" : "text-gray-600"}>{goalStatusText(goal)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button type="button" onClick={() => onContribute(goal)} className={secondaryButton}><Plus size={15} /> Aportar</button>
        <button type="button" onClick={() => onWithdraw(goal)} disabled={Number(goal.savedAmount) <= 0} className={`${secondaryButton} disabled:opacity-40 disabled:cursor-not-allowed`}><Minus size={15} /> Retirar</button>
        {goal.contributions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory((open) => !open)}
            aria-expanded={showHistory}
            aria-controls={historyId}
            className="ml-auto flex items-center gap-1 text-sm text-purple-800 hover:underline cursor-pointer"
          >
            Movimientos <ChevronDown size={15} className={`transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {showHistory && (
        <ul id={historyId} className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
          {goal.contributions.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-gray-600">
                {formatDate(c.date)}
                {c.note && <span className="text-gray-500"> · {c.note}</span>}
              </span>
              <span className="flex items-center gap-2">
                <span className={Number(c.amount) < 0 ? "text-red-800" : "text-green-800"}>
                  {Number(c.amount) < 0 ? "−" : "+"}{formatCurrency(Math.abs(c.amount))}
                </span>
                <button type="button" onClick={() => onDeleteContribution(goal, c)} aria-label={`Borrar movimiento del ${formatDate(c.date)}`} className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-800 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Goals = () => {
  useUser();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { goal } (goal null = new)
  const [contributing, setContributing] = useState(null); // { goal, withdraw }
  const [deleting, setDeleting] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.GOALS);
      setGoals(response.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se han podido cargar los objetivos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const replaceGoal = (updated) => setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));

  const saveGoal = async (data) => {
    try {
      if (editing.goal) {
        const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_GOAL(editing.goal.id), data);
        replaceGoal(response.data);
        toast.success("Objetivo actualizado");
      } else {
        const response = await axiosConfig.post(API_ENDPOINTS.GOALS, data);
        setGoals((prev) => [...prev, response.data]);
        toast.success("Objetivo creado");
      }
      setEditing(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido guardar el objetivo"));
    }
  };

  const saveContribution = async (data) => {
    const { goal } = contributing;
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.GOAL_CONTRIBUTIONS(goal.id), data);
      replaceGoal(response.data);
      setContributing(null);
      if (response.data.achieved && !goal.achieved) {
        toast.success(`¡Has conseguido «${goal.name}»! 🎉`, { duration: 6000 });
      } else {
        toast.success(data.amount < 0 ? "Retirada guardada" : "Aportación guardada");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido guardar"));
    }
  };

  const deleteContribution = async (goal, contribution) => {
    try {
      const response = await axiosConfig.delete(API_ENDPOINTS.DELETE_GOAL_CONTRIBUTION(goal.id, contribution.id));
      replaceGoal(response.data);
      toast.success("Movimiento borrado");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido borrar"));
    }
  };

  const deleteGoal = async () => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.UPDATE_GOAL(deleting.id));
      setGoals((prev) => prev.filter((g) => g.id !== deleting.id));
      toast.success(`«${deleting.name}» borrado`);
      setDeleting(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido borrar el objetivo"));
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount || 0), 0);

  return (
    <Dashboard activeMenu="Goals">
      <div className="my-5 mx-auto max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Objetivos de ahorro</h1>
            <p className="text-sm text-gray-500 mt-1">
              {goals.length > 0 ? `Llevas ${formatCurrency(totalSaved)} ahorrados entre todos tus objetivos.` : "Ponte una meta y ve guardando dinero para ella."}
            </p>
          </div>
          <button type="button" onClick={() => setEditing({ goal: null })} className={primaryButton}>
            <Plus size={16} /> Nuevo objetivo
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400"><LoaderCircle className="w-6 h-6 animate-spin" /></div>
        ) : goals.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
            <Target size={32} className="mx-auto text-purple-800" />
            <p className="text-gray-700 mt-3">Aún no tienes objetivos.</p>
            <p className="text-sm text-gray-500 mt-1">Por ejemplo: un fondo de emergencia, un viaje o la entrada de un piso.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={(g) => setContributing({ goal: g, withdraw: false })}
                onWithdraw={(g) => setContributing({ goal: g, withdraw: true })}
                onEdit={(g) => setEditing({ goal: g })}
                onDelete={setDeleting}
                onDeleteContribution={deleteContribution}
              />
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.goal ? "Editar objetivo" : "Nuevo objetivo"}>
        {editing && <GoalForm key={editing.goal?.id ?? "new"} goal={editing.goal} onSave={saveGoal} onCancel={() => setEditing(null)} />}
      </Modal>

      <Modal isOpen={Boolean(contributing)} onClose={() => setContributing(null)} title={contributing?.withdraw ? "Retirar dinero" : "Aportar dinero"}>
        {contributing && (
          <ContributionForm
            key={`${contributing.goal.id}-${contributing.withdraw}`}
            goal={contributing.goal}
            withdraw={contributing.withdraw}
            onSave={saveContribution}
            onCancel={() => setContributing(null)}
          />
        )}
      </Modal>

      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Borrar objetivo">
        {deleting && (
          <div>
            <p className="text-sm text-gray-700">
              Se borrará «{deleting.name}» con todas sus aportaciones. Esto no toca tus ingresos ni tus gastos.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setDeleting(null)} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">Cancelar</button>
              <button type="button" onClick={deleteGoal} className="px-4 py-2 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 cursor-pointer">Borrar</button>
            </div>
          </div>
        )}
      </Modal>
    </Dashboard>
  );
};

export default Goals;
