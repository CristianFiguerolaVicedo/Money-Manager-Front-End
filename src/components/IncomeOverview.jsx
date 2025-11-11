import { useEffect, useState } from "react";
import { prepareIncomeLineChartData } from "../util/util";
import CustomLineChart from "./CustomLineChart";

const IncomeOverview = ({transactions}) => {
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
            </div>

            <div className="mt-10">
                    <CustomLineChart data={chartData}/>
            </div>
        </div>
    )
}

export default IncomeOverview;