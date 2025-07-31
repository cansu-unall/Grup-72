import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ClassStatusPage = () => {
    const { user } = useAuth();
    const [classData, setClassData] = useState([]);

    // GET /api/aktiviteler/raporlar/ogretmen/{teacher_id}/sinif-durumu
    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const response = await api.get(`/api/aktiviteler/raporlar/ogretmen/${user.id}/sinif-durumu`);
                setClassData(response.data);
            } catch (err) {
                setClassData([]);
            }
        };
        if (user?.id) fetchClassData();
    }, [user]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Sınıf Durumu</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Öğrenci</th>
                            <th className="p-4">Ortalama Skor</th>
                            <th className="p-4">Son Aktivite</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classData.map(student => (
                            <tr key={student.id} className="border-b">
                                <td className="p-4">{student.ad}</td>
                                <td className="p-4">{student.ortalama_skor}</td>
                                <td className="p-4">{student.son_aktivite_tarihi}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClassStatusPage;