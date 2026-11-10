import logo from "./money-management.png";
import login_bg from "./dramatic-sunset-rocky-coastline-with-crashing-waves.jpg";
import { ArrowLeftRight, Coins, FunnelPlus, LayoutDashboard, List, PiggyBank, Target, UserRound, Wallet } from "lucide-react";

export const assets = {
    logo,
    login_bg
}

export const SIDE_BAR_DATA = [
    {
        id: "01",
        key: "Dashboard",
        label: "Inicio",
        icon: LayoutDashboard,
        path: "/dashboard"
    },
    {
        id: "02",
        key: "Category",
        label: "Categorías",
        icon: List,
        path: "/category"
    },
    {
        id: "03",
        key: "Income",
        label: "Ingresos",
        icon: Wallet,
        path: "/income"
    },
    {
        id: "04",
        key: "Expense",
        label: "Gastos",
        icon: Coins,
        path: "/expense"
    },
    {
        id: "05",
        key: "Filters",
        label: "Buscar",
        icon: FunnelPlus,
        path: "/filter"
    },
    {
        id: "07",
        key: "Budgets",
        label: "Presupuestos",
        icon: PiggyBank,
        path: "/budgets"
    },
    {
        id: "08",
        key: "Goals",
        label: "Objetivos",
        icon: Target,
        path: "/goals"
    },
    {
        id: "09",
        key: "Compare",
        label: "Comparar meses",
        icon: ArrowLeftRight,
        path: "/compare"
    },
    {
        id: "06",
        key: "Profile",
        label: "Mi perfil",
        icon: UserRound,
        path: "/profile"
    },
];