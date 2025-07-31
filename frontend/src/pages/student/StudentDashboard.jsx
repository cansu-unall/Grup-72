import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardCard = ({ to, title, description, emoji }) => (
    <Link to={to} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center text-center">
        <div className="text-5xl mb-4">{emoji}</div>
        <h3 className="text-xl font-bold text-dark-text">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </Link>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const navLinks = [
        { to: '/student/activities', title: 'Aktivitelerim', description: 'Sana atanan okuma ve anlama etkinliklerini gör.', emoji: '📚' },
        { to: '/student/report', title: 'Gelişim Raporum', description: 'Skorlarını ve ilerlemeni grafiklerle takip et.', emoji: '📊' },
        { to: '/student/difficult-words', title: 'Zor Kelimelerim', description: 'İşaretlediğin zor kelimeleri tekrar et.', emoji: '🧠' },
        { to: '/student/help-bot', title: 'Yardım Botu', description: 'Anlamadığın kelimeleri yapay zekaya sor.', emoji: '🤖' },
    ];

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h1 className="text-3xl font-bold">Merhaba, <span className="text-primary">{user?.full_name}</span>!</h1>
                <p className="mt-2 text-lg text-gray-700">Öğrenme yolculuğuna devam etmeye hazır mısın? Aşağıdaki menüden istediğin bölüme gidebilirsin.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {navLinks.map(link => <DashboardCard key={link.to} {...link} />)}
            </div>
        </div>
    );
};

export default StudentDashboard;