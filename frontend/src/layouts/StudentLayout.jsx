import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-primary">Disleksi Dostu Uygulama</div>
          <div className="flex items-center space-x-6">
            <NavLink to="/student/dashboard" className={({isActive}) => isActive ? "text-primary font-bold" : "text-dark-text"}>Anasayfa</NavLink>
            {/* Diğer linkler buraya eklenebilir */}
            <span className="text-gray-600">Hoş geldin, {user?.username || 'Öğrenci'}!</span>
            <button onClick={logout} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Çıkış Yap
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;