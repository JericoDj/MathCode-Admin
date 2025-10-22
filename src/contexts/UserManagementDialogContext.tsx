import { createContext, useContext } from 'react';

export type UserManagementDialogType = 'ADD_STUDENT' | 'EDIT_STUDENT' | 'LINK_PARENT';

interface DialogState {
  type: UserManagementDialogType;
  payload?: any;
}

interface UserManagementDialogContextType {
  dialogState: DialogState | null;
  openDialog: (type: UserManagementDialogType, payload?: any) => void;
  closeDialog: () => void;
}

const defaultContextValue: UserManagementDialogContextType = {
  dialogState: null,
  openDialog: () => {},
  closeDialog: () => {}
};

// UserManagementDialogContext.tsx
export const UserManagementDialogContext = createContext<UserManagementDialogContextType>(defaultContextValue);

export const useUserManagementDialog = () => {
  const context = useContext(UserManagementDialogContext);
  if (!context) {
    throw new Error('useUserManagementDialog must be used within a UserManagementDialogProvider');
  }
  return context;
};
