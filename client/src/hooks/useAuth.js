import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      if (data.status === 'success') {
        setUser(data.data.user);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch {
      localStorage.removeItem('admin_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password }, false);
    if (data.status === 'success') {
      localStorage.setItem('admin_token', data.data.token);
      setUser(data.data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    window.location.reload();
  };

  return { user, isLoading, login, logout };
};
