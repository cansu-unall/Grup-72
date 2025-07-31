const ClassStatusPage = () => {
    // GET /api/aktiviteler/raporlar/ogretmen/{teacher_id}/sinif-durumu
    const classData = [
        { id: 1, ad: 'Ali Yılmaz', ortalama_skor: 85, son_aktivite_tarihi: '2025-07-30' },
        { id: 2, ad: 'Zeynep Kaya', ortalama_skor: 78, son_aktivite_tarihi: '2025-07-29' },
    ];
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