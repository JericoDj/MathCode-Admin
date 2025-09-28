import React, { useState, useEffect } from 'react';
import type { TutoringSession } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import './SessionManagement.css';

// Mock data - replace with actual API call
const mockSessions: TutoringSession[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Emma Johnson',
    tutorId: 't1',
    tutorName: 'Dr. Smith',
    subject: 'Mathematics',
    grade: '5th',
    date: '2024-01-15',
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    price: 75,
    meetingLink: 'https://meet.google.com/abc-xyz'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Liam Wilson',
    tutorId: 't2',
    tutorName: 'Ms. Davis',
    subject: 'Science',
    grade: '4th',
    date: '2024-01-14',
    time: '16:00',
    duration: 45,
    status: 'completed',
    price: 60,
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Olivia Brown',
    tutorId: 't1',
    tutorName: 'Dr. Smith',
    subject: 'Mathematics',
    grade: '6th',
    date: '2024-01-16',
    time: '10:00',
    duration: 60,
    status: 'scheduled',
    price: 75,
    meetingLink: 'https://meet.google.com/def-uvw'
  }
];

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setSessions(mockSessions);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => 
    statusFilter === 'all' || session.status === statusFilter
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'no-show': return 'status-no-show';
      default: return '';
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: TutoringSession['status']) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, status: newStatus } : session
    ));
  };

  if (isLoading) {
    return (
      <div className="session-management-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="session-management">
      <div className="page-header">
        <h1>Session Management</h1>
        <p>Manage and monitor tutoring sessions</p>
      </div>

      <div className="stats-overview">
        <div className="stat-item">
          <span className="stat-number">{sessions.filter(s => s.status === 'scheduled').length}</span>
          <span className="stat-label">Scheduled</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{sessions.filter(s => s.status === 'completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">${sessions.reduce((sum, session) => sum + session.price, 0)}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tutoring Sessions</h2>
          <div className="controls">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
            <button className="btn btn-primary" onClick={loadSessions}>
              Refresh
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Tutor</th>
                <th>Subject/Grade</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div className="user-info">
                      <strong>{session.studentName}</strong>
                    </div>
                  </td>
                  <td>{session.tutorName}</td>
                  <td>
                    <div>
                      <strong>{session.subject}</strong>
                      <div>{session.grade} Grade</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{new Date(session.date).toLocaleDateString()}</div>
                      <small>{session.time}</small>
                    </div>
                  </td>
                  <td>{session.duration} min</td>
                  <td>${session.price}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <select 
                        value={session.status}
                        onChange={(e) => handleStatusChange(session.id, e.target.value as TutoringSession['status'])}
                        className="status-select"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                      <button className="btn btn-secondary btn-sm">Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};