import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AdminUserContext } from './AdminUserContext';
import type { AdminUser, LoginCredentials } from '../types';
import { adminAuthAPI } from '../utils/api';

interface AdminUserProviderProps {
  children: ReactNode;
}

export const AdminUserProvider: React.FC<AdminUserProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const user = await adminAuthAPI.verifyToken(token);
        setAdminUser(user);
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { user, token } = await adminAuthAPI.login(credentials);
      
      localStorage.setItem('adminToken', token);
      setAdminUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminUser(null);
  };

  const updateAdminUser = (updatedUser: Partial<AdminUser>) => {
    if (adminUser) {
      setAdminUser({ ...adminUser, ...updatedUser });
    }
  };

  const value = {
    adminUser,
    isLoading,
    login,
    logout,
    updateAdminUser,
  };

  return (
    <AdminUserContext.Provider value={value}>
      {children}
    </AdminUserContext.Provider>
  );
};