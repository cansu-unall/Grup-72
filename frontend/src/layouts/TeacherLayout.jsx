import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const TeacherLayout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-600">Öğretmen Paneli</div>
          <div className="flex items-center space-x-6">
            <NavLink to="/teacher/dashboard" className={({isActive}) => isActive ? "text-indigo-600 font-bold" : "text-dark-text"}>Anasayfa</NavLink>
            <span className="text-gray-600">Hoş geldin, {user?.username || 'Öğretmen'}!</span>
            <button onClick={logout} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Çıkış Yap
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};
export default TeacherLayout;