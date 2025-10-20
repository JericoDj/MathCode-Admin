// App.tsx
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminUserProvider } from './contexts/AdminUserProvider';
import { useAdminUser } from './contexts/AdminUserContext';
import { PackageProvider } from './contexts/PackageProvider';
import { UserManagementDialogProvider } from './contexts/UserManagementDialogProvider';
import { UserProvider } from './contexts/UserProvider';
import { SessionProvider } from './contexts/SessionProvider'; 

import { AppNavBar } from './components/AppNavBar/AppNavBar';
import { AdminLogin } from './pages/Auth/AdminLogin';
import { AdminDashboard } from './pages/AdminPage/Dashboard/AdminDashboard';
import { UserManagement } from './pages/AdminPage/Users/UserManagement';
import { PackageManagement } from './pages/AdminPage/Packages/PackageManagement';
import { SessionsManagement } from './pages/AdminPage/Sessions/SessionsManagement'; // Import Sessions
import { Analytics } from './pages/AdminPage/Analytics/Analytics';
import { AdminSettings } from './pages/AdminPage/Settings/AdminSettings';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminUser, isLoading } = useAdminUser();

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout Component
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="admin-layout">
      <AppNavBar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/packages" element={
        <ProtectedRoute>
          <AdminLayout>
            <PackageManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/sessions" element={ // Added Sessions route
        <ProtectedRoute>
          <AdminLayout>
            <SessionsManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AdminUserProvider>
      <UserProvider>
        <PackageProvider>
           <SessionProvider> {/* Add SessionProvider here */}
          <UserManagementDialogProvider>
            <AppRoutes />
          </UserManagementDialogProvider>
           </SessionProvider>
        </PackageProvider>
      </UserProvider>
    </AdminUserProvider>
  );
}