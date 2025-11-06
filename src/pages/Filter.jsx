import Dashboard from "../components/Dashboard";
import useUser from "../hooks/useUser";

const Filter = () => {
    useUser();

    return(
        <Dashboard activeMenu="Filters">
            This is a filter page    
        </Dashboard>
    )
}

export default Filter;