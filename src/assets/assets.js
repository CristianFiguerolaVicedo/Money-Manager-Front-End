import logo from "./money-management.png";
import login_bg from "./dramatic-sunset-rocky-coastline-with-crashing-waves.jpg";
import { Coins, FunnelPlus, LayoutDashboard, List, UserRound, Wallet } from "lucide-react";

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
        id: "06",
        key: "Profile",
        label: "Mi perfil",
        icon: UserRound,
        path: "/profile"
    },
];