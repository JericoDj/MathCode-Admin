// pages/AdminPage/Sessions/SessionDetailsModal.tsx
import React, { useState } from 'react';
import type { Session } from './SessionsManagement';
import './ModalShared.css';
import './SessionDetailsModal.css';

interface SessionDetailsModalProps {
  session: Session | null;
  onClose: () => void;
  onStatusChange: (sessionId: string, newStatus: Session['status']) => void;
  onDelete: (sessionId: string) => void;
  onEdit: (session: Session) => void;
  isLoading?: boolean;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  onClose,
  onStatusChange,
  onDelete,
  onEdit,
  isLoading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Session['status'] | ''>('');

  if (!session) return null;

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

  // Updated status options - all statuses except current one
  const getStatusOptions = (currentStatus: Session['status']) => {
    const allStatuses: Session['status'][] = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getStatusDisplayName = (status: Session['status']) => {
    return status.replace('-', ' ').toUpperCase();
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== session.status) {
      onStatusChange(session.id, selectedStatus);
      setSelectedStatus('');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      onDelete(session.id);
    }
  };

  const statusOptions = getStatusOptions(session.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Session Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="session-details">
          <div className="details-section">
            <div className="section-header">
              <h3>Basic Information</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(session)}
                disabled={isLoading}
              >
                Edit Session
              </button>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <label>Status</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(session.status) }}
                >
                  {getStatusDisplayName(session.status)}
                </span>
              </div>
              <div className="detail-item">
                <label>Subject</label>
                <span>{session.subject}</span>
              </div>
              <div className="detail-item">
                <label>Student</label>
                <span>{session.studentName}</span>
              </div>
              <div className="detail-item">
                <label>Parent</label>
                <span>{session.parentName}</span>
              </div>
              <div className="detail-item">
                <label>Tutor</label>
                <span>{session.tutorName}</span>
              </div>
              <div className="detail-item">
                <label>Date & Time</label>
                <span>
                  {new Date(session.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {formatTimeDisplay(session.time)}
                </span>
              </div>
              <div className="detail-item">
                <label>Duration</label>
                <span>{session.duration} minutes</span>
              </div>
              <div className="detail-item">
                <label>Package Type</label>
                <span>{session.packageType}</span>
              </div>
              <div className="detail-item">
                <label>Credits Used</label>
                <span>{session.creditsUsed}</span>
              </div>
            </div>
          </div>

          {session.actualStartTime && (
            <div className="details-section">
              <h3>Session Timing</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Actual Start Time</label>
                  <span>{new Date(session.actualStartTime).toLocaleString()}</span>
                </div>
                {session.actualEndTime && (
                  <div className="detail-item">
                    <label>Actual End Time</label>
                    <span>{new Date(session.actualEndTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {session.meetingLink && (
            <div className="details-section">
              <h3>Meeting Information</h3>
              <div className="detail-item full-width">
                <label>Meeting Link</label>
                <a 
                  href={session.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="meeting-link"
                >
                  {session.meetingLink}
                </a>
              </div>
            </div>
          )}

          {session.notes && (
            <div className="details-section">
              <h3>Admin Notes</h3>
              <div className="notes-content">
                {session.notes}
              </div>
            </div>
          )}

          {session.sessionNotes && (
            <div className="details-section">
              <h3>Session Notes</h3>
              <div className="notes-content">
                {session.sessionNotes}
              </div>
            </div>
          )}

          {(session.rating || session.feedback) && (
            <div className="details-section">
              <h3>Feedback</h3>
              <div className="details-grid">
                {session.rating && (
                  <div className="detail-item">
                    <label>Rating</label>
                    <span className="rating">
                      {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}
                    </span>
                  </div>
                )}
                {session.feedback && (
                  <div className="detail-item full-width">
                    <label>Feedback</label>
                    <div className="feedback-content">
                      {session.feedback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="details-section">
            <h3>Session Management</h3>
            <div className="management-actions">
              <div className="status-update-section">
                <label>Update Status</label>
                <div className="status-update-controls">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as Session['status'])}
                    disabled={isLoading || statusOptions.length === 0}
                    className="status-select"
                  >
                    <option value="">Select new status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {getStatusDisplayName(status)}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              <div className="danger-actions">
                {session.status !== 'in-progress' && (
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Session'}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => onEdit(session)}
                  disabled={isLoading}
                >
                  Reschedule/Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};