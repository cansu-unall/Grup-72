import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddRelationshipModal from '../../components/common/AddRelationshipModal';
import Spinner from '../../components/common/Spinner';

const TeacherStudentsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // useNavigate hook'unu kullan
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStudents = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/api/kullanicilar/ogretmen/${user.id}/ogrenciler`);
            setStudents(response.data);
        } catch (error) {
            console.error("Öğrenciler yüklenemedi:", error);
            // API çalışmadığında örnek veri göstermek için
            setStudents([ {id: 1, full_name: 'Ali Yılmaz (Örnek)'}, {id: 2, full_name: 'Zeynep Kaya (Örnek)'} ]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStudents();
    }, [user]);

    // YENİ: Öğrenci istatistikleri sayfasına yönlendirme fonksiyonu
    const handleViewStats = (studentId) => {
        // Not: Bu yolun (route) router dosyanızda (örn: App.jsx) tanımlanmış olması gerekir.
        navigate(`/teacher/student-report/${studentId}`);
    };

    return (
        <>
            {isModalOpen && (
                <AddRelationshipModal
                    title="Yeni Öğrenci Ekle"
                    inputLabel="Öğrenci ID'si"
                    relationshipType="teacher-student"
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        fetchStudents();
                        setIsModalOpen(false);
                    }}
                />
            )}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Öğrencilerim</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 font-semibold">+ Yeni Öğrenci Ekle</button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    {isLoading ? <Spinner /> : students.map(student => (
                        <div key={student.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                            <span className="text-xl">{student.full_name}</span>
                            <div>
                                {/* İstatistikler butonu artık işlevsel */}
                                <button 
                                    onClick={() => handleViewStats(student.id)}
                                    className="bg-blue-500 text-white py-1 px-3 rounded-lg mr-2 hover:bg-blue-600"
                                >
                                    İstatistikler
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default TeacherStudentsPage;