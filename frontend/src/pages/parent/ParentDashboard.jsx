import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardCard = ({ to, title, description, emoji }) => (
    <Link to={to} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center text-center">
        <div className="text-5xl mb-4">{emoji}</div>
        <h3 className="text-xl font-bold text-dark-text">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </Link>
);

const ParentDashboard = () => {
    const { user } = useAuth();
    const navLinks = [
        { to: '/parent/children', title: 'Çocuklarım', description: 'Çocuklarının listesini gör ve gelişim raporlarına ulaş.', emoji: '👨‍👩‍👧‍👦' },
    ];
     return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h1 className="text-3xl font-bold">Merhaba, <span className="text-teal-600">{user?.full_name}</span>!</h1>
                <p className="mt-2 text-lg text-gray-700">Veli paneline hoş geldin. Buradan çocuklarının gelişimini takip edebilirsin.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Veli paneli için daha fazla kart eklenebilir. Şimdilik bir tane var. */}
                {navLinks.map(link => <DashboardCard key={link.to} {...link} />)}
            </div>
        </div>
    );
};

export default ParentDashboard;

