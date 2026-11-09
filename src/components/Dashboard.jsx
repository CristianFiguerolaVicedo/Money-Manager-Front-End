import { useContext } from "react";
import Menubar from "./Menubar";
import Sidebar from "./Sidebar";
import AppContext from "../context/AppContext";

const Dashboard = ({ children, activeMenu }) => {
  const { user } = useContext(AppContext);

  return (
    <div>
      <Menubar activeMenu={activeMenu} />

      {user && (
        <div className="flex">
          <div className="hidden lg:block">
            <Sidebar activeMenu={activeMenu} />
          </div>

          <main className="grow min-w-0 px-3 sm:px-5 py-5">{children}</main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
