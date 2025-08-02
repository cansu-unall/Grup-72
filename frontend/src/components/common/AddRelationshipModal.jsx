import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from './AlertMessage';
import Spinner from './Spinner';

const AddRelationshipModal = ({ title, inputLabel, relationshipType, onClose, onSuccess }) => {
    const [targetId, setTargetId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetId.trim()) {
            setError("Lütfen bir ID girin.");
            return;
        }
        setLoading(true);
        setError(null);

        let payload;
        let endpoint;

        if (relationshipType === 'teacher-student') {
            endpoint = '/api/kullanicilar/iliskiler/ogrenci-ogretmen';
            payload = { teacher_id: user.id, student_id: parseInt(targetId) };
        } else { // parent-child
            endpoint = '/api/kullanicilar/iliskiler/veli-cocuk';
            payload = { parent_id: user.id, child_id: parseInt(targetId) };
        }

        try {
            await api.post(endpoint, payload);
            onSuccess(); // Parent component'teki listeyi yenile
        } catch (err) {
            setError(err.response?.data?.detail || "İlişki kurulamadı. Lütfen girdiğiniz ID'yi kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="targetId" className="text-lg font-medium">{inputLabel}</label>
                            <input
                                id="targetId"
                                type="number"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                                placeholder="Kullanıcı ID'sini girin"
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 rounded-lg text-lg font-medium text-white bg-primary hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {loading ? <Spinner /> : 'İlişkiyi Kaydet'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRelationshipModal;