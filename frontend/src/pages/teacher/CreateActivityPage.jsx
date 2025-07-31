const CreateActivityPage = () => {
    const [generatedText, setGeneratedText] = useState('');
    const [simplifiedText, setSimplifiedText] = useState('');

    const handleGenerateText = async () => {
        // POST /api/ai/metin-uret
        setGeneratedText("Yapay zeka tarafından üretilen örnek metin burada yer alacak. Bu metin, doğa kategorisi için oluşturulmuştur.");
    };

    const handleSimplifyText = async () => {
        // POST /api/ai/metin-sadeleştir
        setSimplifiedText("AI ile üretilen metnin sadeleştirilmiş hali.");
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