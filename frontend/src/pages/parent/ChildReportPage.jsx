import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChildReportPage = () => {
    const { childId } = useParams();
    const { user } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    // GET /api/aktiviteler/raporlar/ogrenci/{child_id}/ilerleme
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/api/aktiviteler/raporlar/ogrenci/${childId}/ilerleme`);
                setReportData(response.data);
            } catch (err) {
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };
        if (childId) fetchReport();
    }, [childId]);

    if (loading) return <div>Yükleniyor...</div>;
    if (!reportData) return <div>Rapor verisi bulunamadı.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{reportData.ad} Gelişim Raporu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Toplam Aktivite</h3>
                    <p className="text-4xl font-bold text-teal-600">{reportData.toplam_aktivite}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Ortalama Skor</h3>
                    <p className="text-4xl font-bold text-teal-600">{reportData.ortalama_skor}</p>
                </div>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold">Zorlandığı Kelimeler</h2>
                <ul className="mt-4 space-y-2">
                    {reportData.zorlandigi_kelimeler.map(word => <li key={word} className="p-3 bg-red-100 text-red-800 rounded-lg">{word}</li>)}
                </ul>
            </div>
        </div>
    );
};

export default ChildReportPage;