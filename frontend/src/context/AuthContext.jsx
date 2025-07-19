import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Kullanıcı bilgisini çek
          const response = await api.get('/api/kullanicilar/ben');
          setUser(response.data);
        } catch (err) {
          console.error("Token doğrulanamadı, oturum sonlandırılıyor.", err);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token]);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      // Sadece email ve password gönderiliyor
      const response = await api.post('/api/giris/oturum-ac', { email, password });
      const { access_token } = response.data;

      setToken(access_token);
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Kullanıcı bilgisini çek
      const meResponse = await api.get('/api/kullanicilar/ben');
      setUser(meResponse.data);

      // Role göre yönlendirme
      navigate(`/${meResponse.data.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // username, email, full_name (opsiyonel), password, role gönderiliyor
      await api.post('/api/kullanicilar/kayit', userData);
      navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Kayıt işlemi başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = { user, token, loading, error, login, register, logout, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};