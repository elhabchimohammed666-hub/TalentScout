import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('talentscout_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const saved = localStorage.getItem('talentscout_user');
      if (saved) {
        try {
          const res = await authAPI.getMe();
          const parsed = JSON.parse(saved);
          const updated = { ...parsed, ...res.data };
          setUser(updated);
          localStorage.setItem('talentscout_user', JSON.stringify(updated));
        } catch (err) {
          console.error('Session expired or invalid token', err);
          localStorage.removeItem('talentscout_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    setUser(res.data);
    localStorage.setItem('talentscout_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('talentscout_user');
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    const updated = { ...user, ...res.data };
    setUser(updated);
    localStorage.setItem('talentscout_user', JSON.stringify(updated));
    return res.data;
  };

  const isManager = user?.role === 'academy_manager';
  const isCoach = user?.role === 'coach';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        isManager,
        isCoach,
      }}
    >
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
