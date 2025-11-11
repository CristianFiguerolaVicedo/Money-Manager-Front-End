import { useEffect, useState } from "react";
import { prepareIncomeLineChartData } from "../util/util";
import CustomLineChart from "./CustomLineChart";
import { Plus } from "lucide-react";

const IncomeOverview = ({transactions, onAddIncome}) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareIncomeLineChartData(transactions);
        setChartData(result);

        return () => {};
    }, [transactions]);

    return(
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">
                        Income Overview
                    </h5>
                    <p className="text-xs text-gray-400 mt-0 5">
                        Track your earnings over time and analise your income trends
                    </p>
                </div>
                <button onClick={onAddIncome} className="flex items-center gap-1 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg hover:bg-green-500/30 font-semibold hover:cursor-pointer">
                    <Plus size={15} className="text-lg"/> Add Income
                </button>
            </div>

            <div className="mt-10">
                    <CustomLineChart data={chartData}/>
            </div>
        </div>
    )
}

export default IncomeOverview;