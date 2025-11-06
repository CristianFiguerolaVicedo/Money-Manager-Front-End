import { useState } from "react"
import Input from "./Input";
import EmojiPickerPopup from "./EmojiPickerPopup";

const AddCategoryForm = () => {
    const [category, setCategory] = useState({
        name: "",
        type: "income",
        icon: ""
    });

    const categoryTypeOptions = [
        {value: "income", label: "Income"},
        {value: "expense", label: "Expense"}
    ]

    const handleChange = (key, value) => {
        setCategory({...category, [key]: value})
    }

    return(
        <div className="p-4">

            <EmojiPickerPopup 
                icon={category.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input 
                value={category.name}
                onChange={({target}) => handleChange("name", target.value)}
                label="Category Name"
                placeholder="e.g., Freelance, Salary, Groceries"
                type="text"
            />

            <Input 
                value={category.type}
                onChange={({target}) => handleChange("type", target.value)}
                label="Category Type"
                isSelect={true}
                options={categoryTypeOptions}
            />
        </div>
    )
}

export default AddCategoryForm