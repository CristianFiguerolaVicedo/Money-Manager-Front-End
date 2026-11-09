import { formatCurrency } from "../util/util";
import CustomPieChart from "./CustomPieChart";

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const COLORS = ["#59168B", "#B22222", "#006400"];

    const balanceData = [
        // A pie slice cannot be negative, so a negative balance is drawn as 0 (the label still shows the real value)
        {name: "Saldo total", amount: Math.max(Number(totalBalance) || 0, 0)},
        {name: "Gastos totales", amount: totalExpense},
        {name: "Ingresos totales", amount: totalIncome},
    ];

    return(
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">
                    Resumen financiero
                </h5>
            </div>

            <CustomPieChart 
                data={balanceData}
                label="Saldo total"
                totalAmount={formatCurrency(totalBalance)}
                colors={COLORS}
                showTextAnchor
            />
        </div>
    )
}

export default FinanceOverview;