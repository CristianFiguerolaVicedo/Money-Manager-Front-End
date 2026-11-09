import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Dashboard from "./Dashboard";
import Modal from "./Modal";
import DeleteAlert from "./DeleteAlert";
import MonthSelector from "./MonthSelector";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import TransactionOverview from "./TransactionOverview";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { getCurrentMonth, getErrorMessage, getTodayLocalDate } from "../util/util";

// Returns an error message, or null when the transaction is valid
const validateTransaction = ({ name, amount, date, categoryId }) => {
  if (!name || !name.trim()) return "Please enter the name";
  if (!amount || isNaN(amount) || Number(amount) <= 0) return "Amount should be a valid number greater than 0";
  if (!date) return "Please select a date";
  if (date > getTodayLocalDate()) return "Date cannot be in the future";
  if (!categoryId) return "A category is required";
  return null;
};

// Income and expense pages: month selector, chart, list, and add/edit/delete/export
const TransactionsPage = ({ config }) => {
  useUser();

  const { endpoints, singular, type } = config;
  const lower = singular.toLowerCase();

  const [month, setMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // { open, editing } — editing holds the transaction being edited (null when adding)
  const [formModal, setFormModal] = useState({ open: false, editing: null });
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });

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
        toast.error(getErrorMessage(error, `Failed to fetch ${lower} details`));
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
    } catch (error) {
      console.error(`Failed to fetch ${lower} categories`, error);
      toast.error(getErrorMessage(error, `Failed to fetch ${lower} categories`));
    }
  }, [type, lower]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

    try {
      if (editing) {
        await axiosConfig.put(endpoints.update(editing.id), payload);
        toast.success(`${singular} updated successfully`);
      } else {
        await axiosConfig.post(endpoints.add, payload);
        toast.success(`${singular} added successfully`);
      }
      closeForm();
      showMonthOf(payload.date);
    } catch (err) {
      console.error(`Error saving ${lower}`, err);
      toast.error(getErrorMessage(err, editing ? `Failed to update ${lower}` : `Failed to add ${lower}`));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosConfig.delete(endpoints.remove(id));
      setDeleteAlert({ show: false, id: null });
      toast.success(`${singular} deleted successfully`);
      fetchTransactions(month);
    } catch (error) {
      console.error(`Error deleting the ${lower}`, error);
      toast.error(getErrorMessage(error, `Failed to delete ${lower}`));
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
      link.setAttribute("download", `${lower}-${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${singular} details downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${lower} details`, error);
      toast.error(getErrorMessage(error, `Failed to download ${lower} details`));
    }
  };

  const handleEmail = async () => {
    try {
      await axiosConfig.get(endpoints.email, { params: { month } });
      toast.success(`${singular} details sent to your email`);
    } catch (error) {
      console.error(`Failed to email ${lower} details`, error);
      toast.error(getErrorMessage(error, `Failed to email ${lower} details`));
    }
  };

  return (
    <Dashboard activeMenu={config.activeMenu}>
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <MonthSelector month={month} onChange={setMonth} />

          <TransactionOverview
            config={config}
            transactions={transactions}
            onAdd={() => setFormModal({ open: true, editing: null })}
          />

          <TransactionList
            config={config}
            transactions={transactions}
            loading={loading}
            onEdit={(item) => setFormModal({ open: true, editing: item })}
            onDelete={(id) => setDeleteAlert({ show: true, id })}
            onDownload={handleDownload}
            onEmail={handleEmail}
          />

          <Modal
            isOpen={formModal.open}
            onClose={closeForm}
            title={formModal.editing ? `Edit ${singular}` : `Add ${singular}`}
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

          <Modal
            isOpen={deleteAlert.show}
            onClose={() => setDeleteAlert({ show: false, id: null })}
            title={`Delete ${singular}`}
          >
            <DeleteAlert
              content={`Are you sure you want to delete this ${lower}?`}
              onDelete={() => handleDelete(deleteAlert.id)}
            />
          </Modal>
        </div>
      </div>
    </Dashboard>
  );
};

export default TransactionsPage;
