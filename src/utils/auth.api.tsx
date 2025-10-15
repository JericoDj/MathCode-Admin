import type { AdminUser, LoginCredentials, User, AnalyticsData } from '../types';

const BASE_URL = 'http://localhost:4000';
const LOCAL_STORAGE_USER_KEY = 'adminUser';
const LOCAL_STORAGE_TOKEN_KEY = 'adminToken';

export const adminAuthAPI = {
  // ---------------------------
  // LOGIN FUNCTION
  // ---------------------------
  async login(credentials: LoginCredentials): Promise<{ user: AdminUser; token: string }> {
    const res = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await res.json();

    // Ensure the user object has a roles property (array)
    const roles = data.user.roles || ['admin']; // Default to ['admin'] if roles are missing

    // Convert backend user structure to AdminUser type
    const user: AdminUser = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName || '',
      lastName: data.user.lastName || '',
      roles: roles,  // Correctly assign roles as an array
      createdAt: data.user.createdAt,
      lastLogin: data.user.lastLogin || '',
      permissions: data.user.permissions || [],  // Add permissions, defaulting to an empty array
    };

    // Save user and token separately
    this.setUser(user);
    this.setToken(data.token);

    return { user, token: data.token };
  },

  // ---------------------------
  // SAVE USER & TOKEN
  // ---------------------------
  setUser(user: AdminUser) {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  },

  setToken(token: string) {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
  },

  // ---------------------------
  // GET SAVED USER & TOKEN
  // ---------------------------
  getSavedUser(): AdminUser | null {
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getSavedToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  },

  getSavedAuth(): { user: AdminUser; token: string } | null {
    const user = this.getSavedUser();
    const token = this.getSavedToken();
    if (!user || !token) return null;
    return { user, token };
  },

  // ---------------------------
  // LOGOUT
  // ---------------------------
  logout(): void {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  },

  // ---------------------------
  // VERIFY TOKEN (optional)
  // ---------------------------
  async verifyToken(token: string): Promise<AdminUser> {
    console.log("Verifying token:", token);
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    console.log("Verification response status:", res.status);
    console.log("Verification response:", res);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Invalid token');
    }

    const data = await res.json();

// Directly use `data` as it's already an object
console.log("Verification response data:", data);

// Ensure the response data matches the AdminUser type
const roles = data.user.roles || ['admin']; // Default to ['admin'] if roles are missing
console.log("User roles from verification:", roles);

// Create the AdminUser object
const user: AdminUser = {
  id: data.user.id, // Access `data.user.id`, not `dataDetails.id`
  email: data.user.email, // Correctly access `data.user.email`
  firstName: data.user.firstName || '', // Default to empty string if firstName is missing
  lastName: data.user.lastName || '',   // Default to empty string if lastName is missing
  roles: roles,  // Correctly assign roles as an array
  createdAt: data.user.createdAt,
  lastLogin: data.user.lastLogin || '',  // Default to empty string if lastLogin is missing
  permissions: data.user.permissions || [],  // Default to empty array if permissions are missing
};

console.log("Verified user:", user);
return user;
  },
};

// ==============================
// ADMIN DASHBOARD / DATA API
// ==============================
export const adminAPI = {
  // Fetch the dashboard data for analytics
  async getDashboardData(): Promise<AnalyticsData> {
    const res = await fetch(`${BASE_URL}/api/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }

    const data = await res.json();
    return {
      totalUsers: data.totalUsers,
      activeSessions: data.activeSessions,
      completedSessions: data.completedSessions,
      revenue: data.revenue,
      monthlyGrowth: data.monthlyGrowth,
      recentActivity: data.recentActivity,
    };
  },

  // Fetch users data (for admin panel)
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    const users = await res.json();
    return users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      grade: user.grade,
      parentName: user.parentName,
      parentPhone: user.parentPhone,
      status: user.status,
      createdAt: user.createdAt,
    }));
  },
};
