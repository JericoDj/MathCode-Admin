import React, { useState, useEffect } from 'react';
import type { AnalyticsData } from '../../types';
import { adminAPI } from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await adminAPI.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data) {
    return <div>Error loading dashboard data</div>;
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to MathCode Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-users">👥</div>
          <div className="stat-content">
            <h3>{data.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active-sessions">📚</div>
          <div className="stat-content">
            <h3>{data.activeSessions}</h3>
            <p>Active Sessions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed-sessions">✅</div>
          <div className="stat-content">
            <h3>{data.completedSessions.toLocaleString()}</h3>
            <p>Completed Sessions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3>${data.revenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <span className="growth positive">+{data.monthlyGrowth}%</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity card">
        <div className="card-header">
          <h2>Recent Activity</h2>
          <button className="btn btn-secondary">View All</button>
        </div>
        <div className="activity-list">
          {data.recentActivity.map((activity, index) => (
            <div className="activity-item" key={index}>
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p>{activity.description}</p>
                <span className="activity-time">{activity.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
