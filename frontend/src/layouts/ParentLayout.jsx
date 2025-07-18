import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const ParentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-teal-600">Veli Paneli</div>
          <div className="flex items-center space-x-6">
            <NavLink to="/parent/dashboard" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-dark-text"}>Anasayfa</NavLink>
            <span className="text-gray-600">Hoş geldin, {user?.username || 'Veli'}!</span>
            <button onClick={logout} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Çıkış Yap
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};
export default ParentLayout;