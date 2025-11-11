import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import toast from "react-hot-toast";
import IncomeList from "../components/IncomeList";
import Modal from "../components/Modal";
import { Plus } from "lucide-react";
import AddIncomeForm from "../components/AddIncomeForm";
import DeleteAlert from "../components/DeleteAlert";

const Income = () => {
    useUser();

    const [incomeData, setIncomeData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null
    });

    const fetchIncomeDetails = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOMES);
            if (response.status === 200) {
                setIncomeData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch income details", error);
            toast.error(error.response?.data?.message || "Failed to fetch income details");
        } finally {
            setLoading(false);
        }
    }

    const fetchIncomeCategories = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("income"));
            if (response.status === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            console.log("Failed to fetch income categories", error);
            toast.error(error.data?.message || "Failed to fetch income categories");
        }
    }

    const handleAddIncome = async (income) => {
        const {name, amount, date, icon, categoryId} = income;

        if (!name.trim()) {
            toast.error("Please enter the name");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount should be a valid number greater than 0");
            return;
        }

        if (!date) {
            toast.error("Please seleect a date");
            return;
        }

        const todayDate = new Date().toISOString().split('T')[0];
        if (date > todayDate) {
            toast.error("Date cannot be future");
            return;
        }

        if (!categoryId) {
            toast.error("A category is required");
            return;
        }

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
                name, 
                amount: Number(amount), 
                date,
                icon,
                categoryId
            });

            if (response.status === 201) {
                setOpenAddIncomeModal(false);
                toast.success("Income added successfully");
                fetchIncomeDetails();
                fetchIncomeCategories();
            }
        } catch (error) {
            console.error('Error adding income', error);
            toast.error(error.responsee?.data?.message || "Failed to add income");
        }
    }

    const deleteIncome = async (id) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(id));
            setOpenDeleteAlert({show: false, data: null});
            toast.success("Income deleted successfully");
            fetchIncomeDetails();
        } catch (error) {
            console.error("Error deleting the income", error);
            toast.error(error.response?.data?.message || "Failed to delete income");
        }
    }

    useEffect(() => {
        fetchIncomeDetails();
        fetchIncomeCategories();
    }, []);

    return(
        <Dashboard activeMenu="Income">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <button onClick={() => setOpenAddIncomeModal(true)} className="flex items-center gap-1 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg hover:bg-green-500/30 font-semibold hover:cursor-pointer">
                            <Plus size={15} className="text-lg"/> Add Income
                        </button>
                    </div>    

                    <IncomeList 
                    transactions={incomeData} 
                    onDelete={(id) => setOpenDeleteAlert({show: true, data: id})}
                    />

                    <Modal 
                        isOpen={openAddIncomeModal}
                        onClose={() => setOpenAddIncomeModal(false)}
                        title="Add Income"
                    >
                        <AddIncomeForm 
                            onAddIncome={(income) => handleAddIncome(income)}
                            categories={categories}
                        />
                    </Modal>

                    <Modal 
                        isOpen={openDeleteAlert.show}
                        onClose={() => setOpenDeleteAlert({show: false, data: null})}
                        title="Delete Income"
                    >
                        <DeleteAlert 
                            content="Are you sure you want to delete this income?"
                            onDelete={() => deleteIncome(openDeleteAlert.data)}
                        />
                    </Modal>
                </div>    
            </div>  
        </Dashboard>
    )
}

export default Income;