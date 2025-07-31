import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeacherStudentsPage = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    // GET /api/kullanicilar/ogretmen/{teacher_id}/ogrenciler
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get(`/api/kullanicilar/ogretmen/${user.id}/ogrenciler`);
                setStudents(response.data);
            } catch (err) {
                setStudents([]);
            }
        };
        if (user?.id) fetchStudents();
    }, [user]);
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Öğrencilerim</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                {students.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-4 border-b">
                        <span className="text-xl">{student.full_name}</span>
                        <div>
                            <button className="bg-blue-500 text-white py-1 px-3 rounded-lg mr-2 hover:bg-blue-600">İstatistikler</button>
                            <button className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600">Aktivite Ata</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherStudentsPage;