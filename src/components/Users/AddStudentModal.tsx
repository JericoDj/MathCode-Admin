import React from 'react';
import type { CreateUserDTO } from '../../types/index';

interface AddStudentModalProps {
  newStudent: CreateUserDTO;
  setNewStudent: React.Dispatch<React.SetStateAction<CreateUserDTO>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  newStudent,
  setNewStudent,
  onClose,
  onSubmit
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Student</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={newStudent.phone || ''}
                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Initial Password</label>
            <input
              type="password"
              placeholder="Leave empty for auto-generate"
              onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
