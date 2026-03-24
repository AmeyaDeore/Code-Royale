import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        // Optionally verify token with backend here
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token } = res.data.data; // adjust based on actual response
      // Our backend returns _id, name, email, role, token in data
      const mappedUser = {
        id: res.data.data._id,
        name: res.data.data.name,
        email: res.data.data.email,
        role: res.data.data.role
      };
      
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setUser(mappedUser);
      return { success: true, role: mappedUser.role };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const mappedUser = {
        id: res.data.data._id,
        name: res.data.data.name,
        email: res.data.data.email,
        role: res.data.data.role
      };
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setUser(mappedUser);
      return { success: true, role: mappedUser.role };
    } catch (error) {
       return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
