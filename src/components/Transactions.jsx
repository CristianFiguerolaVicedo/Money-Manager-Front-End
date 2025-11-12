import { ArrowRight } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard";
import moment from "moment";

const Transactions = ({transactions, onMore, type, title}) => {
    return(
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">
                    {title}
                </h5>
                <button onClick={onMore} className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                    text-gray-700 bg-gray-100 border border-gray-300 
                    rounded-xl shadow-sm transition-all duration-200 
                    ease-in-out hover:bg-purple-500/10 hover:shadow-md 
                    active:bg-gray-300 active:scale-95 focus:outline-none 
                    focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 hover:cursor-pointer hover:text-purple-800"
                >
                    More <ArrowRight className="text-base" size={15}/>
                </button>
            </div>

            <div className="mt-6">
                {transactions?.slice(0, 5)?.map((item) => (
                    <TransactionInfoCard 
                        key={item.id}
                        title={item.name}
                        icon={item.icon}
                        date={moment(item.date).format('Do MMM YYYY')}
                        amount={item.amount}
                        type={type}
                        hideDeleteBtn
                    />
                ))}
            </div>
        </div>
    )
}

export default Transactions;