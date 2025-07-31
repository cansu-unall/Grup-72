import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const ParentChildrenPage = () => {
    const [children, setChildren] = useState([]);
    const navigate = useNavigate();
    // GET /api/kullanicilar/veli/{parent_id}/cocuklar
    useEffect(() => {
        setChildren([ {id: 1, full_name: 'Efe Can'}, {id: 3, full_name: 'Sude Naz'} ]);
    }, []);
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Çocuklarım</h1>
             <div className="bg-white p-6 rounded-lg shadow">
                {children.map(child => (
                    <div key={child.id} className="flex justify-between items-center p-4 border-b">
                        <span className="text-xl">{child.full_name}</span>
                        <button onClick={() => navigate(`/parent/child-report/${child.id}`)} className="bg-teal-500 text-white py-1 px-3 rounded-lg hover:bg-teal-600">Detayları Gör</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentChildrenPage;

