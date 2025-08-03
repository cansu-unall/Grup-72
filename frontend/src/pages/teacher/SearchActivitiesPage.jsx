import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SearchActivitiesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // --- YENİ: Modal ve düzenleme için state'ler ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const searchActivities = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = {
                title: searchTerm || undefined,
                difficulty_level: difficulty || undefined,
            };
            const response = await api.get('/api/aktiviteler/arama', { params });
            setResults(response.data);
        } catch (error) {
            console.error("Arama sırasında hata:", error);
            toast.error("Aktiviteler yüklenirken bir hata oluştu.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [user, searchTerm, difficulty]);

    useEffect(() => {
        searchActivities();
    }, [searchActivities]);

    // --- YENİ: Aktivite silme fonksiyonu ---
    const handleDelete = async (activityId) => {
        if (window.confirm('Bu aktiviteyi kalıcı olarak silmek istediğinizden emin misiniz?')) {
            try {
                await api.delete(`/api/aktiviteler/${activityId}`);
                toast.success('Aktivite başarıyla silindi.');
                setResults(prevResults => prevResults.filter(act => act.id !== activityId));
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Aktivite silinirken bir hata oluştu.');
            }
        }
    };

    // --- YENİ: Modal açma fonksiyonu ---
    const openEditModal = (activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    // --- YENİ: Modal'daki form alanlarını güncelleme ---
    const handleModalInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedActivity(prev => ({ ...prev, [name]: value }));
    };

    // --- YENİ: Aktivite güncelleme fonksiyonu ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedActivity) return;
        setIsSubmitting(true);
        try {
            const { id, student_id, completed, score, feedback, created_at, completed_at, questions, student_answers, correct_answers, ...updateData } = selectedActivity;
            const response = await api.put(`/api/aktiviteler/${id}`, updateData);
            toast.success('Aktivite başarıyla güncellendi.');
            setResults(prevResults => prevResults.map(act => act.id === id ? response.data : act));
            setIsModalOpen(false);
            setSelectedActivity(null);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Aktivite güncellenirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Aktivitelerde Ara</h1>
            <div className="bg-white p-6 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Aktivite başlığında ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow border p-2 rounded-lg w-full"
                />
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="border p-2 rounded-lg bg-white w-full sm:w-auto"
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
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-xl">{activity.title}</p>
                                    <p className="text-gray-600 mt-1">{activity.description}</p>
                                    <div className="text-sm mt-2 text-gray-500">
                                        <span className="font-semibold">Öğrenci ID:</span> {activity.student_id} | 
                                        <span className="font-semibold ml-2">Durum:</span> {activity.completed 
                                            ? `Tamamlandı ${activity.score !== null ? `(Skor: ${activity.score})` : ''}` 
                                            : 'Bekliyor'}
                                    </div>
                                </div>
                                {/* --- YENİ: Düzenle ve Sil Butonları --- */}
                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => openEditModal(activity)} className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Düzenle</button>
                                    <button onClick={() => handleDelete(activity.id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Sil</button>
                                </div>
                            </div>
                        </div>
                    )) : <p>Arama kriterlerinize uygun aktivite bulunamadı.</p>}
                </div>
            )}

            {/* --- YENİ: Düzenleme Modal'ı --- */}
            {isModalOpen && selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6">Aktiviteyi Düzenle</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block font-medium">Başlık</label>
                                <input id="title" name="title" type="text" value={selectedActivity.title} onChange={handleModalInputChange} className="w-full border p-2 rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block font-medium">Açıklama</label>
                                <textarea id="description" name="description" value={selectedActivity.description} onChange={handleModalInputChange} className="w-full border p-2 rounded-lg"></textarea>
                            </div>
                            <div>
                                <label htmlFor="content" className="block font-medium">İçerik</label>
                                <textarea id="content" name="content" value={selectedActivity.content} onChange={handleModalInputChange} className="w-full border p-2 rounded-lg h-32"></textarea>
                            </div>
                             <div>
                                <label htmlFor="difficulty_level" className="block font-medium">Zorluk Seviyesi</label>
                                <select name="difficulty_level" id="difficulty_level" value={selectedActivity.difficulty_level} onChange={handleModalInputChange} className="w-full border p-2 rounded-lg bg-white">
                                    <option value={0}>Kolay</option>
                                    <option value={1}>Orta</option>
                                    <option value={2}>Zor</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400">İptal</button>
                                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400">
                                    {isSubmitting ? <Spinner size="sm" /> : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchActivitiesPage;