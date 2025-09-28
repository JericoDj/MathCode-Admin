export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'moderator';
  createdAt: string;
  lastLogin: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface TutoringSession {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  grade: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  meetingLink?: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeSessions: number;
  completedSessions: number;
  revenue: number;
  monthlyGrowth: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Activity {
  icon: string;          // emoji or icon string
  description: string;   // text description
  timeAgo: string;       // e.g., "2 hours ago"
}