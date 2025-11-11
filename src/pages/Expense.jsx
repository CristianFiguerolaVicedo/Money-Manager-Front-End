import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";
import { useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import toast from "react-hot-toast";
import ExpenseOverview from "../components/ExpenseOverview";
import ExpenseList from "../components/ExpenseList";
import Modal from "../components/Modal";
import AddExpenseForm from "../components/AddExpenseForm";
import DeleteAlert from "../components/DeleteAlert";

const Expense = () => {
    useUser();

    const navigate = useNavigate();
    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null
    });

    const fetchExpenseDetails = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSES);
            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense details", error);
            toast.error("Failed to fetch expense details");
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenseCategories = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("expense"));
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense categories", error);
            toast.error("Failed to fetch expense categories");
        }
    };

    const handleAddExpense = async (expense) => {
        const {name, categoryId, amount, date, icon} = expense;

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (!categoryId) {
            toast.error("Category is required");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount should be a valid number greater than 0");
            return;
        }

        if (!date) {
            toast.error("Date is required");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (date > today) {
            toast.error("Date cannot be in the future");
            return;
        }

        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
                name,
                categoryId,
                amount: Number(amount),
                date,
                icon,
            });

            setOpenAddExpenseModal(false);
            toast.success("Expense added successfully");
            fetchExpenseDetails();
            fetchExpenseCategories();
        } catch (error) {
            console.error("Error adding expense", error.response?.data?.message || "Failed to add expense");
            toast.error(error.response?.data?.message || "Failed to add expense");
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(id));

            setOpenDeleteAlert({show: false, data:null});
            toast.success("Expense details deleted successfully");
            fetchExpenseDetails();
        } catch (error) {
            console.error("Error deleting expense", error.response?.data?.message);
            toast.error(error.response?.data?.message || "Failed to delete expense");
        }
    };

    const handleDownloadExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DOWNLOAD_EXPENSE_DETAILS, {responseType: "blob"});

            let filename = "expense_details.xlsx";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Expense details downloaded successfully");
        } catch (error) {
            console.error("Error downloading expense details", error);
            toast.error("Failed to download expense details. Please try again");
        }
    };

    const handleEmailExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE_DETAILS);
            if (response.status === 200) {
                toast.success("Expense details email successfully sended");
            }
        } catch (error) {
            console.error("Error emailing expense details", error);
            toast.error("Failed to email expense details. Please try again");
        }
    }

    useEffect(() => {
        fetchExpenseDetails();
        fetchExpenseCategories();
    }, []);

    return(
        <Dashboard activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <ExpenseOverview 
                            transactions={expenseData}
                            onExpenseIncome={() => setOpenAddExpenseModal(true)}
                        />
                    </div>

                    <ExpenseList 
                        transactions={expenseData}
                        onDelete={(id) => {setOpenDeleteAlert({show: true, data: id})}}
                        onDownload={handleDownloadExpenseDetails}
                        onEmail={handleEmailExpenseDetails}
                    />

                    <Modal 
                        isOpen={openAddExpenseModal}
                        onClose={() => setOpenAddExpenseModal(false)}
                        title="Add Expense"
                    >
                        <AddExpenseForm 
                            onAddExpense={handleAddExpense}
                            categories={categories}
                        />
                    </Modal>

                    <Modal
                        isOpen={openDeleteAlert.show}
                        onClose={() => setOpenDeleteAlert({show:false, data: null})}
                        title="Delete Expense"
                    >
                        <DeleteAlert 
                            content="Are you sure you want to delete this expense?"
                            onDelete={() => deleteExpense(openDeleteAlert.data)}
                        />
                    </Modal>
                </div>
            </div>
        </Dashboard>
    );
};

export default Expense;