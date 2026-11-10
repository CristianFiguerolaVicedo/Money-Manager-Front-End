import { useState } from "react";
import { Download, LoaderCircle, Mail } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard";
import { formatDate } from "../util/util";

const actionButtonClass =
  "flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 " +
  "rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:bg-purple-500/10 hover:shadow-md " +
  "active:bg-gray-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 " +
  "hover:cursor-pointer hover:text-purple-800 disabled:opacity-60 disabled:cursor-not-allowed";

// List shared by incomes and expenses, with edit/delete per item and Excel email/download
const TransactionList = ({ config, transactions, loading, onEdit, onDelete, onDownload, onEmail }) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const busy = emailLoading || downloadLoading;
  const isEmpty = !transactions || transactions.length === 0;

  const runWith = (setFlag, action) => async () => {
    setFlag(true);
    try {
      await action();
    } finally {
      setFlag(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 shadow-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h5 className="text-lg">{config.listTitle}</h5>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button disabled={busy || isEmpty} onClick={runWith(setEmailLoading, onEmail)} className={actionButtonClass}>
            {emailLoading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail size={15} className="text-base" />
                Enviar por email
              </>
            )}
          </button>
          <button disabled={busy || isEmpty} onClick={runWith(setDownloadLoading, onDownload)} className={actionButtonClass}>
            {downloadLoading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download size={15} className="text-base" />
                Descargar Excel
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-gray-400">
          <LoaderCircle className="w-6 h-6 animate-spin" />
        </div>
      ) : isEmpty ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          {config.labels.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {transactions.map((item) => (
            <TransactionInfoCard
              key={item.id}
              title={item.name}
              icon={item.icon}
              date={formatDate(item.date)}
              amount={item.amount}
              type={config.type}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
              recurring={item.recurringId != null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
