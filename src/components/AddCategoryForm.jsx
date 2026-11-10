import { useEffect, useState } from "react"
import Input from "./Input";
import EmojiPickerPopup from "./EmojiPickerPopup";
import { LoaderCircle } from "lucide-react";

const AddCategoryForm = ({onAddCategory, initialCategoryData, isEditing}) => {
    const [category, setCategory] = useState({
        name: "",
        type: "income",
        icon: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing && initialCategoryData) {
            setCategory({...initialCategoryData, type: initialCategoryData.type?.toLowerCase() || "income"});
        } else {
            setCategory({name: "", type: "income", icon: ""});
        }
    }, [isEditing, initialCategoryData]);

    const categoryTypeOptions = [
        {value: "income", label: "Ingreso"},
        {value: "expense", label: "Gasto"}
    ]

    const handleChange = (key, value) => {
        setCategory({...category, [key]: value})
    }

    const handleSubmit = async () => {
        setLoading(true);

        try {
            await onAddCategory(category);
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="sm:p-4">

            <EmojiPickerPopup 
                icon={category.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input 
                value={category.name}
                onChange={({target}) => handleChange("name", target.value)}
                label="Nombre de la categoría"
                placeholder="p. ej., Nómina, Supermercado, Alquiler"
                type="text"
            />

            <Input 
                value={category.type}
                onChange={({target}) => handleChange("type", target.value)}
                label="Tipo"
                isSelect={true}
                options={categoryTypeOptions}
                disabled={isEditing}
            />

            <div className="flex justify-end mt-6">
                <button disabled={loading} onClick={handleSubmit} type="button" className="flex items-center gap-1 bg-violet-700 text-white px-3 py-2 rounded-lg hover:bg-violet-800 font-semibold hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                        <>
                            <LoaderCircle className="w-4 h-4 animate-spin"/>
                            {isEditing ? "Guardando..." : "Creando..."}
                        </>
                    ) : (
                        <>
                            {isEditing ? "Guardar cambios" : "Crear categoría"}
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AddCategoryForm