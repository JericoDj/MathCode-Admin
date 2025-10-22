// contexts/UserContext.tsx
import { createContext, useContext } from 'react';
import type { UserContextType } from '../types/user';

const defaultContextValue: UserContextType = {
  users: [],
  isLoading: false,
  updateUser: async () => { throw new Error('Not implemented'); },
  addCredits: async () => { throw new Error('Not implemented'); },
  getUser: async () => { throw new Error('Not implemented'); },
  refreshUsers: async () => {},
};

export const UserContext = createContext<UserContextType>(defaultContextValue);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};