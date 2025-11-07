import { Plus } from "lucide-react";
import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";
import CategoryList from "../components/CategoryList";
import { useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import AddCategoryForm from "../components/AddCategoryForm";

const Category = () => {
  useUser();

  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategoryDetails = async () => {
    if (loading) {
        return;
    }

    setLoading(true);

    try {
        const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
        if (response.status === 200) {
            setCategoryData(response.data);
        }
    } catch (error) {
        console.error("Something went wrong. Please try again.", error);
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategoryDetails();
  }, []);

  const handleAddCategory = async (category) => {
    const {name, type, icon} = category;

    if (!name.trim()) {
      toast.error("Category name is required")
      return;
    }

    const isDuplicate = categoryData.some((category) => {
      return category.name.toLowerCase() === name.trim().toLowerCase();
    })

    if(isDuplicate) {
      toast.error("Category name already exists");
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_CATEGORY, {name, type, icon});
      if (response.status === 201) {
        toast.success("Category added successfully");
        setOpenAddCategoryModal(false);
        fetchCategoryDetails();
      }
    } catch (error) {
      console.error("Error adding category", error);
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  }

  return (
    <Dashboard activeMenu="Category">
      <div className="my-5 mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">All Categories</h2>
          <button onClick={() => setOpenAddCategoryModal(true)} className="flex items-center gap-1 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg hover:bg-green-500/30 font-semibold hover:cursor-pointer">
            <Plus size={15} />
            Add Category
          </button>
        </div>

        <CategoryList categories={categoryData} />

        <Modal
            title="Add Category"
            isOpen={openAddCategoryModal}
            onClose={() => setOpenAddCategoryModal(false)}
        >
            <AddCategoryForm 
              onAddCategory={handleAddCategory}
            />
        </Modal>
      </div>
    </Dashboard>
  );
};

export default Category;
