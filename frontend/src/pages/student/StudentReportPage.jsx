import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

const StudentReportPage = () => {
    const { user } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    // DOKÜMANA UYGUN ENDPOINT: GET /api/aktiviteler/raporlar/ogrenci/{student_id}/durumum
    useEffect(() => {
        const fetchReport = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const response = await api.get(`/api/aktiviteler/raporlar/ogrenci/${user.id}/durumum`);
                setReportData(response.data);
            } catch (err) {
                console.error("Öğrenci durum raporu alınamadı:", err);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [user]);

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    if (!reportData) return <div>Rapor verisi bulunamadı.</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Kişisel Gelişim Raporum</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Başarı Oranı</h3>
                    <p className="text-4xl font-bold text-primary">{reportData.basari_orani}%</p>
                    <p className="text-sm text-gray-500">({reportData.tamamlanan_aktivite}/{reportData.toplam_aktivite} aktivite)</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">Ortalama Skor</h3>
                    <p className="text-4xl font-bold text-primary">{reportData.ortalama_skor?.toFixed(1) || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <h3 className="text-lg text-gray-500">En Yüksek Skor</h3>
                    <p className="text-4xl font-bold text-green-500">{reportData.en_yuksek_skor}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DÜZELTİLMİŞ BÖLÜM 1: Aktiviteler */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Destek Gereken Aktiviteler</h2>
                    <ul className="mt-4 space-y-2">
                        {reportData.zorlandigi_aktiviteler?.length > 0 ? reportData.zorlandigi_aktiviteler.map((activity, index) => (
                            <li key={index} className="p-3 bg-orange-100 text-orange-800 rounded-lg">
                                {activity}
                            </li>
                        )) : <p>Destek gereken bir aktivite bulunmuyor.</p>}
                    </ul>
                </div>
                {/* DÜZELTİLMİŞ BÖLÜM 2: Kelimeler */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Destek Gereken Kelimeler</h2>
                    <ul className="mt-4 space-y-2">
                        {reportData.zorlandigi_kelimeler?.length > 0 ? reportData.zorlandigi_kelimeler.map((wordObject, index) => (
                            <li key={index} className="p-3 bg-red-100 text-red-800 rounded-lg">
                                {wordObject.kelime} 
                                {wordObject.tekrar_sayisi && <span className="ml-2 font-bold">({wordObject.tekrar_sayisi} kez)</span>}
                            </li>
                        )) : <p>Destek gereken bir kelime bulunmuyor.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentReportPage;