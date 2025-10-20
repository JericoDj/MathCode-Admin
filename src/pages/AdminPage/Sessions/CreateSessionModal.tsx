// pages/AdminPage/Sessions/CreateSessionModal.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../contexts/SessionContext';
import type { Session } from './SessionsManagement';
import './ModalShared.css';
import './CreateSessionModal.css';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (session: Omit<Session, 'id'>) => void;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  credits?: number;
  guardianOf?: string[];
  profile?: {
    timezone: string;
  };
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const { createSession, isLoading: contextLoading } = useSession();
  const [students, setStudents] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedParent, setSelectedParent] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    parentId: '',
    tutorName: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    status: 'scheduled' as Session['status'],
    packageType: '1:1 Private Tutoring',
    notes: '',
    meetingLink: ''
  });

  // Load students and parents when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setError(null);
      // Reset form when modal opens
      setFormData({
        studentId: '',
        parentId: '',
        tutorName: '',
        subject: '',
        date: '',
        time: '',
        duration: 60,
        status: 'scheduled',
        packageType: '1:1 Private Tutoring',
        notes: '',
        meetingLink: ''
      });
      setSelectedStudent(null);
      setSelectedParent(null);
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      // Load students and parents in parallel
      const [studentsResponse, parentsResponse] = await Promise.all([
        fetch('http://localhost:4000/api/users?role=student', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:4000/api/users?role=parent', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!studentsResponse.ok || !parentsResponse.ok) {
        throw new Error('Failed to load users');
      }

      const studentsData = await studentsResponse.json();
      const parentsData = await parentsResponse.json();

      setStudents(studentsData.items || studentsData);
      setParents(parentsData.items || parentsData);

    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
      // For demo purposes, create mock data
      setStudents(getMockStudents());
      setParents(getMockParents());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Get student and parent names from selected IDs
      const student = students.find(s => s._id === formData.studentId);
      const parent = parents.find(p => p._id === formData.parentId);
      
      if (!student || !parent) {
        setError('Please select both student and parent');
        return;
      }

      const sessionData = {
        studentId: formData.studentId,
        parentId: formData.parentId,
        studentName: `${student.firstName} ${student.lastName}`,
        parentName: `${parent.firstName} ${parent.lastName}`,
        tutorName: formData.tutorName,
        subject: formData.subject,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        status: formData.status,
        packageType: formData.packageType,
        notes: formData.notes,
        meetingLink: formData.meetingLink
      };
      
      // Use the context to create session
      const newSession = await createSession(sessionData);
      
      // Also call the old onCreate for backward compatibility
      onCreate(newSession);
      
      onClose(); // Close modal on success
      
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update selected student/parent when IDs change
    if (field === 'studentId') {
      const student = students.find(s => s._id === value) || null;
      setSelectedStudent(student);
    }
    
    if (field === 'parentId') {
      const parent = parents.find(p => p._id === value) || null;
      setSelectedParent(parent);
    }
  };

  // Generate time slots in 30-minute intervals
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

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isFormValid = () => {
    return formData.studentId && 
           formData.parentId && 
           formData.tutorName &&
           formData.subject && 
           formData.date && 
           formData.time;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-session" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Session</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <span className="error-message">{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form create-session-form">
          <div className="form-grid">
            {/* Student Selection */}
            <div className="form-group">
              <label>Student *</label>
              {isLoading ? (
                <div className="loading-text">Loading students...</div>
              ) : (
                <select
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  required
                  disabled={contextLoading}
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} - {student.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Parent Selection */}
            <div className="form-group">
              <label>Parent Account *</label>
              {isLoading ? (
                <div className="loading-text">Loading parents...</div>
              ) : (
                <select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange('parentId', e.target.value)}
                  required
                  disabled={contextLoading}
                >
                  <option value="">Select a parent</option>
                  {parents.map(parent => (
                    <option key={parent._id} value={parent._id}>
                      {parent.firstName} {parent.lastName} - {parent.email}
                      {parent.credits !== undefined && ` (Credits: ${parent.credits})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Student Information */}
            {selectedStudent && (
              <div className="form-group full-width info-card">
                <label>Selected Student:</label>
                <div className="selected-user-info">
                  <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>
                  <span>Email: {selectedStudent.email}</span>
                  <span>Phone: {selectedStudent.phone || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Selected Parent Information */}
            {selectedParent && (
              <div className="form-group full-width info-card">
                <label>Selected Parent:</label>
                <div className="selected-user-info">
                  <strong>{selectedParent.firstName} {selectedParent.lastName}</strong>
                  <span>Email: {selectedParent.email}</span>
                  <span>Phone: {selectedParent.phone || 'N/A'}</span>
                  <span>Credits: {selectedParent.credits || 0}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Tutor Name *</label>
              <input
                type="text"
                value={formData.tutorName}
                onChange={(e) => handleInputChange('tutorName', e.target.value)}
                placeholder="Enter tutor name"
                required
                disabled={contextLoading}
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Math, Science, English"
                required
                disabled={contextLoading}
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
                disabled={contextLoading}
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
                disabled={contextLoading}
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
                disabled={contextLoading}
              >
                <option value={30}>30 minutes (0.5 credits)</option>
                <option value={60}>60 minutes (1 credit)</option>
                <option value={90}>90 minutes (1.5 credits)</option>
                <option value={120}>120 minutes (2 credits)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Session['status'])}
                disabled={contextLoading}
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
                disabled={contextLoading}
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
                disabled={contextLoading}
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Any special instructions or notes for the session..."
                disabled={contextLoading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={contextLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isFormValid() || contextLoading}
            >
              {contextLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating...
                </>
              ) : (
                'Create Session'
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

// Mock data for demo purposes
function getMockStudents(): User[] {
  return [
    {
      _id: 'student1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      roles: ['student'],
      credits: 10
    },
    {
      _id: 'student2',
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@example.com',
      phone: '+1234567891',
      roles: ['student'],
      credits: 5
    }
  ];
}

function getMockParents(): User[] {
  return [
    {
      _id: 'parent1',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@example.com',
      phone: '+1234567892',
      roles: ['parent'],
      credits: 10
    },
    {
      _id: 'parent2',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1234567893',
      roles: ['parent'],
      credits: 5
    }
  ];
}