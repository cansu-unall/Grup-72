import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth hook'u AuthContext'ten import ediliyor

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/student/dashboard', label: 'Anasayfa' },
    { path: '/student/activities', label: 'Aktivitelerim' },
    { path: '/student/difficult-words', label: 'Zor Kelimelerim' },
    { path: '/student/report', label: 'Gelişim Raporum' },
    { path: '/student/help-bot', label: 'Yardım Botu' },
  ];

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-primary">Öğrenci Paneli</div>
          <div className="flex items-center space-x-4">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} className={({isActive}) => isActive ? "text-primary font-bold" : "text-dark-text hover:text-primary"}>{item.label}</NavLink>
            ))}
            <span className="text-gray-600">| Hoş geldin, {user?.full_name || 'Öğrenci'}!</span>
            <button onClick={logout} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Çıkış Yap
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default StudentLayout;