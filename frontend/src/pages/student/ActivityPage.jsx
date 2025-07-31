import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api'; // API servis dosyanı import et

const ActivityPage = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    // Aktivite detaylarını API'den çek
    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await api.get(`/api/aktiviteler/${activityId}`);
                setActivity(response.data);
            } catch (err) {
                setActivity(null);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [activityId]);

    // Zor kelimeyi API'ye gönder
    const handleWordMark = async (word) => {
        try {
            await api.post('/api/kelimeler/zor', {
                activity_id: activityId,
                word: word
            });
            // Başarı mesajı gösterebilirsin
        } catch (err) {
            // Hata mesajı gösterebilirsin
        }
    };

    if (loading) return <div>Yükleniyor...</div>;
    if (!activity) return <div>Aktivite bulunamadı.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Okuma Metni</h2>
                <div className="text-lg leading-relaxed">
                    {activity.content.split(' ').map((word, index) => (
                        <span key={index} className="inline-block mr-1 group relative">
                            {word}
                            <button onClick={() => handleWordMark(word)} className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Zorlandım
                            </button>
                        </span>
                    ))}
                </div>
                <hr className="my-8" />
                <h2 className="text-2xl font-semibold mb-4">Sorular</h2>
                {/* Quiz UI */}
                <button className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg text-lg hover:bg-green-600">
                    Aktiviteyi Bitir
                </button>
            </div>
        </div>
    );
};

export default ActivityPage;