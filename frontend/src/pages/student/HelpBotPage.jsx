import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HelpBotPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        try {
            const response = await api.post('/api/ai/yardim-bot', { 
                soru: input, 
                student_id: user.id // <-- student_id ekle
            });
            setMessages([...newMessages, { sender: 'bot', text: response.data.yanit }]);
        } catch (err) {
            setMessages([...newMessages, { sender: 'bot', text: 'Bir hata oluştu, lütfen tekrar deneyin.' }]);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Yardım Botu</h1>
            <div className="bg-white p-6 rounded-lg shadow h-[600px] flex flex-col">
                <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-grow border rounded-l-lg p-3 text-lg" placeholder="Bir kelime veya kavram sor..."/>
                    <button onClick={handleSend} className="bg-primary text-white px-6 rounded-r-lg hover:bg-blue-600">Gönder</button>
                </div>
            </div>
        </div>
    );
};

export default HelpBotPage;