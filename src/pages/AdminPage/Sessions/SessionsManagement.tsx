// pages/AdminPage/Sessions/SessionsManagement.tsx
import React, { useState, useEffect } from 'react';
import { CreateSessionModal } from './CreateSessionModal';
import { SessionDetailsModal } from './SessionDetailsModal';
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
}

export const SessionsManagement: React.FC = () => {
  const { sessions, isLoading, error, refreshSessions, updateSessionStatus } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('list');
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    // Start with today's date, not hardcoded to 2025
    return new Date();
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Refresh sessions when component mounts
  useEffect(() => {
    refreshSessions();
  }, []);

  // Auto-adjust calendar to show weeks with sessions when switching to calendar view
  useEffect(() => {
    if (sessions.length > 0 && activeView === 'calendar') {
      // Check if current week has any sessions
      const currentWeekHasSessions = sessions.some(session => {
        const sessionDate = new Date(session.date);
        const isInCurrentWeek = weekDates.some(weekDate => {
          return getFormattedDate(weekDate) === getFormattedDate(sessionDate);
        });
        return isInCurrentWeek;
      });

      // If current week has no sessions, jump to the week with the nearest session
      if (!currentWeekHasSessions) {
        goToNearestSessionWeek();
      }
    }
  }, [sessions, activeView]);

  // Helper function to format date as YYYY-MM-DD
  function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Get the current week's dates
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

  // Navigate weeks
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

  const goToNearestSessionWeek = () => {
    if (sessions.length > 0) {
      const today = new Date();
      
      // Find sessions and calculate how far they are from today
      const sessionsWithDistance = sessions.map(session => {
        const sessionDate = new Date(session.date);
        const distance = Math.abs(sessionDate.getTime() - today.getTime());
        return { session, distance, date: sessionDate };
      });
      
      // Sort by distance (closest first)
      sessionsWithDistance.sort((a, b) => a.distance - b.distance);
      
      // Get the closest session date
      const closestSessionDate = sessionsWithDistance[0].date;
      
      // Set current week to the week containing the closest session
      const startOfWeek = new Date(closestSessionDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      setCurrentWeek(startOfWeek);
    }
  };

  const goToSessionsWeek = () => {
    if (sessions.length > 0) {
      // Find the earliest upcoming session, or if none, the most recent session
      const today = new Date();
      const upcomingSessions = sessions.filter(session => new Date(session.date) >= today);
      
      let targetSession;
      if (upcomingSessions.length > 0) {
        // Use the earliest upcoming session
        targetSession = upcomingSessions.reduce((earliest, session) => {
          return new Date(session.date) < new Date(earliest.date) ? session : earliest;
        });
      } else {
        // Use the most recent session if no upcoming sessions
        targetSession = sessions.reduce((latest, session) => {
          return new Date(session.date) > new Date(latest.date) ? session : latest;
        });
      }
      
      const sessionDate = new Date(targetSession.date);
      const startOfWeek = new Date(sessionDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      setCurrentWeek(startOfWeek);
    }
  };

  // Filter sessions for the current view
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

  // Group sessions by date for calendar view
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
    setIsCreateModalOpen(false);
  };

  const handleStatusChange = async (sessionId: string, newStatus: Session['status']) => {
    try {
      if (!sessionId || sessionId === 'undefined') {
        console.error('Invalid session ID:', sessionId);
        return;
      }
      
      await updateSessionStatus(sessionId, newStatus);
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
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

  // Check if current week has any sessions
  const currentWeekHasSessions = sessions.some(session => {
    const sessionDate = new Date(session.date);
    return weekDates.some(weekDate => {
      return getFormattedDate(weekDate) === getFormattedDate(sessionDate);
    });
  });

  return (
    <div className="sessions-management">
      {/* Header */}
      <div className="sessions-header">
        <div className="header-left">
          <h1 className="page-title">Session Management</h1>
          <p className="page-subtitle">Manage and track all tutoring sessions</p>
          {activeView === 'calendar' && (
            <div className="current-week-info">
              Week of {weekDates[0].toLocaleDateString()} to {weekDates[6].toLocaleDateString()}
              {!currentWeekHasSessions && sessions.length > 0 && (
                <span className="no-sessions-hint"> (No sessions this week)</span>
              )}
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
            <>
              <button
                className="btn btn-secondary"
                onClick={goToSessionsWeek}
                disabled={sessions.length === 0}
              >
                Jump to Sessions
              </button>
              {!currentWeekHasSessions && sessions.length > 0 && (
                <button
                  className="btn btn-text"
                  onClick={goToNearestSessionWeek}
                >
                  Find Nearest Session
                </button>
              )}
            </>
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

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-message">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && sessions.length === 0 && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading sessions...</p>
        </div>
      )}

      {/* View Toggle */}
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

      {/* Calendar View */}
      {!isLoading && activeView === 'calendar' && (
        <>
          {/* Week Navigation */}
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

          {/* Calendar Grid */}
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

      {/* List View */}
      {!isLoading && activeView === 'list' && (
        <>
          {/* Filters and Search */}
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

          {/* Sessions Count */}
          <div className="sessions-count">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>

          {/* Sessions Grid */}
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
                      {session.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <button
                    className="btn btn-text"
                    onClick={() => setSelectedSession(session)}
                  >
                    View Details
                  </button>
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
                  {session.status === 'scheduled' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusChange(session.id, 'in-progress')}
                      >
                        Start Session
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusChange(session.id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {session.status === 'in-progress' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusChange(session.id, 'completed')}
                    >
                      Complete Session
                    </button>
                  )}
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
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
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

      {/* Modals */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSession}
      />

      <SessionDetailsModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};