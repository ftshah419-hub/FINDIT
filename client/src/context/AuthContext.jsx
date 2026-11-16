import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('findit_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('findit_admin_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('findit_admin_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.warn('[Auth] Session verification failed, clearing token.');
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;

    if (receivedUser.role !== 'ADMIN') {
      throw new Error('Access Denied: Only users with the ADMIN role can access this console.');
    }

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('findit_admin_token', receivedToken);
    localStorage.setItem('findit_admin_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('findit_admin_token');
    localStorage.removeItem('findit_admin_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
