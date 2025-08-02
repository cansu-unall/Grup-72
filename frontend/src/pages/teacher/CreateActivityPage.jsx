import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const CreateActivityPage = () => {
    const { user } = useAuth();
    
    const initialActivityState = {
        title: '',
        description: '',
        activity_type: 'okuma',
        difficulty_level: 1,
        student_id: '',
        content: '', // Okuma metni içeriği
        questions: [{ question_text: '', options: ['', ''], correct_answer: '' }] // Quiz soruları
    };

    const [activity, setActivity] = useState(initialActivityState);
    
    const [generatedText, setGeneratedText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSimplifying, setIsSimplifying] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'difficulty_level' || name === 'student_id' ? (value === '' ? '' : Number(value)) : value;
        setActivity(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...activity.questions];
        newQuestions[index][field] = value;
        setActivity(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...activity.questions];
        // Seçenek değiştiğinde, doğru cevabı sıfırla
        newQuestions[qIndex].options[oIndex] = value;
        newQuestions[qIndex].correct_answer = ''; 
        setActivity(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        const newQuestions = [...activity.questions, { question_text: '', options: ['', ''], correct_answer: '' }];
        setActivity(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeQuestion = (index) => {
        const newQuestions = activity.questions.filter((_, i) => i !== index);
        setActivity(prev => ({ ...prev, questions: newQuestions }));
    };

    const addOption = (qIndex) => {
        const newQuestions = [...activity.questions];
        newQuestions[qIndex].options.push('');
        setActivity(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...activity.questions];
        if (newQuestions[qIndex].options.length > 2) { // En az 2 seçenek kalmalı
            newQuestions[qIndex].options.splice(oIndex, 1);
            // Seçenek silindiğinde, doğru cevabı sıfırla
            newQuestions[qIndex].correct_answer = '';
            setActivity(prev => ({ ...prev, questions: newQuestions }));
        } else {
            toast.error("Bir sorunun en az iki seçeneği olmalıdır.");
        }
    };

    const handleGenerateText = async () => {
        setIsGenerating(true);
        try {
            const response = await api.post('/api/ai/metin-uret', { kategori: "doğa" });
            setGeneratedText(response.data.uretilen_metin);
            toast.success("Metin başarıyla üretildi!");
        } catch (err) {
            toast.error("Metin üretilirken bir hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSimplifyText = async () => {
        if (!generatedText) {
            toast.error("Lütfen önce bir metin üretin.");
            return;
        }
        setIsSimplifying(true);
        try {
            const response = await api.post('/api/ai/metin-sadeleştir', { raw_text: generatedText, target_level: 0 });
            setActivity(prev => ({ ...prev, content: response.data.simplified_text }));
            toast.success("Metin sadeleştirildi ve forma eklendi!");
        } catch (err) {
            toast.error("Metin sadeleştirilirken bir hata oluştu.");
        } finally {
            setIsSimplifying(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Okuma aktivitesi için tek adımlı işlem
            if (activity.activity_type === 'okuma') {
                if (!activity.title || !activity.content || !activity.student_id) {
                    toast.error("Lütfen Başlık, İçerik ve Öğrenci ID alanlarını doldurun.");
                    setIsSubmitting(false);
                    return;
                }
                const payload = {
                    activity_type: activity.activity_type,
                    title: activity.title,
                    description: activity.description,
                    content: activity.content,
                    difficulty_level: activity.difficulty_level,
                    student_id: activity.student_id,
                };
                await api.post('/api/aktiviteler/', payload);
            } 
            // Quiz aktivitesi için iki adımlı işlem
            else if (activity.activity_type === 'quiz') {
                if (!activity.title || !activity.student_id || activity.questions.some(q => !q.question_text || !q.correct_answer || q.options.some(opt => opt.trim() === ''))) {
                    toast.error("Lütfen Başlık, Öğrenci ID ve tüm sorular için soru metni, doğru cevap ve tüm seçenek alanlarını doldurun.");
                    setIsSubmitting(false);
                    return;
                }

                // Adım 1: Sorular olmadan aktivite kabuğunu oluştur
                const baseActivityPayload = {
                    activity_type: activity.activity_type,
                    title: activity.title,
                    description: activity.description,
                    content: "Quiz soruları eklenecek.", // API'ye boş olmayan bir içerik gönder
                    difficulty_level: activity.difficulty_level,
                    student_id: activity.student_id,
                };
                const createResponse = await api.post('/api/aktiviteler/', baseActivityPayload);
                const newActivityId = createResponse.data.id;

                // Adım 2: Oluşturulan aktiviteyi sorularla güncelle
                const updatePayload = {
                    questions: activity.questions,
                };
                await api.put(`/api/aktiviteler/${newActivityId}`, updatePayload);
            }

            toast.success('Aktivite başarıyla oluşturuldu ve öğrenciye atandı!');
            setActivity(initialActivityState);
            setGeneratedText('');

        } catch (error) {
            console.error("Aktivite oluşturma hatası:", error);
            const errorMessage = error.response?.data?.detail || 'Aktivite oluşturulurken bir hata oluştu.';
            toast.error(Array.isArray(errorMessage) ? errorMessage[0].msg : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isQuiz = activity.activity_type === 'quiz';

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Aktivite Oluştur</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yapay Zeka Araçları */}
                <div className={`bg-white p-6 rounded-lg shadow space-y-6 ${isQuiz ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <h2 className="text-2xl font-bold text-indigo-600">Yapay Zeka Araçları</h2>
                    <p className="text-sm text-gray-500">Bu araçlar sadece "Okuma Metni" türü için kullanılabilir.</p>
                    <div>
                        <h3 className="font-medium mb-2">1. Adım: Metin Üret</h3>
                        <button onClick={handleGenerateText} disabled={isGenerating || isQuiz} className="bg-indigo-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 w-full">
                            {isGenerating ? <Spinner size="sm" /> : 'Rastgele Metin Üret'}
                        </button>
                        {generatedText && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg border">
                                <p className="font-semibold mb-2">Üretilen Metin:</p>
                                <p>{generatedText}</p>
                            </div>
                        )}
                    </div>
                     <div>
                        <h3 className="font-medium mb-2">2. Adım: Metni Sadeleştir ve Forma Ekle</h3>
                        <button onClick={handleSimplifyText} disabled={!generatedText || isSimplifying || isQuiz} className="bg-teal-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 w-full">
                            {isSimplifying ? <Spinner size="sm" /> : 'Metni Sadeleştir ve Kullan'}
                        </button>
                    </div>
                </div>

                {/* Aktivite Formu */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-indigo-600">Aktivite Formu</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
                        {/* Ortak Alanlar */}
                        <div>
                            <label htmlFor="student_id" className="block font-medium">Öğrenci ID</label>
                            <input id="student_id" name="student_id" type="number" value={activity.student_id} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required placeholder="Öğrenci ID'sini girin"/>
                        </div>
                        <div>
                            <label htmlFor="title" className="block font-medium">Başlık</label>
                            <input id="title" name="title" type="text" value={activity.title} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required/>
                        </div>
                        <div>
                            <label htmlFor="activity_type" className="block font-medium">Aktivite Türü</label>
                            <select name="activity_type" id="activity_type" value={activity.activity_type} onChange={handleInputChange} className="w-full border p-2 rounded-lg bg-white">
                                <option value="okuma">Okuma Metni</option>
                                <option value="quiz">Quiz</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="difficulty_level" className="block font-medium">Zorluk Seviyesi</label>
                            <select name="difficulty_level" id="difficulty_level" value={activity.difficulty_level} onChange={handleInputChange} className="w-full border p-2 rounded-lg bg-white">
                                <option value={0}>Kolay</option>
                                <option value={1}>Orta</option>
                                <option value={2}>Zor</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block font-medium">Açıklama</label>
                            <textarea id="description" name="description" value={activity.description} onChange={handleInputChange} className="w-full border p-2 rounded-lg"></textarea>
                        </div>

                        {/* Dinamik Alanlar */}
                        {isQuiz ? (
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="text-xl font-semibold">Sorular</h3>
                                {activity.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="block font-medium">Soru {qIndex + 1}</label>
                                            <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Soruyu Kaldır</button>
                                        </div>
                                        <textarea value={q.question_text} onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)} className="w-full border p-2 rounded-lg" placeholder="Soru metnini girin" required />
                                        
                                        <label className="block font-medium text-sm">Seçenekler</label>
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center space-x-2">
                                                <input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full border p-2 rounded-lg text-sm" placeholder={`Seçenek ${oIndex + 1}`} required />
                                                <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="text-gray-500 hover:text-red-600 p-1 text-xs">Kaldır</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addOption(qIndex)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-md">
                                            + Seçenek Ekle
                                        </button>

                                        <label className="block font-medium text-sm pt-2 border-t">Doğru Cevap</label>
                                        <select 
                                            value={q.correct_answer} 
                                            onChange={(e) => handleQuestionChange(qIndex, 'correct_answer', e.target.value)} 
                                            className="w-full border p-2 rounded-lg bg-green-50" 
                                            required
                                        >
                                            <option value="" disabled>Doğru cevabı seçin...</option>
                                            {q.options.map((opt, oIndex) => (
                                                opt.trim() !== '' && <option key={oIndex} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                                <button type="button" onClick={addQuestion} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                                    Yeni Soru Ekle
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="content" className="block font-medium">İçerik (Metin)</label>
                                <textarea id="content" name="content" value={activity.content} onChange={handleInputChange} className="w-full border p-2 rounded-lg h-32" required></textarea>
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold">
                            {isSubmitting ? <Spinner size="sm" /> : 'Aktiviteyi Oluştur ve Ata'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;