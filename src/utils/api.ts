import type { AdminUser, LoginCredentials, User, TutoringSession, AnalyticsData } from '../types';

// Mock API functions - replace with actual API calls
export const adminAuthAPI = {
  async login(credentials: LoginCredentials): Promise<{ user: AdminUser; token: string }> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: AdminUser = {
          id: '1',
          email: credentials.email,
          name: 'Admin User',
          role: 'super-admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        const token = 'mock-jwt-token';
        resolve({ user, token });
      }, 1000);
    });
  },

  async verifyToken(token: string): Promise<AdminUser> {
    // Simulate token verification
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token === 'mock-jwt-token') {
          const user: AdminUser = {
            id: '1',
            email: 'admin@mathcode.com',
            name: 'Admin User',
            role: 'super-admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          resolve(user);
        } else {
          reject(new Error('Invalid token'));
        }
      }, 500);
    });
  },
};

export const adminAPI = {
  async getDashboardData(): Promise<AnalyticsData> {
    return {
      totalUsers: 1247,
      activeSessions: 23,
      completedSessions: 845,
      revenue: 125430,
      monthlyGrowth: 12.5,
      recentActivity: [
        { icon: '🎓', description: 'New student registration: Sarah Johnson', timeAgo: '2 hours ago' },
        { icon: '📅', description: 'Session completed: Mathematics Grade 5', timeAgo: '4 hours ago' },
        { icon: '💰', description: 'Payment received: $150.00', timeAgo: '6 hours ago' },
      ],
    };
  },

  async getUsers(): Promise<User[]> {
    // Mock user data
    return Array.from({ length: 50 }, (_, i) => ({
      id: (i + 1).toString(),
      email: `student${i + 1}@example.com`,
      name: `Student ${i + 1}`,
      grade: ['1st', '2nd', '3rd', '4th', '5th', '6th'][i % 6],
      parentName: `Parent ${i + 1}`,
      parentPhone: `+1-555-${String(i + 1).padStart(4, '0')}`,
      status: ['active', 'inactive', 'pending'][i % 3] as 'active' | 'inactive' | 'pending',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));
  },
};
