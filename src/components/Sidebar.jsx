import { useContext } from "react";
import AppContext from "../context/AppContext";
import { User } from "lucide-react";
import { SIDE_BAR_DATA } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeMenu, isMobile = false }) => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <nav className={isMobile ? "w-full bg-white p-5" : "w-64 h-[calc(100vh-73px)] bg-white border-r border-gray-200/50 p-5 sticky top-[73px] z-20 overflow-y-auto"}>
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user?.profileImageUrl || ""}
            alt="Foto de perfil"
            className="h-20 w-20 bg-slate-400 rounded-full object-cover"
          />
        ) : (
          <User className="w-20 h-20 text-xl" />
        )}
        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ""}
        </h5>
      </div>
      {SIDE_BAR_DATA.map((item, index) => (
        <button
          onClick={() => navigate(item.path)}
          key={`menu_${index}`}
          aria-current={activeMenu === item.key ? "page" : undefined}
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 hover:cursor-pointer ${activeMenu === item.key ? "text-white bg-purple-800" : "hover:bg-gray-100"}`}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
