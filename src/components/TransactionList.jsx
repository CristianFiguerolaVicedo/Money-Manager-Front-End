import { useState } from "react";
import { Download, FileUp, LoaderCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import TransactionInfoCard from "./TransactionInfoCard";
import { btnSecondary } from "./ui";
import { formatDate } from "../util/util";

const actionButtonClass = btnSecondary;

const PAGE_SIZE = 20;

// List shared by incomes and expenses, with edit/delete per item and Excel email/download
const TransactionList = ({ config, transactions, loading, onEdit, onDelete, onDownload, onEmail }) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  // Long months are shown 20 at a time (the parent resets this per month with `key`)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg">{config.listTitle}</h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link to={`/import?type=${config.type}`} className={actionButtonClass}>
            <FileUp size={15} className="text-base" />
            Importar CSV
          </Link>
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

      {/* While refreshing, keep the list on screen (focus stays on its buttons) */}
      {loading && isEmpty ? (
        <div className="flex justify-center py-10 text-gray-400">
          <LoaderCircle className="w-6 h-6 animate-spin" />
        </div>
      ) : isEmpty ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          {config.labels.empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {transactions.slice(0, visibleCount).map((item) => (
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
              note={item.note}
              attachmentCount={item.attachmentCount || 0}
            />
          ))}
        </div>
      )}

      {transactions && transactions.length > visibleCount && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="px-4 py-2 text-sm font-medium text-purple-800 border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer"
          >
            Mostrar {Math.min(PAGE_SIZE, transactions.length - visibleCount)} más ({visibleCount} de {transactions.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
