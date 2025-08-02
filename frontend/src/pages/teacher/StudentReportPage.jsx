import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentReportPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            if (!studentId) return;
            setLoading(true);
            try {
                // API dokümanına uygun olarak öğrencinin ilerleme verisini çek
                const reportRes = await api.get(`/api/aktiviteler/raporlar/ogrenci/${studentId}/ilerleme`);
                setReportData(reportRes.data);

                // Öğrencinin adını almak için kullanıcı bilgisini çek
                const studentRes = await api.get(`/api/kullanicilar/${studentId}`);
                setStudent(studentRes.data);

            } catch (err) {
                console.error("Rapor verisi yüklenemedi:", err);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [studentId]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (!reportData || !student) {
        return <div>Rapor verisi bulunamadı.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{student.full_name} Gelişim Raporu</h1>
                <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">
                    &larr; Geri Dön
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Tamamlanan Aktivite</h3>
                    <p className="text-4xl font-bold text-primary">{reportData.total_completed}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Ortalama Skor</h3>
                    <p className="text-4xl font-bold text-primary">{reportData.average_score?.toFixed(1) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">En Yüksek Skor</h3>
                    <p className="text-4xl font-bold text-green-500">{reportData.max_score}</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">En Düşük Skor</h3>
                    <p className="text-4xl font-bold text-red-500">{reportData.min_score}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Zamanla İlerleme (Skorlar)</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.progress_over_time}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="created_at" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#4A90E2" name="Skor" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StudentReportPage;