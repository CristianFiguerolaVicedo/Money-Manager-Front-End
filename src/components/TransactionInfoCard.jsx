import { formatCurrencyAbs } from "../util/util";
import { Paperclip, Pencil, Repeat, Trash2, TrendingDown, TrendingUp, UtensilsCrossed } from "lucide-react";

const TransactionInfoCard = ({icon, title, date, amount, type, hideDeleteBtn, onDelete, onEdit, recurring = false, note = null, attachmentCount = 0}) => {
    // Always visible on touch screens (no hover there), revealed on hover on desktop
    const actionClass = "text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer";
    const getAmountStyles = () => type === 'income' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';

    return(
        <div className="group relative flex items-center gap-4 mt-1 p-3 rounded-xl hover:bg-gray-50">
            <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
                {icon ? (
                    <img src={icon} alt="" className="w-6 h-6"/>
                ) : (
                    <UtensilsCrossed className="text-purple-800" aria-hidden="true"/>
                )}
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="flex items-center gap-1.5 min-w-0 text-sm text-gray-800 font-medium">
                        <span className="truncate" title={title}>{title}</span>
                        {attachmentCount > 0 && (
                            <span title={`${attachmentCount} archivo${attachmentCount === 1 ? "" : "s"} adjunto${attachmentCount === 1 ? "" : "s"}`} className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                                <Paperclip size={12} aria-hidden="true" />
                                <span className="sr-only">({attachmentCount} adjuntos)</span>
                                <span aria-hidden="true">{attachmentCount}</span>
                            </span>
                        )}
                        {recurring && (
                            <span title="Recurrente" className="inline-flex items-center text-purple-800">
                                <Repeat size={13} aria-hidden="true" />
                                <span className="sr-only">(recurrente)</span>
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {date}
                    </p>
                    {note && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 break-all" title={note}>
                            {note}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button type="button" aria-label={`Editar ${title}`} onClick={onEdit} className={`${actionClass} hover:text-purple-800`}>
                            <Pencil size={17}/>
                        </button>
                    )}

                    {!hideDeleteBtn && onDelete && (
                        <button type="button" aria-label={`Borrar ${title}`} onClick={onDelete} className={`${actionClass} hover:text-red-800`}>
                            <Trash2 size={18}/>
                        </button>
                    )}

                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md whitespace-nowrap ${getAmountStyles()}`}>
                        <span className="text-sm font-semibold tabular-nums">
                            {type === 'income' ? '+' : '−'}{formatCurrencyAbs(amount)}
                        </span>
                        {type === 'income' ? (
                            <TrendingUp size={15} className="hidden sm:block" aria-hidden="true"/>
                        ) : (
                            <TrendingDown size={15} className="hidden sm:block" aria-hidden="true"/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionInfoCard;