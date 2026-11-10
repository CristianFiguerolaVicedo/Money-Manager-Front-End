import { formatCurrency } from "../util/util";
import { Coins, Wallet, WalletCards } from "lucide-react";
import Dashboard from "../components/Dashboard";
import InfoCard from "../components/InfoCard";
import useUser from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import toast from "react-hot-toast";
import RecentTransactions from "../components/RecentTransactions";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import BudgetAlerts from "../components/BudgetAlerts";
import Transactions from "../components/Transactions";
import GettingStarted from "../components/GettingStarted";

const Home = () => {
    useUser();

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categoryCount, setCategoryCount] = useState(null);
    const [budgets, setBudgets] = useState([]);

    const fetchDashboardData = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.FETCH_DASHBOARD_DATA);
            if ( response.status === 200) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("No se han podido cargar los datos. Inténtalo de nuevo");
        } finally {
            setLoading(false);
        }
    }

    const fetchCategoryCount = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
            setCategoryCount((response.data || []).length);
        } catch {
            setCategoryCount(null); // the guide simply stays hidden
        }
    }

    const fetchBudgets = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.BUDGETS);
            setBudgets(response.data || []);
        } catch {
            setBudgets([]); // the alert simply stays hidden
        }
    }

    useEffect(() => {
        fetchDashboardData();
        fetchCategoryCount();
        fetchBudgets();

        return () => {}
    }, []);

    return(
        <div>
            <Dashboard activeMenu="Dashboard">
                <div className="my-5 mx-auto">
                    {dashboardData && categoryCount !== null && (
                        <div className="mb-6">
                            <GettingStarted
                                hasCategories={categoryCount > 0}
                                hasIncome={(dashboardData.recent5Incomes || []).length > 0}
                                hasExpense={(dashboardData.recent5Expense || []).length > 0}
                            />
                        </div>
                    )}
                    {budgets.length > 0 && (
                        <div className="mb-6 empty:hidden">
                            <BudgetAlerts budgets={budgets} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoCard 
                            icon={<WalletCards />}
                            label="Saldo total"
                            value={formatCurrency(dashboardData?.totalBalance || 0)}
                            color="bg-purple-800"
                        />

                        <InfoCard 
                            icon={<Wallet />}
                            label="Ingresos totales"
                            value={formatCurrency(dashboardData?.totalIncome || 0)}
                            color="bg-green-800"
                        />

                        <InfoCard 
                            icon={<Coins />}
                            label="Gastos totales"
                            value={formatCurrency(dashboardData?.totalExpense || 0)}
                            color="bg-red-800"
                        />
                    </div>
                    <div className="mt-6">
                        <MonthlyTrendChart data={dashboardData?.monthlySummary || []} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <RecentTransactions
                            transactions={dashboardData?.recentTransactions}
                            onMore={() => navigate("/expense")}
                        />

                        <CategoryBreakdown
                            title="Gastos del mes por categoría"
                            subtitle="En qué se va el dinero este mes"
                            items={(dashboardData?.expenseByCategory || []).map((row) => ({
                                key: row.categoryId,
                                name: row.categoryName,
                                icon: row.icon,
                                amount: Number(row.amount) || 0,
                            }))}
                            emptyText="Aún no tienes gastos este mes"
                        />

                        <Transactions 
                            transactions={dashboardData?.recent5Expense || []}
                            onMore={() => navigate("/expense")}
                            type="expense"
                            title="Últimos gastos"
                        />

                        
                        <Transactions 
                            transactions={dashboardData?.recent5Incomes || []}
                            onMore={() => navigate("/income")}
                            type="income"
                            title="Últimos ingresos"
                        />
                    </div>    
                </div>    
            </Dashboard>
        </div>
    )
}

export default Home;