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
import DeleteCategoryDialog from "../components/DeleteCategoryDialog";
import { getErrorMessage } from "../util/util";

const Category = () => {
  useUser();

  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [openEditCategoryModal, setOpenEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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
        toast.error(getErrorMessage(error, "No se han podido cargar las categorías"));
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
      toast.error("El nombre de la categoría es obligatorio")
      return;
    }

    const isDuplicate = categoryData.some((existing) => {
      return existing.name.toLowerCase() === name.trim().toLowerCase();
    })

    if(isDuplicate) {
      toast.error("Ya existe una categoría con este nombre");
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_CATEGORY, {name: name.trim(), type, icon});
      if (response.status === 201) {
        toast.success("Categoría creada");
        setOpenAddCategoryModal(false);
        fetchCategoryDetails();
      }
    } catch (error) {
      console.error("Error adding category", error);
      toast.error(getErrorMessage(error, "No se ha podido crear la categoría"));
    }
  }

  const handleEditCategory = (categoryToEdit) => {
    setSelectedCategory(categoryToEdit);
    setOpenEditCategoryModal(true);
  }

  const handleUpdateCategory = async (updatedCategory) => {
    const {id, name, type, icon} = updatedCategory;

    if (!name.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    if (!id) {
      toast.error("Falta el identificador de la categoría");
      return;
    }

    const isDuplicate = categoryData.some((existing) => {
      return existing.id !== id && existing.name.toLowerCase() === name.trim().toLowerCase();
    });

    if (isDuplicate) {
      toast.error("Ya existe una categoría con este nombre");
      return;
    }

    try {
      await axiosConfig.put(API_ENDPOINTS.UPDATE_CATEGORY(id), {name: name.trim(), type, icon});
      setOpenEditCategoryModal(false);
      setSelectedCategory(null);
      toast.success("Categoría actualizada");
      fetchCategoryDetails();
    } catch (error) {
      console.error("Error updating the category", error);
      toast.error(getErrorMessage(error, "No se ha podido actualizar la categoría"));
    }
  }

  return (
    <Dashboard activeMenu="Category">
      <div className="my-5 mx-auto">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">Categorías</h2>
          <button onClick={() => setOpenAddCategoryModal(true)} className="flex items-center gap-1 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg hover:bg-green-500/30 font-semibold hover:cursor-pointer">
            <Plus size={15} />
            Nueva categoría
          </button>
        </div>

        <CategoryList categories={categoryData} onEditCategory={handleEditCategory} onDeleteCategory={setCategoryToDelete}/>

        <Modal
            title="Nueva categoría"
            isOpen={openAddCategoryModal}
            onClose={() => setOpenAddCategoryModal(false)}
        >
            <AddCategoryForm 
              onAddCategory={handleAddCategory}
            />
        </Modal>

        <Modal
          title="Editar categoría"
          isOpen={openEditCategoryModal}
          onClose={() => {setOpenEditCategoryModal(false); setSelectedCategory(null);}}
        >
          <AddCategoryForm 
            onAddCategory={handleUpdateCategory}
            isEditing={true}
            initialCategoryData={selectedCategory}
          />
        </Modal>
        <Modal
          title="Borrar categoría"
          isOpen={Boolean(categoryToDelete)}
          onClose={() => setCategoryToDelete(null)}
        >
          {categoryToDelete && (
            <DeleteCategoryDialog
              key={categoryToDelete.id}
              category={categoryToDelete}
              categories={categoryData}
              onCancel={() => setCategoryToDelete(null)}
              onDeleted={() => {
                setCategoryToDelete(null);
                toast.success("Categoría borrada");
                fetchCategoryDetails();
              }}
            />
          )}
        </Modal>
      </div>
    </Dashboard>
  );
};

export default Category;
