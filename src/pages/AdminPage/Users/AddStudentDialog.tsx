import React, { type FormEvent } from 'react';
import type { CreateUserDTO } from '../../../types';

export interface AddStudentDialogProps {
  student: CreateUserDTO;
  onChange: React.Dispatch<React.SetStateAction<CreateUserDTO>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
}

export const AddStudentDialog: React.FC<AddStudentDialogProps> = ({ student, onChange, onSubmit, onClose }) => {
  return (
    <div className="asd-overlay" onClick={onClose}>
      <div className="asd-modal" onClick={e => e.stopPropagation()}>
        <div className="asd-header">
          <h3 className="asd-title">Add New Student</h3>
          <button className="asd-close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="asd-form">
          <div className="asd-row">
            <div className="asd-group">
              <label>First Name *</label>
              <input
                type="text"
                value={student.firstName}
                onChange={e => onChange({ ...student, firstName: e.target.value })}
                required
              />
            </div>
            <div className="asd-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={student.lastName}
                onChange={e => onChange({ ...student, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="asd-group">
            <label>Email *</label>
            <input
              type="email"
              value={student.email}
              onChange={e => onChange({ ...student, email: e.target.value })}
              required
            />
          </div>

          <div className="asd-row">
            <div className="asd-group">
              <label>Phone</label>
              <input
                type="tel"
                value={student.phone || ''}
                onChange={e => onChange({ ...student, phone: e.target.value })}
              />
            </div>
            <div className="asd-group">
              <label>Status</label>
              <select
                value={student.status}
                onChange={e => onChange({ ...student, status: e.target.value as any })}
              >
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="asd-group">
            <label>Initial Password</label>
            <input
              type="password"
              placeholder="Leave empty for auto-generate"
              onChange={e => onChange({ ...student, password: e.target.value })}
            />
          </div>

          <div className="asd-actions">
            <button type="button" className="asd-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="asd-btn-primary">Create Student</button>
          </div>
        </form>
      </div>
    </div>
  );
};

