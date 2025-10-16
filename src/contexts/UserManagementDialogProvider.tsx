import React, { useState } from 'react';
import { UserManagementDialogContext, type UserManagementDialogType } from './UserManagementDialogContext';

import { EditStudentModal } from '../components/Users/EditStudentModal';
import { LinkParentModal } from '../components/Users/LinkParentModal';
import type { User } from '../types';

interface DialogProviderProps {
  children: React.ReactNode;
}

export const UserManagementDialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [dialogState, setDialogState] = useState<{ type: UserManagementDialogType; payload?: any } | null>(null);

  const openDialog = (type: UserManagementDialogType, payload?: any) => {
    setDialogState({ type, payload });
  };

  const closeDialog = () => setDialogState(null);

  return (
    <UserManagementDialogContext.Provider value={{ dialogState, openDialog, closeDialog }}>
      {children}

     
    </UserManagementDialogContext.Provider>
  );
};
