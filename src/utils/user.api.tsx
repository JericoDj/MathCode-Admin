// utils/user.api.ts
import type { User, UpdateUserData } from '../types/user';

class UserAPI {
  private baseURL =
    (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api';

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
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllUsers(): Promise<User[]> {
    const data = await this.request('/users');
    return data.items || data;
  }

  async getUser(userId: string): Promise<User> {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    const data = await this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return data.user || data;
  }

  async addCredits(userId: string, creditsToAdd: number): Promise<User> {
    const currentUser = await this.getUser(userId);
    const currentCredits = currentUser.credits || 0;
    const newCredits = currentCredits + creditsToAdd;

    return this.updateUser(userId, { credits: newCredits });
  }
}

export const userAPI = new UserAPI();
