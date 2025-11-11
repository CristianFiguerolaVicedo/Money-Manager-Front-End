import { Download, LoaderCircle, Mail } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard";
import moment from "moment";
import { useState } from "react";

const IncomeList = ({ transactions, onDelete, onDownload, onEmail }) => {
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    setLoading(true);
    try {
      await onEmail();
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async () => {
    setLoading(true);
    try {
      await onDownload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 shadow-xl p-4">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income Sources</h5>
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={loading}
            onClick={handleEmail}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                  text-gray-700 bg-gray-100 border border-gray-300 
                  rounded-xl shadow-sm transition-all duration-200 
                  ease-in-out hover:bg-purple-500/10 hover:shadow-md 
                  active:bg-gray-300 active:scale-95 focus:outline-none 
                  focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 hover:cursor-pointer hover:text-purple-800"
          >
            {loading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin"/>
                Emailing...
              </>
            ) : (
              <>
                <Mail size={15} className="text-base" />
                Email
              </>
            )}
          </button>
          <button
            disabled={loading}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                  text-gray-700 bg-gray-100 border border-gray-300 
                  rounded-xl shadow-sm transition-all duration-200 
                  ease-in-out hover:bg-purple-500/10 hover:shadow-md 
                  active:bg-gray-300 active:scale-95 focus:outline-none 
                  focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 hover:cursor-pointer hover:text-purple-800"
          >
          {loading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin"/>
                Downloading...
              </>
            ) : (
              <>
                <Download size={15} className="text-base" />
                Download
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((income) => (
            <TransactionInfoCard 
                key={income.id}
                title={income.name}
                icon={income.icon}
                date={moment(income.date).format('Do MMM YYYY')}
                amount={income.amount}
                type="income"
                onDelete={() => onDelete(income.id)}
            />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
