import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

const StudentActivitiesPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActivities = async () => {
            if (!user) return;
            try {
                const response = await api.get(`/aktiviteler/ogrenci/${user.id}`);
                setActivities(response.data);
            } catch (error) {
                console.error("Aktiviteler yüklenemedi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user]);

    if (loading) return <Spinner />;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Aktivitelerim</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.length > 0 ? activities.map(activity => (
                    <div key={activity.id} className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-primary">{activity.title}</h2>
                        <p className="text-gray-600 mt-2">{activity.description}</p>
                        <div className="mt-4">
                            <span className={`px-3 py-1 text-sm rounded-full ${activity.completed ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                {activity.completed ? 'Tamamlandı' : 'Bekliyor'}
                            </span>
                        </div>
                        {activity.completed && (
                            <p className="mt-2 font-semibold">Skor: {activity.score}</p>
                        )}
                        <button 
                            onClick={() => navigate(`/student/activity/${activity.id}`)}
                            className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600">
                            {activity.completed ? 'Tekrar Gözden Geçir' : 'Başla'}
                        </button>
                    </div>
                )) : <p>Size atanmış bir aktivite bulunmamaktadır.</p>}
            </div>
        </div>
    );
};

export default StudentActivitiesPage;
