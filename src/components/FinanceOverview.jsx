import { addThousandSeparator } from "../util/util";
import CustomPieChart from "./CustomPieChart";

const FinanceOverview = ({totalBalance, totalIncome, totalExpense}) => {
    const COLORS = ["#59168B", "#B22222", "#006400"];

    const balanceData = [
        {name: "Total Balance", amount: totalBalance},
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
                totalAmount={`$${addThousandSeparator(totalBalance)}`}
                colors={COLORS}
                showTextAnchor
            />
        </div>
    )
}

export default FinanceOverview;