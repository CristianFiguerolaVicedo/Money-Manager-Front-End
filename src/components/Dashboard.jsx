import { useContext } from "react";
import Menubar from "./Menubar";
import Sidebar from "./Sidebar";
import AppContext from "../context/AppContext";

const Dashboard = ({ children, activeMenu }) => {
  const { user } = useContext(AppContext);

  return (
    <div>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <Menubar activeMenu={activeMenu} />

      {user && (
        <div className="flex">
          <div className="hidden lg:block">
            <Sidebar activeMenu={activeMenu} />
          </div>

          <main id="main-content" tabIndex={-1} className="grow min-w-0 px-4 sm:px-8 py-6 focus:outline-none">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
