import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Dashboard from "./Dashboard";
import Modal from "./Modal";
import MonthSelector from "./MonthSelector";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import TransactionOverview from "./TransactionOverview";
import RecurringList from "./RecurringList";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { getCurrentMonth, getErrorMessage, getTodayLocalDate } from "../util/util";
import NoCategoriesNotice from "./NoCategoriesNotice";
import { budgetToastMessage } from "../util/budgets";

const UNDO_SECONDS = 5;

// Returns an error message, or null when the transaction is valid
const validateTransaction = ({ name, amount, date, categoryId, repeat, endDate }) => {
  const recurring = repeat && repeat !== "none";
  if (!name || !name.trim()) return "Escribe un concepto";
  if (!amount || isNaN(amount) || Number(amount) <= 0) return "El importe debe ser un número mayor que 0";
  if (!date) return "Elige una fecha";
  if (!recurring && date > getTodayLocalDate()) return "La fecha no puede ser futura";
  if (recurring && endDate && endDate < date) return "La fecha de fin no puede ser anterior a la de inicio";
  if (!categoryId) return "Elige una categoría";
  return null;
};

// Income and expense pages: month selector, chart, list, and add/edit/delete/export
const TransactionsPage = ({ config }) => {
  useUser();

  const { endpoints, type, labels } = config;
  const lower = labels.one;

  const [month, setMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  // { open, editing } — editing holds the transaction being edited (null when adding)
  const [formModal, setFormModal] = useState({ open: false, editing: null });

  // Ignore responses from a month the user already navigated away from
  const latestRequest = useRef(0);

  const fetchTransactions = useCallback(async (targetMonth) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const response = await axiosConfig.get(endpoints.list, { params: { month: targetMonth } });
      if (requestId === latestRequest.current) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error(`Failed to fetch ${lower} details`, error);
      if (requestId === latestRequest.current) {
        toast.error(getErrorMessage(error, `No se han podido cargar los ${labels.many}`));
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }, [endpoints.list, lower]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE(type));
      setCategories(response.data || []);
      setCategoriesLoaded(true);
    } catch (error) {
      console.error(`Failed to fetch ${lower} categories`, error);
      toast.error(getErrorMessage(error, `No se han podido cargar las categorías de ${labels.many}`));
    }
  }, [type, lower]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchRules = useCallback(async () => {
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.RECURRING, { params: { type } });
      setRules(response.data || []);
    } catch (error) {
      console.error(`Failed to fetch recurring ${lower}s`, error);
    }
  }, [type, lower]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleUpdateRule = async (rule, changes) => {
    try {
      await axiosConfig.put(API_ENDPOINTS.UPDATE_RECURRING(rule.id), changes);
      toast.success(
        changes.active === false ? `«${rule.name}» en pausa` : changes.active === true ? `«${rule.name}» reanudado` : "Cambios guardados"
      );
      fetchRules();
      fetchTransactions(month);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se han podido guardar los cambios"));
      return false;
    }
  };

  const handleDeleteRule = async (rule) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_RECURRING(rule.id));
      toast.success(`«${rule.name}» ya no se repetirá`);
      fetchRules();
      fetchTransactions(month);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se ha podido borrar"));
    }
  };

  useEffect(() => {
    fetchTransactions(month);
  }, [month, fetchTransactions]);

  const closeForm = () => setFormModal({ open: false, editing: null });

  // After saving, show the month the transaction belongs to so it never "disappears"
  const showMonthOf = (date) => {
    const savedMonth = date.slice(0, 7);
    if (savedMonth !== month) {
      setMonth(savedMonth);
    } else {
      fetchTransactions(month);
    }
  };

  const handleSave = async (transaction) => {
    const error = validateTransaction(transaction);
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      name: transaction.name.trim(),
      amount: Number(transaction.amount),
      date: transaction.date,
      icon: transaction.icon,
      categoryId: Number(transaction.categoryId),
    };
    const editing = formModal.editing;

    if (!editing && transaction.repeat && transaction.repeat !== "none") {
      try {
        await axiosConfig.post(API_ENDPOINTS.RECURRING, {
          ...payload,
          type,
          frequency: transaction.repeat,
          startDate: payload.date,
          endDate: transaction.endDate || null,
        });
        toast.success(labels.recurringCreated);
        closeForm();
        fetchRules();
        fetchTransactions(month); // occurrences already due appear in their months
      } catch (err) {
        toast.error(getErrorMessage(err, `No se ha podido crear el ${lower} recurrente`));
      }
      return;
    }

    try {
      if (editing) {
        await axiosConfig.put(endpoints.update(editing.id), payload);
        toast.success(labels.updated);
      } else {
        await axiosConfig.post(endpoints.add, payload);
        toast.success(labels.added);
      }
      closeForm();
      showMonthOf(payload.date);
      if (type === "expense") warnAboutBudget(payload.categoryId, payload.date);
    } catch (err) {
      console.error(`Error saving ${lower}`, err);
      toast.error(getErrorMessage(err, editing ? `No se ha podido actualizar el ${lower}` : `No se ha podido añadir el ${lower}`));
    }
  };

  // After saving an expense: tell the user if that category is close to / over its budget
  const warnAboutBudget = async (categoryId, date) => {
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.BUDGETS, { params: { month: date.slice(0, 7) } });
      const message = budgetToastMessage((response.data || []).find((b) => b.categoryId === Number(categoryId)));
      if (message) toast(message, { icon: "⚠️", duration: 6000 });
    } catch {
      // only a hint: ignore errors
    }
  };

  // Deletes right away (the item disappears at once) and offers "Deshacer" for a few seconds,
  // which re-creates the transaction with the same data.
  const handleDelete = async (item) => {
    setTransactions((prev) => prev.filter((t) => t.id !== item.id));
    try {
      await axiosConfig.delete(endpoints.remove(item.id));
    } catch (error) {
      console.error(`Error deleting the ${lower}`, error);
      toast.error(getErrorMessage(error, `No se ha podido borrar el ${lower}`));
      fetchTransactions(month);
      return;
    }

    toast(
      (t) => (
        <span className="flex items-center gap-3">
          <span>
            {labels.deleted}: <strong>{item.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              handleUndoDelete(item);
            }}
            className="font-semibold text-purple-800 underline cursor-pointer whitespace-nowrap"
          >
            Deshacer
          </button>
        </span>
      ),
      { duration: UNDO_SECONDS * 1000 }
    );
  };

  const handleUndoDelete = async (item) => {
    try {
      await axiosConfig.post(endpoints.add, {
        name: item.name,
        amount: Number(item.amount),
        date: item.date,
        icon: item.icon,
        categoryId: item.categoryId,
      });
      toast.success(labels.restored);
      showMonthOf(item.date);
    } catch (error) {
      console.error(`Error restoring the ${lower}`, error);
      toast.error(getErrorMessage(error, `No se ha podido recuperar el ${lower}`));
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axiosConfig.get(endpoints.download, {
        params: { month },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${labels.many}-${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Excel descargado");
    } catch (error) {
      console.error(`Error downloading ${lower} details`, error);
      toast.error(getErrorMessage(error, "No se ha podido descargar el Excel"));
    }
  };

  const handleEmail = async () => {
    try {
      await axiosConfig.get(endpoints.email, { params: { month } });
      toast.success("Te hemos enviado el Excel por email");
    } catch (error) {
      console.error(`Failed to email ${lower} details`, error);
      toast.error(getErrorMessage(error, "No se ha podido enviar el email"));
    }
  };

  return (
    <Dashboard activeMenu={config.activeMenu}>
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {categoriesLoaded && categories.length === 0 && <NoCategoriesNotice labels={labels} />}

          <MonthSelector month={month} onChange={setMonth} />

          <TransactionOverview
            config={config}
            transactions={transactions}
            month={month}
            onAdd={() => setFormModal({ open: true, editing: null })}
          />

          <TransactionList
            key={month}
            config={config}
            transactions={transactions}
            loading={loading}
            onEdit={(item) => setFormModal({ open: true, editing: item })}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onEmail={handleEmail}
          />

          <RecurringList
            config={config}
            rules={rules}
            categories={categories}
            onUpdate={handleUpdateRule}
            onDelete={handleDeleteRule}
          />

          <Modal
            isOpen={formModal.open}
            onClose={closeForm}
            title={formModal.editing ? labels.edit : labels.add}
          >
            {/* key: fresh form state for every add/edit */}
            <TransactionForm
              key={formModal.editing ? `edit-${formModal.editing.id}` : "new"}
              config={config}
              categories={categories}
              initialData={formModal.editing}
              onSubmit={handleSave}
            />
          </Modal>
        </div>
      </div>
    </Dashboard>
  );
};

export default TransactionsPage;
