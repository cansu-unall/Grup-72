import React, { useEffect, useState } from 'react';

const TeacherStudentsPage = () => {
    const [students, setStudents] = useState([]);
    // GET /api/kullanicilar/ogretmen/{teacher_id}/ogrenciler
    useEffect(() => {
        setStudents([ {id: 1, full_name: 'Ali Yılmaz'}, {id: 2, full_name: 'Zeynep Kaya'} ]);
    }, []);
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Öğrencilerim</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                {students.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-4 border-b">
                        <span className="text-xl">{student.full_name}</span>
                        <div>
                            <button className="bg-blue-500 text-white py-1 px-3 rounded-lg mr-2 hover:bg-blue-600">İstatistikler</button>
                            <button className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600">Aktivite Ata</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherStudentsPage;
