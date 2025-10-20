// utils/user.api.ts
import type { User, UpdateUserData } from '../types/user';

class UserAPI {
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
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

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
    return await this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    const data = await this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return data.user || data;
  }

  async addCredits(userId: string, creditsToAdd: number): Promise<User> {
    try {
      // First get the current user to know their current credits
      const currentUser = await this.getUser(userId);
      const currentCredits = currentUser.credits || 0;
      const newCredits = currentCredits + creditsToAdd;
      
      // Then update with the new total
      return await this.updateUser(userId, { credits: newCredits });
    } catch (error) {
      console.error('Failed to add credits:', error);
      throw new Error(`Failed to add credits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const userAPI = new UserAPI();