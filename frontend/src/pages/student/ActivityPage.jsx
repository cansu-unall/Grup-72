import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const ActivityPage = () => {
    const { activityId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/aktiviteler/${activityId}`);
                const fetchedActivity = response.data;
                
                console.log("BACKEND'DEN GELEN AKTİVİTE VERİSİ:", fetchedActivity);

                if (typeof fetchedActivity.questions === 'string') {
                    fetchedActivity.questions = JSON.parse(fetchedActivity.questions);
                }

                setActivity(fetchedActivity);

                if (fetchedActivity?.activity_type === 'quiz' && !fetchedActivity.completed) {
                    const initialAnswers = {};
                    (fetchedActivity.questions || []).forEach((q, index) => {
                        initialAnswers[index] = '';
                    });
                    setAnswers(initialAnswers);
                }
            } catch (err) {
                toast.error("Aktivite yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [activityId]);

    const handleWordMark = async (word) => {
        const cleanedWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();
        if (!cleanedWord || activity.completed) return;
        
        try {
            await api.post('/kelimeler/zor', { student_id: user.id, kelime: cleanedWord });
            toast.success(`'${cleanedWord}' kelimesi zor olarak işaretlendi.`);
        } catch (error) {
            toast.error(error.response?.data?.detail || "Kelime işaretlenemedi.");
        }
    };

    const handleQuizAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleCompleteActivity = async () => {
        setIsCompleting(true);
        try {
            let response;
            if (activity.activity_type === 'quiz') {
                const cevaplarArray = Object.values(answers);
                if (cevaplarArray.length !== activity.questions.length || cevaplarArray.some(ans => ans.trim() === '')) {
                    toast.error("Lütfen tüm soruları cevaplayın.");
                    setIsCompleting(false);
                    return;
                }
                response = await api.post(`/api/aktiviteler/ogrenci/${activityId}/cevapla`, { 
                    student_id: user.id,
                    cevaplar: cevaplarArray 
                });
            } else {
                response = await api.put(`/api/aktiviteler/${activityId}`, { completed: true });
            }

            setActivity(response.data);
            toast.success(response.data.score !== null ? `Aktivite tamamlandı! Skorunuz: ${response.data.score}` : `Aktivite başarıyla tamamlandı!`);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Aktivite tamamlanırken bir hata oluştu.");
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (!activity) return <div className="text-center mt-10 text-xl text-red-500">Aktivite bulunamadı.</div>;

    const isQuiz = activity.activity_type === 'quiz';
    const hasQuestions = Array.isArray(activity.questions) && activity.questions.length > 0;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{activity.title}</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">{activity.description}</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                {isQuiz ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Sorular</h2>
                        {hasQuestions ? (
                            activity.questions.map((questionData, qIndex) => (
                                <div key={qIndex} className="mb-6 pb-4 border-b last:border-b-0">
                                    <p className="font-semibold text-lg mb-3">{qIndex + 1}. {questionData.question_text}</p>
                                    {activity.completed ? (
                                        <div className="space-y-2">
                                            <p className="p-3 bg-gray-100 rounded-lg">Sizin Cevabınız: <span className="font-medium">{activity.student_answers[qIndex]}</span></p>
                                            <p className={`p-3 rounded-lg ${activity.student_answers[qIndex] === questionData.correct_answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                Doğru Cevap: <span className="font-medium">{questionData.correct_answer}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <input 
                                            type="text"
                                            value={answers[qIndex] || ''}
                                            onChange={(e) => handleQuizAnswerChange(qIndex, e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                                            placeholder="Cevabınızı buraya yazın..."
                                            disabled={isCompleting}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Bu quiz için henüz soru eklenmemiş.</p>
                        )}
                    </div>
                ) : (
                    <div className="prose max-w-none text-lg leading-relaxed">
                        <p className='text-sm text-gray-500 mb-4 italic'>Zorlandığın kelimenin üzerine tıklayarak işaretleyebilirsin.</p>
                        {(activity.content ?? '').split(/(\s+)/).map((word, index) => (
                            <span key={index} onClick={() => handleWordMark(word)} className={`cursor-pointer transition-colors ${!activity.completed && 'hover:bg-yellow-200'}`}>
                                {word}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t">
                    {!activity.completed ? (
                        <button onClick={handleCompleteActivity} disabled={isCompleting} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold text-lg">
                            {isCompleting ? <Spinner size="sm" /> : 'Aktiviteyi Bitir'}
                        </button>
                    ) : (
                        <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg">
                            <p className="font-bold text-xl">Bu aktiviteyi tamamladınız.</p>
                            {activity.score !== null && <p className="text-lg mt-2">Skorunuz: <span className="font-extrabold text-2xl">{activity.score}</span></p>}
                            <button onClick={() => navigate('/student/activities')} className="mt-6 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 font-semibold">
                                Aktivitelerime Geri Dön
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;