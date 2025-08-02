import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddRelationshipModal from '../../components/common/AddRelationshipModal';
import Spinner from '../../components/common/Spinner';

const ParentChildrenPage = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    
    const fetchChildren = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/api/kullanicilar/veli/${user.id}/cocuklar`);
            setChildren(response.data);
        } catch (error) {
            console.error("Çocuklar yüklenemedi:", error);
            setChildren([ {id: 1, full_name: 'Efe Can (Örnek)'}, {id: 3, full_name: 'Sude Naz (Örnek)'} ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, [user]);

    return (
        <>
            {isModalOpen && (
                <AddRelationshipModal
                    title="Yeni Çocuk Ekle"
                    inputLabel="Çocuk ID'si"
                    relationshipType="parent-child"
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        fetchChildren(); // Listeyi yenile
                        setIsModalOpen(false); // Modalı kapat
                    }}
                />
            )}
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Çocuklarım</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 font-semibold">+ Yeni Çocuk Ekle</button>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    {isLoading ? <Spinner /> : children.map(child => (
                        <div key={child.id} className="flex justify-between items-center p-4 border-b">
                            <span className="text-xl">{child.full_name}</span>
                            <button onClick={() => navigate(`/parent/child-report/${child.id}`)} className="bg-teal-500 text-white py-1 px-3 rounded-lg hover:bg-teal-600">Detayları Gör</button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};


export default ParentChildrenPage;
