import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import AlertMessage from '../components/common/AlertMessage';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'student',
  });
  const { register, loading, error, setError } = useAuth(); // AuthContext'ten error ve setError alıyoruz

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) { 
      setError(null);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    register(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-dark-text">Hesap Oluştur</h2>
          <p className="mt-2 text-lg text-gray-600">Uygulamayı kullanmaya başlamak için kaydolun.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <AlertMessage message={error} type="error" onClose={handleCloseAlert} />}
          <div>
            <label htmlFor="username" className="text-lg font-medium text-gray-700">Kullanıcı Adı</label>
            <input id="username" name="username" type="text" onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label htmlFor="full_name" className="text-lg font-medium text-gray-700">Ad Soyad (Opsiyonel)</label>
            <input id="full_name" name="full_name" type="text" onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="email" className="text-lg font-medium text-gray-700">E-posta</label>
            <input id="email" name="email" type="email" onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label htmlFor="password" className="text-lg font-medium text-gray-700">Şifre</label>
            <input id="password" name="password" type="password" onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-primary focus:border-primary" required minLength={8} />
          </div>
          <div>
            <label htmlFor="role" className="text-lg font-medium text-gray-700">Rol</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white focus:ring-primary focus:border-primary">
              <option value="student">Öğrenci</option>
              <option value="teacher">Öğretmen</option>
              <option value="parent">Veli</option>
            </select>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
              {loading ? <Spinner /> : 'Kayıt Ol'}
            </button>
          </div>
        </form>
        <p className="text-center text-base text-gray-600">
          Zaten bir hesabın var mı?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-blue-600">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;