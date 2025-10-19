import type { AdminUser, LoginCredentials, User, CreateUserDTO, UpdateUserDTO, UserFilterOptions } from '../types';

const BASE_URL = 'http://localhost:4000';
const LOCAL_STORAGE_USER_KEY = 'adminUser';
const LOCAL_STORAGE_TOKEN_KEY = 'adminToken';

// AnalyticsData interface since it's missing from types
interface AnalyticsData {
  totalUsers: number;
  activePackages: number;
  completedPackages: number;
  revenue: number;
  monthlyGrowth: number;
  recentActivity: any[];
}

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
    const roles = data.user.roles || ['admin'];

    // Convert backend user structure to AdminUser type
    const user: AdminUser = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName || '',
      lastName: data.user.lastName || '',
      roles: roles,
      createdAt: data.user.createdAt,
      lastLoginAt: data.user.lastLogin || data.user.lastLoginAt || '',
      // Remove permissions since it doesn't exist in AdminUser type
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
  // VERIFY TOKEN
  // ---------------------------
  async verifyToken(token: string): Promise<AdminUser> {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Invalid token');
    }

    const data = await res.json();

    const roles = data.user.roles || ['admin'];
    
    const user: AdminUser = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName || '',
      lastName: data.user.lastName || '',
      roles: roles,
      createdAt: data.user.createdAt,
      lastLoginAt: data.user.lastLogin || data.user.lastLoginAt || '',
      // Remove permissions since it doesn't exist in AdminUser type
    };

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
      activePackages: data.activePackages,
      completedPackages: data.completedPackages,
      revenue: data.revenue,
      monthlyGrowth: data.monthlyGrowth,
      recentActivity: data.recentActivity,
    };
  },

  // ---------------------------
  // USER MANAGEMENT
  // ---------------------------
// notused 
  // Get all users with optional filtering
  async getUsers(filters?: UserFilterOptions): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const url = `${BASE_URL}/api/users${params.toString() ? `?${params.toString()}` : ''}`;
  
  const res = await fetch(url, {
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

  const response = await res.json();
  
  // Extract the items array from the response
  const users = response.items || response;
  
  return users.map((user: any) => this.transformUser(user));
},

  // Get users by specific role
// Get users by specific role
async getUsersByRole(role: 'student' | 'parent' | 'instructor' | 'admin'): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/students/role/${role}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to fetch ${role}s`);
  }

  const users = await res.json();
  return users.map((user: any) => this.transformUser(user));
},


  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    const user = await res.json();
    return this.transformUser(user);
  },

  // Create new user
  async createUser(userData: CreateUserDTO): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/students/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const user = await res.json();
    return this.transformUser(user);
  },

  // Update user
  async updateUser(userId: string, userData: UpdateUserDTO): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/students/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update user');
    }

    const user = await res.json();
    return this.transformUser(user);
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // ---------------------------
  // PARENT-STUDENT MANAGEMENT
  // ---------------------------

  // Create student account (convenience method)
  async createStudent(studentData: Omit<CreateUserDTO, 'roles'> & { parentId?: string }): Promise<User> {
    const userData: CreateUserDTO = {
      ...studentData,
      roles: ['student'],
    };

    const user = await this.createUser(userData);

    // Link to parent if provided
    if (studentData.parentId) {
      await this.linkStudentToParent(user.id, studentData.parentId);
    }

    return user;
  },

  // Link student to parent
async linkStudentToParent(studentId: string, parentId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/students/parent/${parentId}/link/${studentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to link student to parent');
  }
},

// Unlink student from parent
async unlinkStudentFromParent(studentId: string, parentId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/students/parent/${parentId}/unlink/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to unlink student from parent');
  }
},

async getUpdatedStudentDetails(studentId: string): Promise<{ parentId: string; guardians: any[] }> {
  const res = await fetch(`${BASE_URL}/api/users/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch updated student details');
  }

  const data = await res.json();

  return data;
  },


// Get parent details by ID
async getParentDetails(parentId: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users/${parentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch parent details');
  }

  const data = await res.json();
 
  
  // Extract the user object from the response and transform it
  if (data) {
    return this.transformUser(data);
  } else {
    throw new Error('No user data found in response');
  }
},



  // Get students linked to a specific parent
  async getStudentsByParent(parentId: string): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/api/admin/parents/${parentId}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch students for parent');
    }

    const students = await res.json();
    return students.map((student: any) => this.transformUser(student));
  },

  // // Get guardians/parents of a specific student
  // async getGuardiansByStudent(studentId: string): Promise<User[]> {
  //   const res = await fetch(`${BASE_URL}/api/admin/students/${studentId}/guardians`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
  //     },
  //   });

  //   if (!res.ok) {
  //     const error = await res.json();
  //     throw new Error(error.message || 'Failed to fetch guardians for student');
  //   }

  //   const guardians = await res.json();
  //   return guardians.map((guardian: any) => this.transformUser(guardian));
  // },

  // ---------------------------
  // UTILITY METHODS
  // ---------------------------

  // Transform backend user data to frontend User type
  transformUser(userData: any): User {
  return {
    id: userData._id || userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    roles: userData.roles || ['student'],
    status: userData.status || 'active',
    profile: userData.profile || {},
    guardianOf: userData.guardianOf || [],
    guardians: userData.guardians || [],
    lastLoginAt: userData.lastLoginAt,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`.trim(),
  };
},

  // ---------------------------
  // USER STATUS MANAGEMENT
  // ---------------------------

  // Update user status
  async updateUserStatus(userId: string, status: 'active' | 'invited' | 'suspended'): Promise<User> {
    return this.updateUser(userId, { status });
  },

  // Invite user (sets status to invited and sends invitation)
  async inviteUser(userId: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to invite user');
    }

    const user = await res.json();
    return this.transformUser(user);
  },

  // ---------------------------
  // BULK OPERATIONS
  // ---------------------------

  // Bulk create users
  async bulkCreateUsers(usersData: CreateUserDTO[]): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/api/admin/users/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
      body: JSON.stringify({ users: usersData }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to bulk create users');
    }

    const users = await res.json();
    return users.map((user: any) => this.transformUser(user));
  },

  // Bulk link students to parents
  async bulkLinkStudents(links: Array<{ studentId: string; parentId: string }>): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/admin/students/bulk-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
      body: JSON.stringify({ links }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to bulk link students');
    }
  },
};

// ==============================
// PASSWORD MANAGEMENT API
// ==============================
export const passwordAPI = {
  // Forgot password - send reset email
  async forgotPassword(email: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to send password reset email');
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  // Change password (authenticated user)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to change password');
    }
  },
};

// ==============================
// EXPORT ALL APIs
// ==============================
export default {
  auth: adminAuthAPI,
  admin: adminAPI,
  password: passwordAPI,
};