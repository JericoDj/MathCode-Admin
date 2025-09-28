import React, { createContext, useContext } from 'react';
import type { AdminUser, LoginCredentials } from '../types';

interface AdminUserContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateAdminUser: (user: Partial<AdminUser>) => void;
}

export const AdminUserContext = createContext<AdminUserContextType | undefined>(undefined);

export const useAdminUser = () => {
  const context = useContext(AdminUserContext);
  if (context === undefined) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context;
};