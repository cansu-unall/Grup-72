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
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/aktiviteler/${activityId}`);
                const fetchedActivity = response.data;

                // Gelen 'questions' verisinin her zaman obje dizisi olmasını sağla
                if (Array.isArray(fetchedActivity.questions)) {
                    // Eğer 'questions' bir string dizisi ise, onu obje dizisine çevir.
                    if (fetchedActivity.questions.length > 0 && typeof fetchedActivity.questions[0] === 'string') {
                         fetchedActivity.questions = fetchedActivity.questions.map(q_text => ({ question_text: q_text, options: [] }));
                    }
                } else {
                    // Eğer 'questions' hiç yoksa veya dizi değilse, boş bir dizi ata.
                    fetchedActivity.questions = [];
                }

                setActivity(fetchedActivity);

                if (fetchedActivity?.activity_type === 'quiz' && !fetchedActivity.completed) {
                    const initialAnswers = {};
                    fetchedActivity.questions.forEach((_, index) => {
                        initialAnswers[index] = '';
                    });
                    setAnswers(initialAnswers);
                }
            } catch (err) {
                toast.error("Aktivite yüklenirken bir hata oluştu.");
                setActivity(null);
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
            await api.post('/kelimeler/zor', {
                student_id: user.id,
                kelime: cleanedWord
            });
            toast.success(`'${cleanedWord}' kelimesi zor olarak işaretlendi.`);
        } catch (error) {
            console.error("Kelime işaretleme hatası:", error);
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
                
                if (cevaplarArray.length !== activity.questions.length || cevaplarArray.some(ans => ans === '')) {
                    toast.error("Lütfen tüm soruları cevaplayın.");
                    setIsCompleting(false);
                    return;
                }
                
                response = await api.post(`/api/aktiviteler/ogrenci/${activityId}/cevapla`, {
                    student_id: user.id,
                    cevaplar: cevaplarArray
                });
            } else {
                response = await api.post(`/api/aktiviteler/ogrenci/${activityId}/tamamla`, {
                    feedback: feedback
                });
            }
            
            setActivity(response.data);

            if (response.data.score !== null && response.data.score !== undefined) {
                toast.success(`Aktivite tamamlandı! Skorunuz: ${response.data.score}`, { duration: 4000 });
            } else {
                toast.success(`Aktivite başarıyla tamamlandı!`);
            }

        } catch (err) {
            console.error("Aktivite tamamlama hatası:", err);
            toast.error(err.response?.data?.detail || "Aktivite tamamlanırken bir hata oluştu.");
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (!activity) {
        return <div className="text-center mt-10 text-xl text-red-500">Aktivite bulunamadı veya yüklenemedi.</div>;
    }

    const isQuiz = activity.activity_type === 'quiz';
    const hasQuestions = activity.questions && activity.questions.length > 0;

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
                            activity.questions.map((q, qIndex) => (
                                <div key={qIndex} className="mb-6 pb-4 border-b last:border-b-0">
                                    <p className="font-semibold text-lg mb-3">{qIndex + 1}. {q.question_text}</p>
                                    <div className="space-y-2">
                                        {(q.options || []).map((option, oIndex) => {
                                            const isChecked = activity.completed 
                                                ? (activity.student_answers && activity.student_answers[qIndex] === option)
                                                : answers[qIndex] === option;
                                            
                                            const isCorrect = activity.completed && (activity.correct_answers && activity.correct_answers[qIndex] === option);

                                            let labelClass = "flex items-center p-3 rounded-lg transition-colors border ";
                                            if (activity.completed) {
                                                if (isCorrect) {
                                                    labelClass += "bg-green-100 border-green-400 font-bold";
                                                } else if (isChecked) {
                                                    labelClass += "bg-red-100 border-red-400 line-through";
                                                } else {
                                                    labelClass += "bg-gray-50 border-gray-200";
                                                }
                                            } else {
                                                labelClass += "hover:bg-indigo-50 cursor-pointer border-gray-300";
                                            }

                                            return (
                                                <label key={oIndex} className={labelClass}>
                                                    <input 
                                                        type="radio"
                                                        name={`question-${qIndex}`}
                                                        value={option}
                                                        checked={isChecked}
                                                        onChange={() => handleQuizAnswerChange(qIndex, option)}
                                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        disabled={activity.completed || isCompleting}
                                                    />
                                                    <span className="ml-3 text-gray-700">{option}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
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
                        <>
                            {(isQuiz && hasQuestions) || !isQuiz ? (
                                <>
                                    {!isQuiz && (
                                        <>
                                            <h3 className="text-xl font-semibold mb-3">Geri Bildirim (İsteğe Bağlı)</h3>
                                            <textarea
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                                                rows="3"
                                                placeholder="Aktivite hakkındaki düşünceleriniz..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            />
                                        </>
                                    )}
                                    <button
                                        onClick={handleCompleteActivity}
                                        disabled={isCompleting}
                                        className="mt-4 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold text-lg transition-transform transform hover:scale-105"
                                    >
                                        {isCompleting ? <Spinner size="sm" /> : 'Aktiviteyi Bitir'}
                                    </button>
                                </>
                            ) : null}
                        </>
                    ) : (
                        <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg">
                            <p className="font-bold text-xl">Bu aktiviteyi tamamladınız.</p>
                            {activity.score !== null && activity.score !== undefined && (
                                 <p className="text-lg mt-2">Skorunuz: <span className="font-extrabold text-2xl">{activity.score}</span></p>
                            )}
                            <button
                                onClick={() => navigate('/student/activities')}
                                className="mt-6 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 font-semibold"
                            >
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