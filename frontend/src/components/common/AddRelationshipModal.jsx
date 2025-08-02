import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AlertMessage from './AlertMessage';
import Spinner from './Spinner';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AddRelationshipModal = ({ title, inputLabel, relationshipType, onClose, onSuccess }) => {
    const { user } = useAuth(); // Mevcut kullanıcıyı al
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isTeacherStudent = relationshipType === 'teacher-student';

    // E-posta ile arama yapmak için useEffect
    useEffect(() => {
        if (isTeacherStudent && searchTerm.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/api/kullanicilar/ara?email=${searchTerm}&role=student`);
                    setSearchResults(response.data);
                } catch (err) {
                    setError("Öğrenci aranırken bir hata oluştu.");
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            }, 500); // Kullanıcı yazmayı bıraktıktan 500ms sonra ara
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, isTeacherStudent]);

    const handleSelectStudent = (student) => {
        setSearchTerm(student.email); // Input'u seçilen email ile doldur
        setSearchResults([]); // Arama sonuçlarını kapat
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isTeacherStudent) {
                // --- ÖĞRETMEN: E-posta ile öğrenci ekleme ---
                if (!searchTerm.trim()) {
                    setError("Lütfen bir öğrenci e-postası girin veya arayıp seçin.");
                    setLoading(false);
                    return;
                }
                // Backend'e öğretmenin ID'sini ve öğrencinin e-postasını gönder
                await api.post(`/api/kullanicilar/iliskiler/ogretmen-ogrenci-email`, {
                    teacher_id: user.id,
                    student_email: searchTerm
                });
                toast.success('Öğrenci başarıyla eklendi!');

            } else {
                // --- VELİ: ID ile çocuk ekleme ---
                if (!searchTerm.trim()) {
                    setError("Lütfen çocuğunuzun ID'sini girin.");
                    setLoading(false);
                    return;
                }
                // Backend'e velinin ID'sini ve çocuğun ID'sini gönder
                await api.post('/api/kullanicilar/iliskiler/veli-cocuk', {
                    parent_id: user.id,
                    child_id: parseInt(searchTerm)
                });
                toast.success('Çocuk başarıyla eklendi!');
            }
            onSuccess(); // Başarılı olunca listeyi yenile ve modal'ı kapat
        } catch (err) {
            setError(err.response?.data?.detail || "İşlem gerçekleştirilemedi. Lütfen girdilerinizi kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}
                    <div className="space-y-4 relative">
                        <div>
                            <label htmlFor="searchTerm" className="text-lg font-medium">{inputLabel}</label>
                            <input
                                id="searchTerm"
                                type={isTeacherStudent ? "email" : "number"}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                                placeholder={isTeacherStudent ? "Öğrenci e-postası ile arayın..." : "Çocuğunuzun ID'sini girin"}
                                required
                                autoComplete="off"
                            />
                            {isTeacherStudent && searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {searchResults.map(student => (
                                        <li 
                                            key={student.id} 
                                            onClick={() => handleSelectStudent(student)}
                                            className="p-3 hover:bg-indigo-100 cursor-pointer"
                                        >
                                            <span className="font-semibold">{student.full_name}</span>
                                            <span className="text-gray-500 ml-2">({student.email})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 rounded-lg text-lg font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 transition-colors"
                            >
                                {loading ? <Spinner size="sm" /> : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRelationshipModal;