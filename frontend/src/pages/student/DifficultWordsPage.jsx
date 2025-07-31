import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const DifficultWordsPage = () => {
    const [words, setWords] = useState([]);
    useEffect(() => {
        const fetchWords = async () => {
            try {
                const response = await api.get('/api/kelimeler/tekrar');
                setWords(
                    response.data.sort((a, b) => b.tekrar_sayisi - a.tekrar_sayisi)
                );
            } catch (err) {
                setWords([]);
            }
        };
        fetchWords();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Zorlandığım Kelimeler</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <ul className="space-y-4">
                    {words.map(word => (
                        <li key={word.kelime} className="flex justify-between items-center p-4 border rounded-lg">
                            <span className="text-xl font-medium">{word.kelime}</span>
                            <span className="text-lg font-bold text-primary">{word.tekrar_sayisi} kez</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DifficultWordsPage;