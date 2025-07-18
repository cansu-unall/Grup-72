import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-4">Öğrenci Paneli</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-xl">
          Merhaba <span className="font-bold text-primary">{user?.username}</span>, paneline hoş geldin!
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Burada sana özel hazırlanan okuma alıştırmalarını bulabilir ve gelişimini takip edebilirsin.
        </p>
        {/* Buraya öğrenciye özel bileşenler (widget'lar) eklenecek */}
      </div>
    </div>
  );
};

export default StudentDashboard;