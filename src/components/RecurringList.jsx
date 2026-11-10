import { useState } from "react";
import { LoaderCircle, Pause, Pencil, Play, Repeat, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Input from "./Input";
import { formatCurrency, formatDate } from "../util/util";
import { frequencyLabel } from "../util/recurring";

const iconButton =
  "p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const statusText = (rule) => {
  if (!rule.active) return "En pausa";
  if (!rule.nextDate) return rule.endDate ? `Terminado el ${formatDate(rule.endDate)}` : "Terminado";
  return `Próximo: ${formatDate(rule.nextDate)}`;
};

// Edit amount, name, category and end date of a rule (start date and frequency are fixed)
const EditRuleForm = ({ rule, categories, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: rule.name,
    amount: rule.amount,
    categoryId: rule.categoryId,
    endDate: rule.endDate || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => ({ target }) => setForm((prev) => ({ ...prev, [key]: target.value }));

  const submit = async () => {
    setSaving(true);
    await onSave(rule, {
      name: form.name,
      amount: Number(form.amount),
      categoryId: Number(form.categoryId),
      endDate: form.endDate || null,
    });
    setSaving(false);
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        {frequencyLabel(rule.frequency)} desde el {formatDate(rule.startDate)}. Para cambiar la fecha o la frecuencia, borra este y crea otro.
      </p>
      <Input label="Concepto" value={form.name} onChange={set("name")} type="text" />
      <Input label="Categoría" value={form.categoryId} onChange={set("categoryId")} isSelect options={categories.map((c) => ({ value: c.id, label: c.name }))} />
      <Input label="Importe (€)" value={form.amount} onChange={set("amount")} type="number" />
      <Input label="Hasta (opcional)" value={form.endDate} onChange={set("endDate")} type="date" />
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex items-center gap-1 bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 font-semibold cursor-pointer disabled:opacity-60"
        >
          {saving && <LoaderCircle className="w-4 h-4 animate-spin" />} Guardar cambios
        </button>
      </div>
    </div>
  );
};

// Recurring rules of one type (income/expense), with pause/resume, edit and delete
const RecurringList = ({ config, rules, categories, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const run = async (rule, action) => {
    setBusyId(rule.id);
    await action();
    setBusyId(null);
  };

  if (!rules.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <Repeat size={18} className="text-purple-800" />
        <h2 className="text-lg">{config.labels.recurringTitle}</h2>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">Se añaden solos en cada fecha. Los ya creados aparecen en la lista de su mes.</p>

      <ul className="mt-3 divide-y divide-gray-100">
        {rules.map((rule) => (
          <li key={rule.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${rule.active ? "" : "opacity-70"}`}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {rule.name} <span className="font-normal text-gray-500">· {rule.categoryName}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatCurrency(rule.amount)} · {frequencyLabel(rule.frequency)} · {statusText(rule)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={iconButton}
                disabled={busyId === rule.id}
                aria-label={rule.active ? `Pausar ${rule.name}` : `Reanudar ${rule.name}`}
                title={rule.active ? "Pausar" : "Reanudar"}
                onClick={() => run(rule, () => onUpdate(rule, { active: !rule.active, endDate: rule.endDate }))}
              >
                {rule.active ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button type="button" className={iconButton} aria-label={`Editar ${rule.name}`} title="Editar" onClick={() => setEditing(rule)}>
                <Pencil size={16} />
              </button>
              <button type="button" className={`${iconButton} hover:text-red-800`} aria-label={`Borrar ${rule.name}`} title="Borrar" onClick={() => setDeleting(rule)}>
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={`Editar ${config.labels.one} recurrente`}>
        {editing && (
          <EditRuleForm
            key={editing.id}
            rule={editing}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSave={async (rule, changes) => {
              if (await onUpdate(rule, changes)) setEditing(null);
            }}
          />
        )}
      </Modal>

      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title={`Borrar ${config.labels.one} recurrente`}>
        {deleting && (
          <div>
            <p className="text-sm text-gray-700">
              Dejarán de añadirse nuevos «{deleting.name}». Los que ya se crearon se mantienen en tu lista.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setDeleting(null)} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDelete(deleting);
                  setDeleting(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 cursor-pointer"
              >
                Borrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecurringList;
