import React, { createContext, useContext } from 'react';
import type { AdminUser, LoginCredentials } from '../types';

// Define the context type
interface AdminUserContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateAdminUser: (user: Partial<AdminUser>) => void;
}

// Default context value to handle cases when no provider is used
const defaultContextValue: AdminUserContextType = {
  adminUser: null,
  isLoading: false,
  login: async () => false,  // Placeholder function for login
  logout: () => {},          // Placeholder function for logout
  updateAdminUser: () => {}, // Placeholder function for updating user
};

// Create context with default value
export const AdminUserContext = createContext<AdminUserContextType>(defaultContextValue);

// Custom hook to use the AdminUserContext
export const useAdminUser = () => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error('useAdminUser must be used within an AdminUserProvider');
  }
  return context;
};
