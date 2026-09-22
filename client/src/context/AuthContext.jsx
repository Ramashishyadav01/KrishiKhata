import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('krishikhata_token') || localStorage.getItem('khetkhata_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          localStorage.removeItem('krishikhata_token');
          localStorage.removeItem('khetkhata_token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (mobile, password) => {
    const res = await api.post('/auth/login', { mobile, password });
    if (res.data.success) {
      localStorage.setItem('krishikhata_token', res.data.token);
      localStorage.setItem('khetkhata_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (name, mobile, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, mobile, password, confirmPassword });
    return res.data;
  };

  const resetPassword = async (mobile, newPassword, confirmPassword) => {
    const res = await api.post('/auth/reset-password', { mobile, newPassword, confirmPassword });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('krishikhata_token');
    localStorage.removeItem('khetkhata_token');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    try {
      sessionStorage.clear();
    } catch (e) {
      // Ignore if sessionStorage disabled
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
