import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const CreateActivityPage = () => {
    const { user } = useAuth();
    
    const initialActivityState = {
        title: '',
        description: '',
        difficulty_level: 1,
        student_id: '',
        content: '', 
    };

    const [activity, setActivity] = useState(initialActivityState);
    
    const [aiCategory, setAiCategory] = useState('doğa');
    const [studentSearch, setStudentSearch] = useState('');
    const [searchedStudents, setSearchedStudents] = useState([]);
    const [selectedStudentName, setSelectedStudentName] = useState('');

    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSimplifying, setIsSimplifying] = useState(false);
    
    // --- GÜNCELLENDİ: İki ayrı yükleme durumu ---
    const [isCreatingReading, setIsCreatingReading] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    // Öğrenci arama fonksiyonu
    useEffect(() => {
        if (studentSearch.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const response = await api.get(`/api/kullanicilar/ara?email=${studentSearch}&role=student`);
                    setSearchedStudents(response.data);
                } catch (error) {
                    toast.error("Öğrenci aranırken hata oluştu.");
                    setSearchedStudents([]);
                }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchedStudents([]);
        }
    }, [studentSearch]);

    const handleStudentSelect = (student) => {
        setActivity(prev => ({ ...prev, student_id: student.id }));
        setSelectedStudentName(student.full_name);
        setStudentSearch('');
        setSearchedStudents([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'difficulty_level' ? Number(value) : value;
        setActivity(prev => ({ ...prev, [name]: processedValue }));
    };

    // Metin üretme ve sadeleştirme fonksiyonları
    const handleGenerateText = async () => {
        if (!aiCategory) {
            toast.error("Lütfen bir kategori girin.");
            return;
        }
        setIsGenerating(true);
        try {
            const response = await api.post('/api/ai/metin-uret', { kategori: aiCategory });
            setGeneratedText(response.data.uretilen_metin);
            toast.success("Metin başarıyla üretildi!");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Metin üretilirken bir hata oluştu.");
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
            const response = await api.post('/api/ai/metin-sadeleştir', { raw_text: generatedText, target_level: activity.difficulty_level });
            setActivity(prev => ({ ...prev, content: response.data.simplified_text }));
            toast.success("Metin sadeleştirildi ve forma eklendi!");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Metin sadeleştirilirken bir hata oluştu.");
        } finally {
            setIsSimplifying(false);
        }
    };

    // --- YENİ: Sadece Okuma Aktivitesi Oluşturma Fonksiyonu ---
    const handleCreateReadingActivity = async () => {
        if (!activity.student_id || !activity.title || !activity.content) {
            toast.error("Lütfen Öğrenci, Başlık ve İçerik alanlarını doldurun.");
            return;
        }
        setIsCreatingReading(true);
        try {
            const payload = {
                ...activity,
                teacher_id: user.id, // Öğretmen ID'si eklendi
                activity_type: 'okuma',
            };
            await api.post('/api/aktiviteler/', payload);
            toast.success('Okuma aktivitesi başarıyla oluşturuldu!');
            
            // Formu temizle
            setActivity(initialActivityState);
            setGeneratedText('');
            setSelectedStudentName('');
        } catch (error) {
            const errorMessage = error.response?.data?.detail?.[0]?.msg || 'Aktivite oluşturulurken bir hata oluştu.';
            toast.error(errorMessage);
        } finally {
            setIsCreatingReading(false);
        }
    };

    // --- Quiz Oluşturma Fonksiyonu (İsmi daha açıklayıcı hale getirildi) ---
    const handleCreateQuizActivity = async () => {
        // --- HATA AYIKLAMA: Butona tıklandığı andaki aktivite durumunu kontrol et ---
        console.log("Quiz oluşturma butonu tıklandı. Mevcut aktivite durumu:", activity);

        if (!activity.student_id || !activity.title || !activity.content) {
            toast.error("Lütfen Öğrenci, Başlık ve İçerik alanlarını doldurun.");
            return;
        }
        
        setIsGeneratingQuiz(true);
        let newActivityId = null;

         try {
            // 1. Adım: Geçici bir "okuma" aktivitesi oluştur
            toast.loading('Aktivite oluşturuluyor...');
            const readingPayload = {
                ...activity,
                teacher_id: user.id,
                activity_type: 'okuma',
            };
            const createResponse = await api.post('/api/aktiviteler/', readingPayload);
            newActivityId = createResponse.data.id;
            
            if (!newActivityId) throw new Error("Aktivite oluşturuldu ancak ID alınamadı.");

            // 2. Adım: Oluşturulan aktivitenin ID'si ile soruları üret
            toast.dismiss();
            toast.loading('Yapay zeka soruları üretiyor...');
            const quizResponse = await api.post(`/api/ai/anlama-sorusu-uret/${newActivityId}`);
            
            console.log("YAPAY ZEKA YANITI:", quizResponse.data);

            const generatedQuestions = quizResponse.data.sorular.map(item => ({
                question_text: item.soru,
                correct_answer: item.dogru_cevap
            }));

            if (!generatedQuestions || generatedQuestions.length === 0) {
                throw new Error("Yapay zeka bu metinden soru üretemedi.");
            }

            // 3. Adım: Aktiviteyi "quiz" olarak güncelle
            toast.dismiss();
            toast.loading('Quiz aktiviteye dönüştürülüyor...');
            
            const quizPayload = {
                title: activity.title,
                description: activity.description,
                content: activity.content,
                difficulty_level: activity.difficulty_level,
                student_id: activity.student_id,
                teacher_id: user.id,
                activity_type: 'quiz',
                questions: JSON.stringify(generatedQuestions)
            };

            console.log("AKTİVİTE GÜNCELLEME PAYLOAD'I:", quizPayload);

            await api.put(`/api/aktiviteler/${newActivityId}`, quizPayload);

            toast.dismiss();
            toast.success('Quiz başarıyla üretildi ve öğrenciye atandı!');
            
            setActivity(initialActivityState);
            setGeneratedText('');
            setSelectedStudentName('');

        } catch (error) {
            toast.dismiss();
            const errorMessage = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'İşlem sırasında bir hata oluştu.';
            toast.error(errorMessage);
            console.error("Quiz oluşturma zincirinde hata:", error);
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Aktivite Oluştur</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yapay Zeka Araçları */}
                <div className="bg-white p-6 rounded-lg shadow space-y-6">
                    <h2 className="text-2xl font-bold text-indigo-600">Yapay Zeka Metin Araçları</h2>
                    <div>
                        <h3 className="font-medium mb-2">1. Adım: Metin Üret</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={aiCategory}
                                onChange={(e) => setAiCategory(e.target.value)}
                                placeholder="Bir kategori girin (örn: hayvanlar)"
                                className="w-full border p-2 rounded-lg"
                            />
                            <button onClick={handleGenerateText} disabled={isGenerating} className="bg-indigo-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 whitespace-nowrap">
                                {isGenerating ? <Spinner size="sm" /> : 'Metin Üret'}
                            </button>
                        </div>
                        {generatedText && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg border">
                                <p className="font-semibold mb-2">Üretilen Metin:</p>
                                <p>{generatedText}</p>
                            </div>
                        )}
                    </div>
                     <div>
                        <h3 className="font-medium mb-2">2. Adım: Metni Sadeleştir ve Forma Ekle</h3>
                        <button onClick={handleSimplifyText} disabled={!generatedText || isSimplifying} className="bg-teal-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 w-full">
                            {isSimplifying ? <Spinner size="sm" /> : 'Metni Sadeleştir ve Kullan'}
                        </button>
                    </div>
                </div>

                {/* Aktivite Formu */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-indigo-600">Aktivite Formu</h2>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mt-4">
                        {/* Öğrenci Arama */}
                        <div className="relative">
                            <label htmlFor="student_search" className="block font-medium">Öğrenci Ata</label>
                            <input 
                                id="student_search" 
                                name="student_search" 
                                type="text" 
                                value={studentSearch} 
                                onChange={(e) => setStudentSearch(e.target.value)} 
                                className="w-full border p-2 rounded-lg"  
                                placeholder="Aramak için öğrenci email'i yazın..."
                                autoComplete="off"
                            />
                            {selectedStudentName && !studentSearch && (
                                <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-lg">
                                    Seçilen Öğrenci: <strong>{selectedStudentName}</strong>
                                </div>
                            )}
                            {searchedStudents.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto">
                                    {searchedStudents.map(student => (
                                        <li key={student.id} onClick={() => handleStudentSelect(student)} className="p-2 hover:bg-indigo-100 cursor-pointer">
                                            {student.full_name} ({student.email})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        {/* Diğer form alanları */}
                        <div>
                            <label htmlFor="title" className="block font-medium">Başlık</label>
                            <input id="title" name="title" type="text" value={activity.title} onChange={handleInputChange} className="w-full border p-2 rounded-lg" required/>
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
                            <label htmlFor="description" className="block font-medium">Açıklama (İsteğe Bağlı)</label>
                            <textarea id="description" name="description" value={activity.description} onChange={handleInputChange} className="w-full border p-2 rounded-lg"></textarea>
                        </div>
                        
                        {/* Okuma Metni İçerik Alanı */}
                        <div>
                            <label htmlFor="content" className="block font-medium">İçerik (Metin)</label>
                            <textarea id="content" name="content" value={activity.content} onChange={handleInputChange} className="w-full border p-2 rounded-lg h-48" required></textarea>
                        </div>

                        {/* --- GÜNCELLENDİ: İki Ayrı Buton Alanı --- */}
                        <div className="border-t pt-4 flex flex-col sm:flex-row gap-4">
                            <button 
                                type="button" 
                                onClick={handleCreateReadingActivity}
                                disabled={isCreatingReading || isGeneratingQuiz} 
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                            >
                                {isCreatingReading ? <Spinner size="sm" /> : 'Okuma Aktivitesi Oluştur'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCreateQuizActivity}
                                disabled={isCreatingReading || isGeneratingQuiz} 
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                            >
                                {isGeneratingQuiz ? <Spinner size="sm" /> : 'Quiz Aktivitesi Oluştur'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;