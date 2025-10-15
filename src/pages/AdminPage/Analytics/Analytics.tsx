import React, { useState, useEffect } from 'react';
import type { AnalyticsData } from '../../../types';
import { adminAPI } from '../../../utils/auth.api.tsx';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import './Analytics.css';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // In a real app, you would pass timeRange to the API
      const analyticsData = await adminAPI.getDashboardData();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data) {
    return <div>Error loading analytics data</div>;
  }

  return (
    <div className="analytics">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Detailed insights and performance metrics</p>
      </div>

      <div className="controls">
        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === '7days' ? 'active' : ''}`}
            onClick={() => setTimeRange('7days')}
          >
            7 Days
          </button>
          <button 
            className={`time-btn ${timeRange === '30days' ? 'active' : ''}`}
            onClick={() => setTimeRange('30days')}
          >
            30 Days
          </button>
          <button 
            className={`time-btn ${timeRange === '90days' ? 'active' : ''}`}
            onClick={() => setTimeRange('90days')}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card large">
          <h3>Revenue Overview</h3>
          <div className="revenue-chart">
            <div className="chart-placeholder">
              <span>Revenue Chart</span>
              <div className="chart-bar" style={{height: '80%'}}></div>
              <div className="chart-bar" style={{height: '60%'}}></div>
              <div className="chart-bar" style={{height: '90%'}}></div>
              <div className="chart-bar" style={{height: '75%'}}></div>
              <div className="chart-bar" style={{height: '85%'}}></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h3>User Growth</h3>
          <div className="metric-value">{data.totalUsers}</div>
          <div className="metric-change positive">+12.5% from last period</div>
        </div>

        <div className="metric-card">
          <h3>Session Completion</h3>
          <div className="metric-value">{data.completedSessions}</div>
          <div className="metric-change positive">+8.3% from last period</div>
        </div>

        <div className="metric-card">
          <h3>Average Session Price</h3>
          <div className="metric-value">${(data.revenue / data.completedSessions).toFixed(2)}</div>
          <div className="metric-change positive">+5.2% from last period</div>
        </div>

        <div className="metric-card">
          <h3>Active Sessions</h3>
          <div className="metric-value">{data.activeSessions}</div>
          <div className="metric-change">No change</div>
        </div>

        <div className="metric-card">
          <h3>Total Revenue</h3>
          <div className="metric-value">${data.revenue.toLocaleString()}</div>
          <div className="metric-change positive">+{data.monthlyGrowth}% from last month</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Performance</h2>
        </div>
        <div className="performance-list">
          <div className="performance-item">
            <div className="performance-metric">Conversion Rate</div>
            <div className="performance-value">4.2%</div>
            <div className="performance-change positive">+0.3%</div>
          </div>
          <div className="performance-item">
            <div className="performance-metric">Student Satisfaction</div>
            <div className="performance-value">94%</div>
            <div className="performance-change positive">+2%</div>
          </div>
          <div className="performance-item">
            <div className="performance-metric">Tutor Utilization</div>
            <div className="performance-value">78%</div>
            <div className="performance-change negative">-5%</div>
          </div>
        </div>
      </div>
    </div>
  );
};