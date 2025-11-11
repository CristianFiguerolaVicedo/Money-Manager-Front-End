import { useEffect, useState } from "react";
import EmojiPickerPopup from "./EmojiPickerPopup";
import Input from "./Input";
import { LoaderCircle } from "lucide-react";

const AddExpenseForm = ({onAddExpense, categories}) => {
    const [expense, setExpense] = useState({
        name: "",
        categoryId: "",
        amount: "",
        date: "",
        icon: ""
    });

    const [loading, setLoading] = useState(false);

    const categoryOptions = categories.map((category) => ({
        value: category.id,
        label: `${category.name}`,
    }));

    const handleChange = (key, value) => setExpense({...expense, [key]: value});

    const handleAddExpense = async () => {
        setLoading(true);

        try {
            await onAddExpense(expense);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (categories && categories.length > 0 && !expense.categoryId) {
            setExpense((prev) => ({...prev, categoryId: categories[0].id}));
        }
    }, [categories,expense.categoryId]);

    return(
        <div>
            <EmojiPickerPopup 
                icon={expense.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input 
                value={expense.name}
                onChange={({target}) => handleChange("name", target.value)}
                label="Expense Source"
                placeholder="e.g., Bills, Transport, Utilities"
                type="text"
            />

            <Input 
                value={expense.categoryId}
                onChange={({target}) => handleChange("categoryId", target.value)}
                label="Category"
                isSelect={true}
                options={categoryOptions}
            />

            
            <Input 
                value={expense.amount}
                onChange={({target}) => handleChange("amount", target.value)}
                label="Amount"
                placeholder="e.g., 500"
                type="number"
            />

            
            <Input 
                value={expense.date}
                onChange={({target}) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
            />

            <div className="flex justify-end mt-6">
                <button disabled={loading} onClick={handleAddExpense} className="flex items-center gap-1 bg-purple-800 text-white px-3 py-2 rounded-lg hover:bg-purple-500 font-semibold hover:cursor-pointer">
                    {loading ? (
                        <>
                            <LoaderCircle className="w-4 h-4 animate-spin"/>
                            Adding...
                        </>
                    ) : (
                        <>
                            Add Expense
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AddExpenseForm;