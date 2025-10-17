import React from 'react';
import type { UserWithGuardians } from '../../../types/index';
import './EditStudentDialog.css';

interface EditStudentDialogProps {
  editingStudent: UserWithGuardians;
  setEditingStudent: React.Dispatch<React.SetStateAction<UserWithGuardians | null>>;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditStudentDialog: React.FC<EditStudentDialogProps> = ({ editingStudent, setEditingStudent, onSubmit }) => {
  return (
    <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Student: {editingStudent.firstName}</h3>
          <button className="btn-close" onClick={() => setEditingStudent(null)}>×</button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={editingStudent.firstName}
                onChange={e => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={editingStudent.lastName}
                onChange={e => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={editingStudent.email}
              onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={editingStudent.phone || ''}
                onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editingStudent.status}
                onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
              >
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Student</button>
          </div>
        </form>
      </div>
    </div>
  );
};
