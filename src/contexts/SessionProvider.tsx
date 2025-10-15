import React, { useEffect, useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SessionContext } from "./SessionContext";
import { sessionAPI } from "../utils/session.api";
import SessionsDialog from "../components/SessionDetailsDialog/SessionsDialog";
import type { Session, Tutor } from "../types";

interface SessionProviderProps {
  children: ReactNode;
  isTeacher?: boolean;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  isTeacher = true,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);


  const getSessions = async () => {
    setIsLoading(true);
    try {
      const data = await sessionAPI.fetchSessions();
      console.log("Fetched sessions:", data.items);
      setSessions(data.items || []);
    } catch (e) {
      console.error("Error fetching sessions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getTutors = async () => {
    setIsLoading(true);
    try {
      const data = await sessionAPI.fetchTutors();
      setTutors(data);
    } catch (e) {
      console.error("Error fetching tutors:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = useCallback((sessionOrId?: string | Session) => {
    // Avoid unnecessary re-renders by checking if the session is already active
    if (typeof sessionOrId === "string") {
      const found = sessions.find(s => s.id === sessionOrId) || null;
      if (found !== activeSession) {  // Only set if session has changed
        setActiveSession(found);
      }
    } else if (sessionOrId) {
      if (sessionOrId !== activeSession) {  // Only set if session has changed
        setActiveSession(sessionOrId);
      }
    } else {
      setActiveSession(null); // Reset session
    }
    setDialogOpen(true);  // Always open the dialog when invoked
  }, [sessions, activeSession]); // Only change if sessions or activeSession change

  const closeDialog = () => {
    setDialogOpen(false);
    setActiveSession(null); // Reset active session when dialog closes
  };

  return (
    <SessionContext.Provider
      value={{
        openDialog,
        closeDialog,
        dialogOpen,
        activeSession,
        sessions,
        tutors,
        isLoading,
        getSessions,
        getTutors,
        createSession: sessionAPI.createSession,
        updateSession: sessionAPI.updateSession,
        assignTutorToSession: sessionAPI.assignTutor,
        isTeacher,
      }}
    >
      {children}

      {dialogOpen &&
        createPortal(
          <div id="global-dialog-root" style={{ position: 'fixed', inset: 0, zIndex: 2147483647 }}>
            <SessionsDialog open onClose={closeDialog} />
          </div>,
          document.body
        )
      }
    </SessionContext.Provider>
  );
};
