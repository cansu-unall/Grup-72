import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParentChildrenPage = () => {
    const [children, setChildren] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    // GET /api/kullanicilar/veli/{parent_id}/cocuklar
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const response = await api.get(`/api/kullanicilar/veli/${user.id}/cocuklar`);
                setChildren(response.data);
            } catch (err) {
                setChildren([]);
            }
        };
        if (user?.id) fetchChildren();
    }, [user]);

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
