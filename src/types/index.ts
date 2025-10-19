// User - Complete user interface matching MongoDB schema
export interface User {
  // Core identification
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  
  // Authentication & roles
  passwordHash?: string; // Only available when selected
  roles: ('student' | 'parent' | 'instructor' | 'admin')[];
  status: 'active' | 'invited' | 'suspended';
  
  // Profile information
  profile?: {
    dob?: string; // ISO date string
    gender?: 'male' | 'female' | 'other';
    address?: string;
    timezone?: string;
  };
  
  // Parent-child relationships
  guardianOf: string[]; // Array of user IDs (children this user is guardian of)
  guardians: string[]; // Array of user IDs (guardians/parents of this user)
  
  // Timestamps
  lastLoginAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Password reset fields (only available when selected)
  resetPasswordOTP?: string;
  resetPasswordExpires?: string; // ISO date string
  
  // Virtual fields (computed)
  fullName?: string; // Computed from firstName + lastName
}

// Admin User - Simplified interface for admin authentication
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: ['admin']; // Admin users specifically have admin role
  createdAt: string;
  lastLoginAt?: string;
  // Note: AdminUser doesn't include all User fields since it's for auth context
}

// Extended user interface for display purposes with populated data
export interface UserWithDetails extends User {
  // Populated guardian information (when populated)
  guardianDetails?: User[];
  guardiansDetails?: User[];
  
  // For student-specific display
  grade?: string; // Could be stored in profile or as separate field
  
  // For parent-specific display
  children?: User[]; // Populated guardianOf
}

// User creation DTO (for creating new users)
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: ('student' | 'parent' | 'instructor' | 'admin')[];
  status?: 'active' | 'invited' | 'suspended';
  profile?: {
    dob?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    timezone?: string;
  };
  password?: string; // For initial password setup
}

// User update DTO (for updating existing users)
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: ('student' | 'parent' | 'instructor' | 'admin')[];
  status?: 'active' | 'invited' | 'suspended';
  profile?: {
    dob?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    timezone?: string;
  };
}

// User filter options for querying
export interface UserFilterOptions {
  role?: 'student' | 'parent' | 'instructor' | 'admin';
  status?: 'active' | 'invited' | 'suspended';
  search?: string; // Search in firstName, lastName, email
  page?: number;
  limit?: number;
}

// Parent-Student relationship DTOs
export interface LinkStudentToParentDTO {
  studentId: string;
  parentId: string;
}

export interface UnlinkStudentFromParentDTO {
  studentId: string;
  parentId: string;
}

// User statistics for admin dashboard
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
  suspendedUsers: number;
  studentsCount: number;
  parentsCount: number;
  instructorsCount: number;
  adminsCount: number;
}

// Analytics data for dashboard
export interface AnalyticsData {
  totalUsers: number;
  activePackages: number;
  completedPackages: number;
  revenue: number;
  monthlyGrowth: number;
  recentActivity: any[];
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  user: AdminUser; // Auth response returns AdminUser, not full User
  token: string;
  refreshToken?: string;
}

// Password reset DTOs
export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  otp?: string;
}

// Role-based utility types
export type StudentUser = User & { roles: ['student'] };
export type ParentUser = User & { roles: ['parent'] };
export type InstructorUser = User & { roles: ['instructor'] };

// Utility type guards
export const isStudent = (user: User): user is StudentUser => 
  user.roles.includes('student');

export const isParent = (user: User): user is ParentUser => 
  user.roles.includes('parent');

export const isInstructor = (user: User): user is InstructorUser => 
  user.roles.includes('instructor');

// Package - Represents a tutoringPackage with all necessary details
export interface Package{
  id?: string;          // Firestore-style or frontend-assigned ID
  _id?: string;      // Backend-assigned ID (if different from 'id')
  studentId: string; // ID of the student who booked the Package
  studentName: string; // Name of the student
  tutorId: string; // ID of the tutor assigned to the Package
  tutorName: string; // Name of the tutor
  subject: string; // Subject of the tutoring Package
  grade: string; // Grade level of the student
  date: string; // Date of the Package
  time: string; // Time of the Package
  duration: number; // Duration of the Package in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'pending' | 'approved'; // Current status of the Package
  price: number; // Price of the Package
  meetingLink?: string; // Optional meeting link for online Package
  notes?: string; // Optional notes for the Package (e.g., special requests, comments)
}

// Tutor - Represents a tutor with all necessary details
export interface Tutor {
  id: string; // Unique ID of the tutor
  name: string; // Full name of the tutor
  email: string; // Email address of the tutor
  subject: string; // Subject(s) the tutor teaches
  bio?: string; // Optional biography or description of the tutor
  hourlyRate: number; // Tutor's hourly rate forPackage
  availability: string[]; // Array of available time slots (e.g., ['Monday 9:00 AM', 'Tuesday 3:00 PM'])
}

// TutoringPackage - Refined to handle Packagedetails, pricing, status, and tutor assignment
  export interface TutoringPackage {
    id: string;
    studentId: string;
    studentName: string;
    tutorId: string; // Required for assigning a tutor to the Package
    tutorName: string; 
    subject: string;
    grade: string;
    date: string;
    time: string;
    duration: number; // Duration in minutes
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'pending_payment' | 'approved'; // Expanded session status
    price: number;
    meetingLink?: string; // Optional meeting link
    notes?: string; // Optional notes field for Package details
  }


export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: ['admin'];
  createdAt: string;
  lastLoginAt?: string;
}


// Export UserWithGuardians so it can be imported elsewhere
export interface UserWithGuardians extends User {
  guardiansDetails?: User[];
}
