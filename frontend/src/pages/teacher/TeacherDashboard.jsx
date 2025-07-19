import React from 'react';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-4">Öğretmen Paneli</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-xl">
          Merhaba <span className="font-bold text-indigo-600">{user?.username}</span>, paneline hoş geldin!
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Buradan öğrencilerinizin ilerlemesini takip edebilir ve onlara yeni görevler atayabilirsiniz.
        </p>
      </div>
    </div>
  );
};
export default TeacherDashboard;