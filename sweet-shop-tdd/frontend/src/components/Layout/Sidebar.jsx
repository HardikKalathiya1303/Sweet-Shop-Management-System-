import React from "react";
import { NavLink } from "react-router-dom";
import {
  XMarkIcon,
  HomeIcon,
  CakeIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { isAdmin } = useAuth();

  const navigation = isAdmin
    ? [
        {
          name: "Admin Dashboard",
          href: "/admin-dashboard",
          icon: ShieldCheckIcon,
        },
        { name: "All Sweets", href: "/sweets", icon: CakeIcon },
        { name: "Add Sweet", href: "/sweets/add", icon: PlusCircleIcon },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
        { name: "Browse Sweets", href: "/sweets", icon: CakeIcon },
      ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CakeIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Sweet Shop</h1>
          </div>

          <button
            className="lg:hidden text-white hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${
                  isActive
                    ? "bg-white text-purple-600 shadow-lg"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }
              `}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
            <p className="text-sm font-semibold mb-1">
              {isAdmin ? "👨‍💼 Admin Mode" : "👤 User Mode"}
            </p>
            <p className="text-xs text-white/70">
              {isAdmin
                ? "Full system access"
                : "Browse and purchase sweets"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;