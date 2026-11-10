import { btnSecondary } from "./ui";
import { formatDate } from "../util/util";
import { ArrowRight } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard";

const ResentTransactions = ({transactions, onMore}) => {
    return(
        <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                    Últimos movimientos
                </h2>
                <button type="button" onClick={onMore} className={btnSecondary}>
                    Ver más <ArrowRight className="text-base" size={15}/>
                </button>
            </div>

            <div className="mt-6">
                {transactions?.slice(0, 5)?.map((item, index) => (
                    <TransactionInfoCard 
                        key={`${item.id}-${item.date || index}`}
                        title={item.name}
                        icon={item.icon}
                        date={formatDate(item.date)}
                        amount={item.amount}
                        type={item.type}
                        hideDeleteBtn
                    />
                ))}
            </div>
        </div>
    )
}

export default ResentTransactions;