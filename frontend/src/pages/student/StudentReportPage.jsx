import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentReportPage = () => {
    const { user } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    // GET /api/aktiviteler/raporlar/ogrenci/{student_id}/ilerleme
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/api/aktiviteler/raporlar/ogrenci/${user.id}/ilerleme`);
                setReportData(response.data);
            } catch (err) {
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchReport();
    }, [user]);

    if (loading) return <div>Yükleniyor...</div>;
    if (!reportData) return <div>Rapor verisi bulunamadı.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gelişim Raporum</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Tamamlanan Aktivite</h3>
                    <p className="text-4xl font-bold text-primary">{reportData.total_completed}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Ortalama Skor</h3>
                    <p className="text-4xl font-bold text-primary">{reportData.average_score}</p>
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
                <h2 className="text-2xl font-bold mb-4">Zamanla İlerleme</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.progress_over_time}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="created_at" />
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