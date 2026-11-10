import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import EmojiPickerPopup from "./EmojiPickerPopup";
import Input from "./Input";
import NoCategoriesNotice from "./NoCategoriesNotice";
import AttachmentsField from "./AttachmentsField";
import { countOccurrencesUntil, FREQUENCIES } from "../util/recurring";
import { formatDate, getTodayLocalDate } from "../util/util";

const emptyTransaction = () => ({
  name: "",
  amount: "",
  date: getTodayLocalDate(),
  icon: "",
  categoryId: "",
  repeat: "none",
  endDate: "",
  note: "",
  pendingFiles: [],
});

// Explains what will happen when the movement repeats
const RepeatHint = ({ transaction }) => {
  const today = getTodayLocalDate();
  if (!transaction.date) return null;
  const until = transaction.endDate && transaction.endDate < today ? transaction.endDate : today;
  const now = countOccurrencesUntil(transaction.date, transaction.repeat, until);
  return (
    <p className="text-xs text-gray-500 -mt-2 mb-2">
      {now > 0
        ? `Se ${now === 1 ? "creará 1 movimiento" : `crearán ${now} movimientos`} ahora (desde el ${formatDate(transaction.date)}) y los siguientes se añadirán solos.`
        : `El primero se añadirá solo el ${formatDate(transaction.date)}.`}
    </p>
  );
};

// Add/edit form shared by incomes and expenses.
// `initialData` switches it to edit mode and pre-fills the fields.
const TransactionForm = ({ config, categories, initialData, onSubmit }) => {
  const isEditing = Boolean(initialData);

  const [transaction, setTransaction] = useState(() =>
    isEditing
      ? {
          name: initialData.name ?? "",
          amount: initialData.amount ?? "",
          date: initialData.date ?? getTodayLocalDate(),
          icon: initialData.icon ?? "",
          categoryId: initialData.categoryId ?? "",
          note: initialData.note ?? "",
        }
      : emptyTransaction()
  );
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const handleChange = (key, value) => {
    setTransaction((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(transaction);
    } finally {
      setLoading(false);
    }
  };

  // Pre-select the first category for new transactions
  useEffect(() => {
    if (categories.length > 0 && !transaction.categoryId) {
      setTransaction((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, transaction.categoryId]);

  if (categories.length === 0) {
    return <NoCategoriesNotice labels={config.labels} compact />;
  }

  return (
    <div>
      <EmojiPickerPopup
        icon={transaction.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={transaction.name}
        onChange={({ target }) => handleChange("name", target.value)}
        label={config.nameLabel}
        placeholder={config.namePlaceholder}
        type="text"
      />

      <Input
        label="Categoría"
        value={transaction.categoryId}
        onChange={({ target }) => handleChange("categoryId", target.value)}
        isSelect={true}
        options={categoryOptions}
      />

      <Input
        value={transaction.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Importe (€)"
        placeholder="p. ej., 500"
        type="number"
      />

      <Input
        value={transaction.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Fecha"
        placeholder=""
        type="date"
      />

      <div className="mb-4">
        <label htmlFor="transaction-note" className="text-[13px] text-slate-800 mb-1 block">Nota (opcional)</label>
        <textarea
          id="transaction-note"
          value={transaction.note}
          onChange={({ target }) => handleChange("note", target.value)}
          maxLength={500}
          rows={2}
          placeholder="p. ej., cena de cumpleaños con Marta"
          className="w-full bg-transparent border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500 resize-y"
        />
      </div>

      {(isEditing || transaction.repeat === "none") && (
        <AttachmentsField
          type={config.type}
          transactionId={isEditing ? initialData.id : null}
          pending={transaction.pendingFiles}
          onPendingChange={(files) => handleChange("pendingFiles", files)}
        />
      )}

      {!isEditing && (
        <>
          <Input
            label="Repetir"
            value={transaction.repeat}
            onChange={({ target }) => handleChange("repeat", target.value)}
            isSelect={true}
            options={FREQUENCIES}
          />
          {transaction.repeat !== "none" && (
            <>
              <Input
                value={transaction.endDate}
                onChange={({ target }) => handleChange("endDate", target.value)}
                label="Hasta (opcional)"
                placeholder=""
                type="date"
              />
              <RepeatHint transaction={transaction} />
            </>
          )}
        </>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="flex items-center gap-1 bg-violet-700 text-white px-3 py-2 rounded-lg hover:bg-violet-800 font-semibold hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              {isEditing ? "Guardando..." : "Añadiendo..."}
            </>
          ) : isEditing ? (
            "Guardar cambios"
          ) : transaction.repeat !== "none" ? (
            "Crear movimiento recurrente"
          ) : (
            config.labels.add
          )}
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
