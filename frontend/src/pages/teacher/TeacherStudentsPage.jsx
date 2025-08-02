import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddRelationshipModal from '../../components/common/AddRelationshipModal';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const TeacherStudentsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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
            toast.error("Öğrenciler yüklenirken bir hata oluştu.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStudents();
    }, [user]);

    const handleViewStats = (studentId) => {
        navigate(`/teacher/student-report/${studentId}`);
    };

    return (
        <>
            {isModalOpen && (
                <AddRelationshipModal
                    title="Yeni Öğrenci Ekle"
                    // --- GÜNCELLENDİ: Etiket artık doğru ---
                    inputLabel="Öğrenci Email"
                    relationshipType="teacher-student"
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        toast.success("Öğrenci başarıyla eklendi!");
                        fetchStudents();
                        setIsModalOpen(false);
                    }}
                />
            )}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Öğrencilerim</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-primary text-white py-2 px-5 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center"
                    >
                        <span className="text-xl mr-2">+</span> Yeni Öğrenci Ekle
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Spinner />
                        </div>
                    ) : students.length > 0 ? (
                        students.map(student => (
                            <div key={student.id} className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                <span className="text-xl font-medium text-gray-800">{student.full_name}</span>
                                <div>
                                    <button 
                                        onClick={() => handleViewStats(student.id)}
                                        className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        İstatistikler
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">Henüz öğrenciniz bulunmuyor.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherStudentsPage;