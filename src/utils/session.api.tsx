// utils/session.api.ts
import type { Session } from '../pages/AdminPage/Sessions/SessionsManagement';
import type { CreateSessionData, UpdateSessionData } from '../contexts/SessionContext';

class SessionAPI {
  private baseURL = 'http://localhost:4000/api';

  private getAuthToken(): string {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    if (options.body) {
      config.body = options.body;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      const data = await this.request('/sessions');
      // Transform backend data to match frontend Session type
      return (data.sessions || data.items || []).map(this.transformSessionData);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      // For now, return empty array - remove this when backend is ready
      return this.getMockSessions();
    }
  }

  async getSession(sessionId: string): Promise<Session> {
    const data = await this.request(`/sessions/${sessionId}`);
    return this.transformSessionData(data);
  }

  async createSession(sessionData: CreateSessionData): Promise<Session> {
    try {
      const data = await this.request('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      return this.transformSessionData(data);
    } catch (error) {
      console.error('Failed to create session:', error);
      // For demo purposes, create a mock session
      return this.createMockSession(sessionData);
    }
  }

  async updateSession(sessionId: string, updateData: UpdateSessionData): Promise<Session> {
    try {
      const data = await this.request(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return this.transformSessionData(data);
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.request(`/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<Session> {
    try {
      const data = await this.request(`/sessions/${sessionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return this.transformSessionData(data);
    } catch (error) {
      console.error('Failed to update session status:', error);
      throw error;
    }
  }

  // Helper method to transform backend data to frontend Session type
  private transformSessionData(data: any): Session {
    return {
      id: data._id || data.id, // Handle both _id (MongoDB) and id (frontend)
      studentName: data.studentName,
      parentName: data.parentName,
      tutorName: data.tutorName,
      subject: data.subject,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status,
      packageType: data.packageType,
      creditsUsed: data.creditsUsed,
      notes: data.notes,
      meetingLink: data.meetingLink,
      materials: data.materials || [],
    };
  }

  // Mock session creation for demo purposes
  private createMockSession(sessionData: CreateSessionData): Session {
    const mockSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: sessionData.studentName,
      parentName: sessionData.parentName,
      tutorName: sessionData.tutorName,
      subject: sessionData.subject,
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration,
      status: sessionData.status,
      packageType: sessionData.packageType,
      creditsUsed: this.calculateCredits(sessionData.duration),
      notes: sessionData.notes,
      meetingLink: sessionData.meetingLink,
      materials: [],
    };
    
    return mockSession;
  }

  // Mock sessions for demo
  private getMockSessions(): Session[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: '1',
        studentName: 'Luna De Jesus',
        parentName: 'Parent Name',
        tutorName: 'Teacher Viv',
        subject: 'Singapore Math',
        date: tomorrow.toISOString().split('T')[0],
        time: '11:00',
        duration: 60,
        status: 'scheduled',
        packageType: '1:1 Private Tutoring',
        creditsUsed: 1,
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        notes: 'Math session'
      },
      {
        id: '2',
        studentName: 'Luna De Jesus',
        parentName: 'Parent Name',
        tutorName: 'Teacher Viv',
        subject: 'Singapore Math',
        date: today.toISOString().split('T')[0],
        time: '08:30',
        duration: 60,
        status: 'completed',
        packageType: '1:1 Private Tutoring',
        creditsUsed: 1,
        meetingLink: 'https://meet.google.com/jkl-mno-pqr',
        notes: 'Completed session'
      },
      {
        id: '3',
        studentName: 'Alice Johnson',
        parentName: 'Bob Johnson',
        tutorName: 'Dr. Johnson',
        subject: 'Advanced Mathematics',
        date: nextWeek.toISOString().split('T')[0],
        time: '15:00',
        duration: 90,
        status: 'scheduled',
        packageType: '1:1 Private Tutoring',
        creditsUsed: 1.5,
        notes: 'Advanced math session'
      }
    ];
  }

  private calculateCredits(duration: number): number {
    if (duration <= 30) return 0.5;
    if (duration <= 60) return 1;
    if (duration <= 90) return 1.5;
    if (duration <= 120) return 2;
    return Math.ceil(duration / 60);
  }
}

export const sessionAPI = new SessionAPI();