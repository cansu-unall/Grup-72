import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import AlertMessage from '../components/common/AlertMessage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, setError } = useAuth();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message);

  const handleInputChange = (e) => {
    if (e.target.id === 'email') {
      setEmail(e.target.value);
    } else if (e.target.id === 'password') {
      setPassword(e.target.value);
    }
    if (error) {
      setError(null);
    }
  };

  const handleCloseErrorAlert = () => {
    setError(null);
  };

  const handleCloseSuccessAlert = () => {
    setSuccessMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-dark-text">Giriş Yap</h2>
          <p className="mt-2 text-lg text-gray-600">Hesabınıza erişmek için giriş yapın.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <AlertMessage message={error} type="error" onClose={handleCloseErrorAlert} />}
          {successMessage && <AlertMessage message={successMessage} type="success" onClose={handleCloseSuccessAlert} />}
          
          <div>
            <label htmlFor="email" className="text-lg font-medium text-gray-700">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleInputChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-primary focus:border-primary"
              placeholder="ornek@mail.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-lg font-medium text-gray-700">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-primary focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
            >
              {loading ? <Spinner /> : 'Giriş Yap'}
            </button>
          </div>
        </form>
        <p className="text-center text-base text-gray-600">
          Hesabın yok mu?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-blue-600">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;