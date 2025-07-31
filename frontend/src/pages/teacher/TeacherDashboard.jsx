import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardCard = ({ to, title, description, emoji }) => (
    <Link to={to} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center text-center">
        <div className="text-5xl mb-4">{emoji}</div>
        <h3 className="text-xl font-bold text-dark-text">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </Link>
);

const TeacherDashboard = () => {
    const { user } = useAuth();
     const navLinks = [
        { to: '/teacher/students', title: 'Öğrencilerim', description: 'Öğrencilerini listele, raporlarını incele.', emoji: '👥' },
        { to: '/teacher/create-activity', title: 'Aktivite Oluştur', description: 'Yeni okuma ve quiz aktiviteleri hazırla.', emoji: '📝' },
        { to: '/teacher/class-status', title: 'Sınıf Durumu', description: 'Sınıfının genel başarı durumunu gör.', emoji: '📈' },
    ];
    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h1 className="text-3xl font-bold">Merhaba, <span className="text-indigo-600">{user?.full_name}</span>!</h1>
                <p className="mt-2 text-lg text-gray-700">Öğretmen paneline hoş geldin. Buradan öğrencilerini ve aktivitelerini yönetebilirsin.</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {navLinks.map(link => <DashboardCard key={link.to} {...link} />)}
            </div>
        </div>
    );
};

export default TeacherDashboard;