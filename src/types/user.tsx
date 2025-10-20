// types/user.ts
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  status: string;
  address?: string;
  school?: string;
  gradeLevel?: string;
  profile?: {
    dob?: string;
    gender?: string;
    address?: string;
    timezone: string;
  };
  credits: number;
  guardians: string[];
  guardianOf: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  status?: string;
  address?: string;
  school?: string;
  gradeLevel?: string;
  profile?: any;
  credits?: number;
}

export interface UserContextType {
  users: User[];
  isLoading: boolean;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<User>;
  addCredits: (userId: string, credits: number) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  refreshUsers: () => Promise<void>;
}