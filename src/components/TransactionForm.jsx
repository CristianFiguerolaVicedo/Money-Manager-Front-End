import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import EmojiPickerPopup from "./EmojiPickerPopup";
import Input from "./Input";
import { getTodayLocalDate } from "../util/util";

const emptyTransaction = () => ({
  name: "",
  amount: "",
  date: getTodayLocalDate(),
  icon: "",
  categoryId: "",
});

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
        label="Category"
        value={transaction.categoryId}
        onChange={({ target }) => handleChange("categoryId", target.value)}
        isSelect={true}
        options={categoryOptions}
      />

      <Input
        value={transaction.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount (€)"
        placeholder="e.g., 500,00"
        type="number"
      />

      <Input
        value={transaction.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        placeholder=""
        type="date"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="flex items-center gap-1 bg-purple-800 text-white px-3 py-2 rounded-lg hover:bg-purple-500 font-semibold hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              {isEditing ? "Saving..." : "Adding..."}
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            `Add ${config.singular}`
          )}
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
