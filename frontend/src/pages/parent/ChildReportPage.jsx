import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

const ChildReportPage = () => {
    const { childId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [childName, setChildName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            if (!childId || !user) return;
            setLoading(true);
            try {
                const response = await api.get(`/api/aktiviteler/raporlar/veli/${user.id}/cocuk-gelisimi`);
                const childReport = response.data.find(report => report.id === parseInt(childId));
                
                if (childReport) {
                    setReportData(childReport);
                    setChildName(childReport.ad);
                } else {
                    setReportData(null);
                }

            } catch (err) {
                console.error("Çocuk raporu yüklenemedi:", err);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [childId, user]);

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (!reportData) return <div className="text-center mt-10">Bu çocuk için rapor verisi bulunamadı.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{childName} Gelişim Raporu</h1>
                <button onClick={() => navigate(-1)} className="text-teal-600 hover:underline">
                    &larr; Geri Dön
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Toplam Aktivite</h3>
                    <p className="text-4xl font-bold text-teal-600">{reportData.toplam_aktivite}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Ortalama Skor</h3>
                    <p className="text-4xl font-bold text-teal-600">{reportData.ortalama_skor?.toFixed(1) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Son Aktivite Tarihi</h3>
                    <p className="text-2xl font-bold text-teal-600">{new Date(reportData.son_tamamlanan_tarih).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Zorlandığı Aktiviteler</h2>
                    <ul className="mt-4 space-y-2">
                        {reportData.zorlandigi_aktiviteler?.length > 0 ? reportData.zorlandigi_aktiviteler.map((activity, index) => (
                            <li key={index} className="p-3 bg-orange-100 text-orange-800 rounded-lg">{activity}</li>
                        )) : <p>Zorlandığı bir aktivite bulunmuyor.</p>}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Zorlandığı Kelimeler</h2>
                    <ul className="mt-4 space-y-2">
                        {reportData.zorlandigi_kelimeler?.length > 0 ? reportData.zorlandigi_kelimeler.map((wordObject, index) => (
                            <li key={index} className="p-3 bg-red-100 text-red-800 rounded-lg">
                                {wordObject.kelime}
                                {wordObject.tekrar_sayisi && <span className="ml-2 font-bold">({wordObject.tekrar_sayisi} kez)</span>}
                            </li>
                        )) : <p>Zorlandığı bir kelime bulunmuyor.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChildReportPage;