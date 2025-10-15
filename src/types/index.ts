// AdminUser - Refined to include permissions and role-based management
export interface AdminUser {
  id: string;
  email: string;
  firstName: string; // Add firstName
  lastName: string; // Add lastName
 // You can change it to a string, or keep the union type if you expect it to be one of these
  createdAt: string;
  lastLogin: string;
  permissions: string[]; // Permissions for specific actions or areas
  roles: string[]; // Add roles as an array
}

// User - More detailed user management including parent info and status tracking
export interface User {
  id: string;
  email: string;
  name: string;
  grade: string;
  parentId: string; // ID of the parent (useful for parent-child relationships)
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'pending'; // User status
  createdAt: string;
  updatedAt: string; // Track updates to user info
}

// TutoringSession - Refined to handle session details, pricing, status, and tutor assignment
export interface TutoringSession {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string; // Required for assigning a tutor to the session
  tutorName: string; 
  subject: string;
  grade: string;
  date: string;
  time: string;
  duration: number; // Duration in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'pending' | 'approved'; // Expanded session status
  price: number;
  meetingLink?: string; // Optional meeting link
  notes?: string; // Optional notes field for session details
}

// AnalyticsData - Expanded for more detailed analytics data like session activities
export interface AnalyticsData {
  totalUsers: number;
  activeSessions: number;
  completedSessions: number;
  revenue: number;
  monthlyGrowth: number;
  recentActivity: Activity[]; // Array of activities (e.g., logins, session updates, etc.)
}

// LoginCredentials - Represents user login details
export interface LoginCredentials {
  email: string;
  password: string;
}

// Activity - Represents activity details (e.g., user logins, session updates)
export interface Activity {
  icon: string; // Icon for activity type (e.g., login icon, session icon)
  description: string; // Description of the activity (e.g., "User X logged in")
  timeAgo: string; // Time since the activity happened (e.g., "5 minutes ago")
  activityType: 'login' | 'session-update' | 'user-registration'; // Activity type for classification
}

// Session - Represents a tutoring session with all necessary details
export interface Session {
  id?: string;          // Firestore-style or frontend-assigned ID
  _id?: string;      // Backend-assigned ID (if different from 'id')
  studentId: string; // ID of the student who booked the session
  studentName: string; // Name of the student
  tutorId: string; // ID of the tutor assigned to the session
  tutorName: string; // Name of the tutor
  subject: string; // Subject of the tutoring session
  grade: string; // Grade level of the student
  date: string; // Date of the session
  time: string; // Time of the session
  duration: number; // Duration of the session in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'pending' | 'approved'; // Current status of the session
  price: number; // Price of the session
  meetingLink?: string; // Optional meeting link for online sessions
  notes?: string; // Optional notes for the session (e.g., special requests, comments)
}

// Tutor - Represents a tutor with all necessary details
export interface Tutor {
  id: string; // Unique ID of the tutor
  name: string; // Full name of the tutor
  email: string; // Email address of the tutor
  subject: string; // Subject(s) the tutor teaches
  bio?: string; // Optional biography or description of the tutor
  hourlyRate: number; // Tutor's hourly rate for sessions
  availability: string[]; // Array of available time slots (e.g., ['Monday 9:00 AM', 'Tuesday 3:00 PM'])
}
