// pages/AdminPage/Sessions/EditSessionModal.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../contexts/SessionContext';
import type { Session } from './SessionsManagement';
import './ModalShared.css';


interface EditSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (session: Session) => void;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { updateSession } = useSession(); // Remove isLoading from here
  const [isSubmitting, setIsSubmitting] = useState(false); // Add separate state for form submission
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tutorName: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    status: 'scheduled' as Session['status'],
    packageType: '1:1 Private Tutoring',
    notes: '',
    meetingLink: '',
    sessionNotes: '',
    rating: 0,
    feedback: ''
  });

  useEffect(() => {
    if (isOpen && session) {
      console.log('EditSessionModal opened with session:', session);
      // Pre-populate form with session data
      setFormData({
        tutorName: session.tutorName,
        subject: session.subject,
        date: session.date.split('T')[0], // Extract date part only
        time: session.time,
        duration: session.duration,
        status: session.status,
        packageType: session.packageType,
        notes: session.notes || '',
        meetingLink: session.meetingLink || '',
        sessionNotes: session.sessionNotes || '',
        rating: session.rating || 0,
        feedback: session.feedback || ''
      });
      setError(null);
      setIsSubmitting(false); // Reset submitting state
    }
  }, [isOpen, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    console.log('=== EDIT SESSION SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    
    if (!session) {
      setError('No session selected');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedSessionData = {
        tutorName: formData.tutorName,
        subject: formData.subject,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        status: formData.status,
        packageType: formData.packageType,
        notes: formData.notes,
        meetingLink: formData.meetingLink,
        sessionNotes: formData.sessionNotes,
        rating: formData.rating > 0 ? formData.rating : undefined, // Only send if rating exists
        feedback: formData.feedback
      };
      
      console.log('Sending updated session data to API:', updatedSessionData);
      
      const updatedSession = await updateSession(session.id, updatedSessionData);
      
      console.log('Session updated successfully:', updatedSession);
      
      onUpdate(updatedSession);
      onClose();
      
    } catch (err) {
      console.error('Failed to update session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`EditSessionModal - Input change - ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isFormValid = () => {
    const isValid = formData.tutorName && formData.subject && formData.date && formData.time;
    
    console.log('EditSessionModal - Form validation:', isValid, {
      tutorName: !!formData.tutorName,
      subject: !!formData.subject,
      date: !!formData.date,
      time: !!formData.time
    });
    
    return isValid;
  };

  const calculateCredits = (duration: number): number => {
    if (duration <= 30) return 0.5;
    if (duration <= 60) return 1;
    if (duration <= 90) return 1.5;
    if (duration <= 120) return 2;
    return Math.ceil(duration / 60);
  };

  if (!isOpen || !session) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-session" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Session</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-message">{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="session-info-header">
          <h4>Editing Session</h4>
          <p>
            <strong>Student:</strong> {session.studentName} • 
            <strong> Parent:</strong> {session.parentName} • 
            <strong> Credits:</strong> {calculateCredits(formData.duration)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form create-session-form">
          <div className="form-grid">
            {/* Student Information (Display Only) */}
            <div className="form-group full-width info-card">
              <label>Session Information</label>
              <div className="selected-user-info">
                <div className="user-detail">
                  <strong>Student:</strong> {session.studentName}
                </div>
                <div className="user-detail">
                  <strong>Parent:</strong> {session.parentName}
                </div>
                <div className="user-detail">
                  <strong>Current Credits:</strong> {session.creditsUsed}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Tutor Name *</label>
              <input
                type="text"
                value={formData.tutorName}
                onChange={(e) => handleInputChange('tutorName', e.target.value)}
                required
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
                placeholder="Enter tutor name"
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                required
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
                placeholder="e.g., Math, Science, English"
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={getMinDate()}
                required
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {formatTimeDisplay(time)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Duration *</label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                required
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              >
                <option value={30}>30 minutes (0.5 credits)</option>
                <option value={60}>60 minutes (1 credit)</option>
                <option value={90}>90 minutes (1.5 credits)</option>
                <option value={120}>120 minutes (2 credits)</option>
                <option value={180}>180 minutes (3 credits)</option>
                <option value={240}>240 minutes (4 credits)</option>
              </select>
              <div className="credits-display">
                New Credits: {calculateCredits(formData.duration)}
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Session['status'])}
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            <div className="form-group">
              <label>Package Type</label>
              <select
                value={formData.packageType}
                onChange={(e) => handleInputChange('packageType', e.target.value)}
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              >
                <option value="1:1 Private Tutoring">1:1 Private Tutoring</option>
                <option value="1:2 Small Group">1:2 Small Group</option>
                <option value="1:4 Group Class">1:4 Group Class</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Meeting Link</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/..."
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              />
            </div>

            <div className="form-group full-width">
              <label>Admin Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Any special instructions or notes for the session..."
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              />
            </div>

            <div className="form-group full-width">
              <label>Session Notes</label>
              <textarea
                value={formData.sessionNotes}
                onChange={(e) => handleInputChange('sessionNotes', e.target.value)}
                rows={3}
                placeholder="Notes from the actual session..."
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              >
                <option value={0}>No Rating</option>
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Feedback</label>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                rows={3}
                placeholder="Student or parent feedback..."
                disabled={isSubmitting} // Use isSubmitting instead of contextLoading
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={isSubmitting} // Use isSubmitting instead of contextLoading
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isFormValid() || isSubmitting} // Use isSubmitting instead of contextLoading
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Updating...
                </>
              ) : (
                'Update Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to format time for display
function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}