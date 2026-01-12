// utils/session.api.ts
import type { Session } from '../pages/AdminPage/Sessions/SessionsManagement';
import type { CreateSessionData, UpdateSessionData } from '../contexts/SessionContext';

class SessionAPI {
  private baseURL =
    (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api';

  private getAuthToken(): string {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');
    return token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken();

    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
    const data = await this.request('/sessions');
    return (data.sessions || data.items || []).map(this.transformSessionData);
  }

  async getSession(sessionId: string): Promise<Session> {
    const data = await this.request(`/sessions/${sessionId}`);
    return this.transformSessionData(data);
  }

  async createSession(sessionData: CreateSessionData): Promise<Session> {
    const data = await this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    return this.transformSessionData(data);
  }

  async updateSession(sessionId: string, updateData: UpdateSessionData): Promise<Session> {
    const data = await this.request(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return this.transformSessionData(data);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request(`/sessions/${sessionId}`, { method: 'DELETE' });
  }

  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<Session> {
    const data = await this.request(`/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return this.transformSessionData(data);
  }

  private transformSessionData(data: any): Session {
    return {
      id: data._id || data.id,
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

  private calculateCredits(duration: number): number {
    if (duration <= 30) return 0.5;
    if (duration <= 60) return 1;
    if (duration <= 90) return 1.5;
    if (duration <= 120) return 2;
    return Math.ceil(duration / 60);
  }
}

export const sessionAPI = new SessionAPI();
