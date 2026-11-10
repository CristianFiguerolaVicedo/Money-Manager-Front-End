import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../context/AppContext";
import { LogOut, Menu, User, UserRound, X } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeSwitcher from "./ThemeSwitcher";
import { clearToken } from "../util/auth";

const Menubar = ({activeMenu}) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);
  const { user, clearUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken(); // keeps per-browser settings such as the theme
    clearUser();
    setShowDropdown(false);
    navigate("/login");
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Escape closes the menu and gives focus back to the button that opened it
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        userButtonRef.current?.focus();
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    }
  }, [showDropdown]);

  useEffect(() => {
    document.body.style.overflow = openSideMenu ? "hidden" : "auto";
    if (!openSideMenu) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpenSideMenu(false);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [openSideMenu]);

  return (
    <header className="flex items-center justify-between gap-5 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <button
          type="button"
          aria-label={openSideMenu ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={openSideMenu}
          onClick={() => setOpenSideMenu(!openSideMenu)}
          className="block lg:hidden text-gray-800 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {openSideMenu ? (
            <X className="text-2xl hover:cursor-pointer" />
          ) : (
            <Menu className="text-2xl hover:cursor-pointer" />
          )}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <img src={assets.logo} alt="" className="app-logo w-9 h-9 shrink-0" />
          <span className="text-lg font-semibold tracking-tight text-gray-900 truncate">
            Money Manager
          </span>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          ref={userButtonRef}
          aria-label="Menú de usuario"
          aria-expanded={showDropdown}
          aria-controls="user-menu"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
        >
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <User className="text-purple-500" />
          )}
        </button>

        {showDropdown && (
          <div id="user-menu" className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100">
              <ThemeSwitcher />
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/profile");
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:cursor-pointer transition-colors duration-150"
              >
                <UserRound className="w-4 h-4 text-gray-500" />
                <span>Mi perfil</span>
              </button>
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                <LogOut className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {openSideMenu && (
        <div className="fixed inset-x-0 top-16 bottom-0 bg-plum-900 lg:hidden z-20 overflow-y-auto">
          <Sidebar activeMenu={activeMenu} isMobile onNavigate={() => setOpenSideMenu(false)} />
        </div>
      )}
    </header>
  );
};

export default Menubar;
