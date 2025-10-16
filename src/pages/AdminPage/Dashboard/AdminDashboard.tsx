import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to MathCode Admin Panel</p>
      </div>

      {/* Coming Soon Section */}
      <div className="coming-soon-container">
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🚀</div>
          <h2>Dashboard Coming Soon</h2>
          <p className="coming-soon-description">
            We're working hard to bring you a comprehensive dashboard with analytics, 
            statistics, and insights about your platform. This feature will be available 
            in the next update.
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Advanced Analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>User Statistics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span>Revenue Reports</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Growth Metrics</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-info">
              <span>Development Progress</span>
              <span>65%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="cta-section">
            <p>In the meantime, you can manage users and settings from the navigation menu.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Explore User Management</button>
              <button className="btn btn-secondary">View Settings</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Placeholder */}
      <div className="placeholder-stats">
        <div className="placeholder-card">
          <div className="placeholder-icon">👥</div>
          <div className="placeholder-content">
            <h3>User Management</h3>
            <p>Manage students, parents, and administrators</p>
            <button className="btn btn-outline">Go to Users</button>
          </div>
        </div>
        
        <div className="placeholder-card">
          <div className="placeholder-icon">⚙️</div>
          <div className="placeholder-content">
            <h3>System Settings</h3>
            <p>Configure platform settings and preferences</p>
            <button className="btn btn-outline">Configure</button>
          </div>
        </div>
        
        <div className="placeholder-card">
          <div className="placeholder-icon">📋</div>
          <div className="placeholder-content">
            <h3>Reports</h3>
            <p>Generate and view system reports</p>
            <button className="btn btn-outline">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};