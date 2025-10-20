// contexts/UserProvider.tsx
import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import type { User, UpdateUserData } from '../types/user';
import { userAPI } from '../utils/user.api';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load users on mount
  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await userAPI.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserData): Promise<User> => {
    try {
      setIsLoading(true);
      const updatedUser = await userAPI.updateUser(userId, userData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? updatedUser : user
      ));
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async (userId: string, creditsToAdd: number): Promise<User> => {
    try {
      setIsLoading(true);
      
      // Use the API method that gets current credits first
      const updatedUser = await userAPI.addCredits(userId, creditsToAdd);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? updatedUser : user
      ));
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to add credits:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = async (userId: string): Promise<User> => {
    try {
      setIsLoading(true);
      const user = await userAPI.getUser(userId);
      return user;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    users,
    isLoading,
    updateUser,
    addCredits,
    getUser,
    refreshUsers,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};