import { formatCurrencyAbs } from "../util/util";
import { Pencil, Trash2, TrendingDown, TrendingUp, UtensilsCrossed } from "lucide-react";

const TransactionInfoCard = ({icon, title, date, amount, type, hideDeleteBtn, onDelete, onEdit}) => {
    // Always visible on touch screens (no hover there), revealed on hover on desktop
    const actionClass = "text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer";
    const getAmountStyles = () => type === 'income' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';

    return(
        <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60 hover:cursor-pointer">
            <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
                {icon ? (
                    <img src={icon} alt={title} className="w-6 h-6"/>
                ) : (
                    <UtensilsCrossed className="text-purple-800"/>
                )}
            </div>

            <div className="flex-1 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-700 font-medium">
                        {title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {date}
                    </p>
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

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>
                        <h6 className="text-xs font-medium">
                            {type === 'income' ? '+' : '-'} {formatCurrencyAbs(amount)}
                        </h6>
                        {type === 'income' ? (
                            <TrendingUp size={15}/>
                        ) : (
                            <TrendingDown size={15}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionInfoCard;