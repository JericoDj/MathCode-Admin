import React, { useState, useEffect } from 'react';
import { AdminUserContext } from './AdminUserContext';
import type { AdminUser, LoginCredentials } from '../types';
import { adminAuthAPI } from '../utils/auth.api.tsx'; // Assuming this is the file where login and auth-related functions are defined

// AdminUserProvider component to manage adminUser state and context
export const AdminUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On component mount, check if there is a saved user in localStorage
useEffect(() => {
  const checkAuthStatus = async () => {
    const savedUser = adminAuthAPI.getSavedUser();

    if (savedUser) {
      setAdminUser(savedUser);
    }
    setIsLoading(false); // Make sure this is in `finally` block.
  };
  checkAuthStatus();
}, []); // Empty dependency array ensures this only runs once on mount

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { user, token } = await adminAuthAPI.login(credentials); // Attempt login
      adminAuthAPI.setUser(user); // Store the user in localStorage
      adminAuthAPI.setToken(token); // Store the token in localStorage
      setAdminUser(user); // Update the context with the logged-in user
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false); // Stop loading when login attempt is complete
    }
  };

  const logout = () => {
    adminAuthAPI.logout(); // Clear data from localStorage
    setAdminUser(null); // Reset the adminUser state to null
  };

  const updateAdminUser = (updatedUser: Partial<AdminUser>) => {
    if (adminUser) {
      const newUser = { ...adminUser, ...updatedUser }; // Merge the updated user data
      setAdminUser(newUser); // Update the adminUser state
      adminAuthAPI.setUser(newUser); // Save the updated user to localStorage
    }
  };

  // Value to be provided to the context consumers
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
