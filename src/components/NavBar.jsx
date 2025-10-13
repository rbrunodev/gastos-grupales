import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GG</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Gastos Grupales
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="font-medium hidden sm:block">{user?.username}</span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
