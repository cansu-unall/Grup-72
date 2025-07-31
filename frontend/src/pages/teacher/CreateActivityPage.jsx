import React, { useState } from 'react';
import api from '../../services/api';

const CreateActivityPage = () => {
    const [generatedText, setGeneratedText] = useState('');
    const [simplifiedText, setSimplifiedText] = useState('');

    const handleGenerateText = async () => {
        // POST /api/ai/metin-uret
        try {
            const response = await api.post('/api/ai/metin-uret', {
                kategori: "doğa", // örnek kategori, ihtiyaca göre değiştirilebilir
                uzunluk: 150 // örnek uzunluk, ihtiyaca göre değiştirilebilir
            });
            setGeneratedText(response.data.metin);
        } catch (err) {
            setGeneratedText("Metin üretilemedi.");
        }
    };

    const handleSimplifyText = async () => {
        // POST /api/ai/metin-sadeleştir
        try {
            const response = await api.post('/api/ai/metin-sadeleştir', {
                metin: generatedText
            });
            setSimplifiedText(response.data.sade_metin);
        } catch (err) {
            setSimplifiedText("Metin sadeleştirilemedi.");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Aktivite Oluştur</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* AI Tools */}
                <div className="bg-white p-6 rounded-lg shadow space-y-6">
                    <h2 className="text-2xl font-bold text-indigo-600">Yapay Zeka Araçları</h2>
                    <div>
                        <button onClick={handleGenerateText} className="bg-indigo-500 text-white py-2 px-4 rounded-lg">Metin Üret</button>
                        {generatedText && <p className="mt-4 p-4 bg-gray-100 rounded-lg">{generatedText}</p>}
                    </div>
                     <div>
                        <button onClick={handleSimplifyText} disabled={!generatedText} className="bg-indigo-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-400">Seçili Metni Sadeleştir</button>
                        {simplifiedText && <p className="mt-4 p-4 bg-gray-100 rounded-lg">{simplifiedText}</p>}
                    </div>
                </div>
                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-indigo-600">Aktivite Formu</h2>
                    <form className="space-y-4 mt-4">
                        {/* Form alanları */}
                        <div><label className="block">Başlık</label><input type="text" className="w-full border p-2 rounded-lg"/></div>
                        <div><label className="block">Açıklama</label><textarea className="w-full border p-2 rounded-lg"></textarea></div>
                        <div><label className="block">İçerik (Metin)</label><textarea value={simplifiedText} onChange={e => setSimplifiedText(e.target.value)} className="w-full border p-2 rounded-lg h-32"></textarea></div>
                        <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">Aktiviteyi Kaydet</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateActivityPage;