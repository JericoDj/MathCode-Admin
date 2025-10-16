import React from 'react';
import type { User, UpdateUserDTO } from '../../types/index';
interface EditStudentModalProps {
  student: User;
  setStudent: React.Dispatch<React.SetStateAction<User | null>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  setStudent,
  onClose,
  onSubmit
}) => {
  if (!student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Student: {student.fullName || `${student.firstName} ${student.lastName}`}</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={student.firstName}
                onChange={(e) => setStudent({...student, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={student.lastName}
                onChange={(e) => setStudent({...student, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={student.email}
              onChange={(e) => setStudent({...student, email: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={student.phone || ''}
                onChange={(e) => setStudent({...student, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
