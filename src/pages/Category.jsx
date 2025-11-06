import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";

const Category = () => {
    useUser();

    return(
        <Dashboard activeMenu="Category">
            <div className="my-5 mx-auto">
                    
            </div>  
        </Dashboard>
    )
}

export default Category;