import { addThousandSeparator } from "../util/util";
import CustomPieChart from "./CustomPieChart";

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const COLORS = ["#59168B", "#B22222", "#006400"];

    const balanceData = [
        // A pie slice cannot be negative, so a negative balance is drawn as 0 (the label still shows the real value)
        {name: "Total Balance", amount: Math.max(Number(totalBalance) || 0, 0)},
        {name: "Total Expense", amount: totalExpense},
        {name: "Total Income", amount: totalIncome},
    ];

    return(
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">
                    Financial Overview
                </h5>
            </div>

            <CustomPieChart 
                data={balanceData}
                label="Total Balance"
                totalAmount={`${Number(totalBalance) < 0 ? "-" : ""}$${addThousandSeparator(Math.abs(Number(totalBalance) || 0))}`}
                colors={COLORS}
                showTextAnchor
            />
        </div>
    )
}

export default FinanceOverview;