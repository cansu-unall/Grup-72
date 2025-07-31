import React from 'react'
import { useParams } from 'react-router-dom';

const ChildReportPage = () => {
    const { childId } = useParams();
    // GET /api/aktiviteler/raporlar/veli/{parent_id}/cocuk-gelisimi (bu endpoint liste döner, filtrelemek gerekir)
    // veya öğrenci raporu endpoint'i kullanılabilir: GET /api/aktiviteler/raporlar/ogrenci/{child_id}/ilerleme
    const reportData = {
        ad: 'Efe Can', ortalama_skor: 78, toplam_aktivite: 12,
        zorlandigi_kelimeler: ['paradoks', 'metafor']
    };
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

