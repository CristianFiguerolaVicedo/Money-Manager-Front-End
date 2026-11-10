import logo from "./money-management.png";
import login_bg from "./dramatic-sunset-rocky-coastline-with-crashing-waves.jpg";
import { ArrowLeftRight, Coins, FileUp, FunnelPlus, LayoutDashboard, List, PiggyBank, Target, UserRound, Wallet } from "lucide-react";

export const assets = {
    logo,
    login_bg
}

// Side menu, grouped by what the user is doing. `key` is what pages pass as activeMenu.
export const SIDE_BAR_GROUPS = [
    {
        label: "Resumen",
        items: [
            { key: "Dashboard", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
            { key: "Compare", label: "Comparar meses", icon: ArrowLeftRight, path: "/compare" },
        ],
    },
    {
        label: "Movimientos",
        items: [
            { key: "Income", label: "Ingresos", icon: Wallet, path: "/income" },
            { key: "Expense", label: "Gastos", icon: Coins, path: "/expense" },
            { key: "Filters", label: "Buscar", icon: FunnelPlus, path: "/filter" },
            { key: "Category", label: "Categorías", icon: List, path: "/category" },
            { key: "Import", label: "Importar CSV", icon: FileUp, path: "/import" },
        ],
    },
    {
        label: "Planificación",
        items: [
            { key: "Budgets", label: "Presupuestos", icon: PiggyBank, path: "/budgets" },
            { key: "Goals", label: "Objetivos", icon: Target, path: "/goals" },
        ],
    },
    {
        label: "Cuenta",
        items: [{ key: "Profile", label: "Mi perfil", icon: UserRound, path: "/profile" }],
    },
];

export const SIDE_BAR_DATA = SIDE_BAR_GROUPS.flatMap((group) => group.items);
