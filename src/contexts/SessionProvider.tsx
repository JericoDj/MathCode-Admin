// contexts/SessionProvider.tsx
import React, { useState, useEffect } from 'react';
import { SessionContext, type CreateSessionData, type UpdateSessionData } from './SessionContext';
import type { Session } from '../pages/AdminPage/Sessions/SessionsManagement';
import { sessionAPI } from '../utils/session.api';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    refreshSessions();
  }, []);

  const refreshSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionsData = await sessionAPI.getAllSessions();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (sessionData: CreateSessionData): Promise<Session> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newSession = await sessionAPI.createSession(sessionData);
      
      // Add to local state
      setSessions(prev => [newSession, ...prev]);
      
      return newSession;
    } catch (err) {
      console.error('Failed to create session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = async (sessionId: string, updateData: UpdateSessionData): Promise<Session> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        throw new Error('Invalid session ID');
      }

      setIsLoading(true);
      setError(null);
      
      const updatedSession = await sessionAPI.updateSession(sessionId, updateData);
      
      // Update local state
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? { ...session, ...updateData } : session
      ));
      
      return updatedSession;
    } catch (err) {
      console.error('Failed to update session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        throw new Error('Invalid session ID');
      }

      setIsLoading(true);
      setError(null);
      
      await sessionAPI.deleteSession(sessionId);
      
      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Failed to delete session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: Session['status']): Promise<Session> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        throw new Error('Invalid session ID');
      }

      setIsLoading(true);
      setError(null);
      
      const updatedSession = await sessionAPI.updateSessionStatus(sessionId, status);
      
      // Update local state
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? { ...session, status } : session
      ));
      
      return updatedSession;
    } catch (err) {
      console.error('Failed to update session status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSession = async (sessionId: string): Promise<Session> => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        throw new Error('Invalid session ID');
      }

      setIsLoading(true);
      setError(null);
      
      const session = await sessionAPI.getSession(sessionId);
      return session;
    } catch (err) {
      console.error('Failed to get session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    sessions,
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    updateSessionStatus,
    getSession,
    refreshSessions,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};