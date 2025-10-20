// types/session.ts
export interface Session {
  id: string;
  studentName: string;
  parentName: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  packageType: string;
  creditsUsed: number;
  notes?: string;
  meetingLink?: string;
  materials?: string[];
}

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
  studentName?: string;
  parentName?: string;
  tutorName?: string;
  subject?: string;
  date?: string;
  time?: string;
  duration?: number;
  status?: Session['status'];
  packageType?: string;
  creditsUsed?: number;
  notes?: string;
  meetingLink?: string;
}

export interface SessionContextType {
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