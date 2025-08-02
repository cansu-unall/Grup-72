import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';

const SearchActivitiesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const searchActivities = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('title', searchTerm);
            if (difficulty) params.append('difficulty_level', difficulty);

            // GET /api/aktiviteler/arama endpoint'ini kullan
            const response = await api.get('/api/aktiviteler/arama', { params });
            setResults(response.data);
        } catch (error) {
            console.error("Arama sırasında hata:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [user, searchTerm, difficulty]);

    useEffect(() => {
        // Sayfa ilk yüklendiğinde veya filtreler temizlendiğinde tüm aktiviteleri getir
        searchActivities();
    }, [searchActivities]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Aktivitelerde Ara</h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6 flex gap-4 items-center">
                <input
                    type="text"
                    placeholder="Aktivite başlığında ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow border p-2 rounded-lg"
                />
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="border p-2 rounded-lg bg-white"
                >
                    <option value="">Tüm Zorluklar</option>
                    <option value="0">Kolay</option>
                    <option value="1">Orta</option>
                    <option value="2">Zor</option>
                </select>
            </div>
            {loading ? <Spinner /> : (
                <div className="space-y-4">
                    {results.length > 0 ? results.map(activity => (
                        <div key={activity.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                            <p className="font-bold text-xl">{activity.title}</p>
                            <p className="text-gray-600">{activity.description}</p>
                            <div className="text-sm mt-2">
                                <span className="font-semibold">Öğrenci ID:</span> {activity.student_id} | 
                                <span className="font-semibold ml-2">Durum:</span> {activity.completed 
                                    ? `Tamamlandı ${activity.score !== null ? `(Skor: ${activity.score})` : ''}` 
                                    : 'Bekliyor'}
                            </div>
                        </div>
                    )) : <p>Arama kriterlerinize uygun aktivite bulunamadı.</p>}
                </div>
            )}
        </div>
    );
};

export default SearchActivitiesPage;