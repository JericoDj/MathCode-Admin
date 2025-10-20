// contexts/SessionContext.tsx
import React, { createContext, useContext } from 'react';
import type { Session } from '../pages/AdminPage/Sessions/SessionsManagement';

export interface CreateSessionData {
  studentId: string;
  parentId: string;
  studentName: string;
  parentName: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: Session['status'];
  packageType: string;
  notes?: string;
  meetingLink?: string;
}

export interface UpdateSessionData {
  tutorName?: string;
  subject?: string;
  date?: string;
  time?: string;
  duration?: number;
  status?: Session['status'];
  packageType?: string;
  notes?: string;
  meetingLink?: string;
  sessionNotes?: string;
  rating?: number;
  feedback?: string;
}

interface SessionContextType {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  createSession: (sessionData: CreateSessionData) => Promise<Session>;
  updateSession: (sessionId: string, updateData: UpdateSessionData) => Promise<Session>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: Session['status']) => Promise<Session>;
  getSession: (sessionId: string) => Promise<Session>;
  refreshSessions: () => Promise<void>;
}

// Create the context with a default value
export const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Export the Provider component
export const SessionProvider = SessionContext.Provider;

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};