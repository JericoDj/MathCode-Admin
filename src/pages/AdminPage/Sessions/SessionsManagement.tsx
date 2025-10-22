// pages/AdminPage/Sessions/SessionsManagement.tsx
import React, { useState, useEffect } from 'react';
import { CreateSessionModal } from './CreateSessionModal';
import { SessionDetailsModal } from './SessionDetailsModal';
import { EditSessionModal } from './EditSessionModal';
import { useSession } from '../../../contexts/SessionContext';

import './SessionsManagement.css';
import './ModalShared.css';

export interface Session {
  id: string;
  studentName: string;
  parentName: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  packageType: string;
  creditsUsed: number;
  notes?: string;
  meetingLink?: string;
  materials?: string[];
  sessionNotes?: string;
  rating?: number;
  feedback?: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

export const SessionsManagement: React.FC = () => {
  const { sessions, isLoading, error, refreshSessions, updateSessionStatus, deleteSession } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('list');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    return new Date(2025, 9, 20);
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && activeView === 'calendar') {
      const sessionDates = sessions.map(s => new Date(s.date));
      const earliestDate = new Date(Math.min(...sessionDates.map(d => d.getTime())));
      
      const startOfWeek = new Date(earliestDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      setCurrentWeek(startOfWeek);
    }
  }, [sessions, activeView]);

  function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(currentDate);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeek);

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const goToSessionsWeek = () => {
    if (sessions.length > 0) {
      const sessionDates = sessions.map(s => new Date(s.date));
      const earliestDate = new Date(Math.min(...sessionDates.map(d => d.getTime())));
      
      const startOfWeek = new Date(earliestDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      setCurrentWeek(startOfWeek);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesSearch = session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeView === 'calendar') {
      const sessionDate = new Date(session.date);
      const isInCurrentWeek = weekDates.some(weekDate => {
        return getFormattedDate(weekDate) === getFormattedDate(sessionDate);
      });
      return matchesStatus && matchesSearch && isInCurrentWeek;
    }
    
    return matchesStatus && matchesSearch;
  });

  const sessionsByDate = filteredSessions.reduce((acc, session) => {
    const dateKey = getFormattedDate(new Date(session.date));
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return '#3B82F6';
      case 'in-progress': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'no-show': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const handleCreateSession = (newSession: Omit<Session, 'id'>) => {
    console.log('✅ New session created:', newSession);
    setIsCreateModalOpen(false);
    refreshSessions();
  };

  const handleStatusChange = async (sessionId: string, newStatus: Session['status']) => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        console.error('Invalid session ID:', sessionId);
        return;
      }
      
      setActionLoading(sessionId);
      await updateSessionStatus(sessionId, newStatus);
      await refreshSessions();
    } catch (error) {
      console.error('Failed to update session status:', error);
      alert('Failed to update session status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(sessionId);
      await deleteSession(sessionId);
      await refreshSessions();
      setSelectedSession(null);
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setSelectedSession(null);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    refreshSessions();
    setEditingSession(null);
    setSelectedSession(updatedSession);
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return getFormattedDate(date) === getFormattedDate(today);
  };

  const getStatusOptions = (currentStatus: Session['status']) => {
    const allStatuses: Session['status'][] = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getStatusDisplayName = (status: Session['status']) => {
    return status.replace('-', ' ').toUpperCase();
  };

  return (
    <div className="sessions-management">
      <div className="sessions-header">
        <div className="header-left">
          <h1 className="page-title">Session Management</h1>
          <p className="page-subtitle">Manage and track all tutoring sessions</p>
          {activeView === 'calendar' && (
            <div className="current-week-info">
              Week of {weekDates[0].toLocaleDateString()} to {weekDates[6].toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={refreshSessions}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          {activeView === 'calendar' && (
            <button
              className="btn btn-secondary"
              onClick={goToSessionsWeek}
              disabled={sessions.length === 0}
            >
              Jump to Sessions
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
          >
            + Create New Session
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-message">{error}</span>
        </div>
      )}

      {isLoading && sessions.length === 0 && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading sessions...</p>
        </div>
      )}

      {!isLoading && (
        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveView('calendar')}
          >
            📅 Calendar View
          </button>
          <button
            className={`toggle-btn ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            📋 List View
          </button>
        </div>
      )}

      {!isLoading && activeView === 'calendar' && (
        <>
          <div className="week-navigation">
            <button className="btn btn-secondary" onClick={goToPreviousWeek}>
              ← Previous Week
            </button>
            <button className="btn btn-text" onClick={goToToday}>
              Today
            </button>
            <button className="btn btn-secondary" onClick={goToNextWeek}>
              Next Week →
            </button>
            <button className="btn btn-text" onClick={goToSessionsWeek}>
              Jump to Sessions
            </button>
            <span className="week-display">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="calendar-grid">
            {weekDates.map((date, index) => {
              const dateKey = getFormattedDate(date);
              const daySessions = sessionsByDate[dateKey] || [];
              
              return (
                <div 
                  key={index} 
                  className={`calendar-day ${isToday(date) ? 'today' : ''}`}
                >
                  <div className="day-header">
                    <div className="day-name">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="day-date">
                      {date.getDate()}
                    </div>
                    <div className="day-month">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="day-sessions">
                    {daySessions.length === 0 ? (
                      <div className="no-sessions">No sessions</div>
                    ) : (
                      daySessions.map(session => (
                        <div
                          key={session.id}
                          className="session-calendar-item"
                          style={{ borderLeftColor: getStatusColor(session.status) }}
                          onClick={() => setSelectedSession(session)}
                        >
                          <div className="session-time">
                            {formatTimeDisplay(session.time)}
                          </div>
                          <div className="session-subject">
                            {session.subject}
                          </div>
                          <div className="session-student">
                            {session.studentName}
                          </div>
                          <div className="session-tutor">
                            with {session.tutorName}
                          </div>
                          <div 
                            className="session-status-indicator"
                            style={{ backgroundColor: getStatusColor(session.status) }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!isLoading && activeView === 'list' && (
        <>
          <div className="sessions-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by student, tutor, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>

          <div className="sessions-count">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>

          <div className="sessions-grid">
            {filteredSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-title">
                    <h3>{session.subject}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(session.status) }}
                    >
                      {getStatusDisplayName(session.status)}
                    </span>
                  </div>
                  <div className="session-actions-header">
                    <button
                      className="btn btn-text"
                      onClick={() => handleEditSession(session)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-text"
                      onClick={() => setSelectedSession(session)}
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="session-info">
                  <div className="info-row">
                    <span className="info-label">Student:</span>
                    <span className="info-value">{session.studentName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tutor:</span>
                    <span className="info-value">{session.tutorName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date & Time:</span>
                    <span className="info-value">
                      {new Date(session.date).toLocaleDateString()} at {formatTimeDisplay(session.time)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{session.duration} minutes</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Credits:</span>
                    <span className="info-value">{session.creditsUsed}</span>
                  </div>
                </div>

                <div className="session-actions">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(session.id, e.target.value as Session['status']);
                      }
                    }}
                    disabled={actionLoading === session.id}
                    className="status-select"
                  >
                    <option value="">Change Status</option>
                    {getStatusOptions(session.status).map(status => (
                      <option key={status} value={status}>
                        {getStatusDisplayName(status)}
                      </option>
                    ))}
                  </select>

                  {session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Join Meeting
                    </a>
                  )}

                  {session.status !== 'in-progress' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={actionLoading === session.id}
                    >
                      {actionLoading === session.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>

                {actionLoading === session.id && (
                  <div className="action-loading">
                    <div className="loading-spinner small"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="empty-state">
              <h3>No sessions found</h3>
              <p>{sessions.length === 0 ? 'No sessions have been created yet.' : 'Try adjusting your search or filters'}</p>
              {sessions.length === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Your First Session
                </button>
              )}
            </div>
          )}
        </>
      )}

      <CreateSessionModal
        key={isCreateModalOpen ? "create-modal-open" : "create-modal-closed"}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSession}
      />

      <SessionDetailsModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteSession}
        onEdit={handleEditSession}
        isLoading={actionLoading === selectedSession?.id}
      />

      <EditSessionModal
        session={editingSession}
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        onUpdate={handleUpdateSession}
      />
    </div>
  );
};