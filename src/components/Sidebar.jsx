import { useContext } from "react";
import { Link } from "react-router-dom";
import AppContext from "../context/AppContext";
import { User } from "lucide-react";
import { SIDE_BAR_GROUPS } from "../assets/assets";

// Deep plum side panel with the menu grouped by task. Real links, so they work with the keyboard,
// middle-click and screen readers (aria-current marks the current page).
const Sidebar = ({ activeMenu, isMobile = false, onNavigate }) => {
  const { user } = useContext(AppContext);

  return (
    <nav
      aria-label="Menú principal"
      className={
        isMobile
          ? "w-full min-h-full bg-plum-900 text-plum-200 px-4 py-5"
          : "w-64 h-[calc(100vh-4rem)] bg-plum-900 text-plum-200 px-4 py-6 sticky top-16 overflow-y-auto"
      }
    >
      <Link
        to="/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2 mb-6 rounded-lg hover:bg-plum-800"
      >
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-plum-700" />
        ) : (
          <span className="h-10 w-10 flex items-center justify-center rounded-full bg-plum-800 text-plum-200">
            <User size={20} aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-medium text-white truncate">{user?.fullName || ""}</span>
          <span className="block text-xs text-plum-300 truncate">{user?.email || ""}</span>
        </span>
      </Link>

      {SIDE_BAR_GROUPS.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="px-3 mb-1.5 text-xs font-medium text-plum-300">{group.label}</p>
          <ul>
            {group.items.map((item) => {
              const active = activeMenu === item.key;
              const ItemIcon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 text-[15px] py-2 px-3 rounded-lg mb-0.5 transition-colors ${
                      active ? "bg-plum-700 text-white font-medium" : "text-plum-200 hover:bg-plum-800 hover:text-white"
                    }`}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-violet-400" aria-hidden="true" />}
                    <ItemIcon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;
