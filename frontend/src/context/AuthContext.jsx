import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminGetMe, adminLogin as apiLogin, adminLogout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await adminGetMe();
      if (res.data && res.data.success) {
        setAdmin(res.data.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res.data && res.data.success) {
      setAdmin(res.data.admin);
      return res.data;
    }
    throw new Error(res.data?.error || 'Login failed');
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
