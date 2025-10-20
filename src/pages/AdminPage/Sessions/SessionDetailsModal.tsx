// pages/AdminPage/Sessions/SessionDetailsModal.tsx
import React from 'react';
import type { Session } from './SessionsManagement'; // Add 'type' keyword

import './ModalShared.css';
import './SessionDetailsModal.css';

interface SessionDetailsModalProps {
  session: Session | null;
  onClose: () => void;
  onStatusChange: (sessionId: string, newStatus: Session['status']) => void;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  onClose,
  onStatusChange
}) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Session Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="session-details">
          <div className="details-section">
            <h3>Basic Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Status</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(session.status) }}
                >
                  {session.status.replace('-', ' ').toUpperCase()}
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
                <span>{session.date} at {session.time}</span>
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

          {session.meetingLink && (
            <div className="details-section">
              <h3>Meeting Information</h3>
              <div className="detail-item">
                <label>Meeting Link</label>
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              </div>
            </div>
          )}

          {session.notes && (
            <div className="details-section">
              <h3>Notes</h3>
              <p>{session.notes}</p>
            </div>
          )}

          <div className="details-section">
            <h3>Session Actions</h3>
            <div className="action-buttons">
              {session.status === 'scheduled' && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => onStatusChange(session.id, 'in-progress')}
                  >
                    Start Session
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onStatusChange(session.id, 'cancelled')}
                  >
                    Cancel Session
                  </button>
                </>
              )}
              {session.status === 'in-progress' && (
                <button
                  className="btn btn-success"
                  onClick={() => onStatusChange(session.id, 'completed')}
                >
                  Complete Session
                </button>
              )}
              {(session.status === 'completed' || session.status === 'cancelled') && (
                <button
                  className="btn btn-secondary"
                  onClick={() => onStatusChange(session.id, 'scheduled')}
                >
                  Reschedule
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};