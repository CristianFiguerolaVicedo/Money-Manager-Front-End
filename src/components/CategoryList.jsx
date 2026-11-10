import { ChartColumnStacked, Pencil, Trash2 } from "lucide-react";

const TYPE_LABELS = { income: "Ingreso", expense: "Gasto" };

const CategoryList = ({categories, onEditCategory, onDeleteCategory}) => {
    // Always visible on touch screens, revealed on hover on desktop
    const actionClass = "text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer";
    return(
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                    Tus categorías
                </h2>
            </div>

            {categories.length === 0 ? (
                <p className="text-gray-500">
                    Aún no tienes categorías. Crea la primera para empezar a añadir ingresos y gastos.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div key={category.id} className="group relative flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100/60 hover:cursor-pointer">
                            <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
                                {category.icon ? (
                                    <span className="text-2xl">
                                        <img src={category.icon} alt={category.name} className="h-5 w-5"/>
                                    </span>
                                ) : (
                                    <ChartColumnStacked className="text-purple-800" size={24}/>
                                )}
                            </div>

                            <div className="flex-1 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {category.name}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {TYPE_LABELS[category.type?.toLowerCase()] || category.type}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button type="button" aria-label={`Editar ${category.name}`} onClick={() => onEditCategory(category)} className={`${actionClass} hover:text-purple-800`}>
                                        <Pencil size={18}/>
                                    </button>
                                    <button type="button" aria-label={`Borrar ${category.name}`} onClick={() => onDeleteCategory(category)} className={`${actionClass} hover:text-red-800`}>
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CategoryList;