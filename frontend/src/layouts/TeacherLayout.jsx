import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// NavLink ve useAuth hook'ları import ediliyor

const TeacherLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navItems = [
    { path: '/teacher/dashboard', label: 'Anasayfa' },
    { path: '/teacher/students', label: 'Öğrencilerim' },
    { path: '/teacher/create-activity', label: 'Aktivite Oluştur' },
    { path: '/teacher/search-activities', label: 'Aktivite Ara' },
    { path: '/teacher/class-status', label: 'Sınıf Durumu' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-600">Öğretmen Paneli</div>
           <div className="flex items-center space-x-4">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} className={({isActive}) => isActive ? "text-indigo-600 font-bold" : "text-dark-text hover:text-indigo-600"}>{item.label}</NavLink>
            ))}
            <span className="text-gray-600">| Hoş geldin, {user?.full_name || 'Öğretmen'}!</span>
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