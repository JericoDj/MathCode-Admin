import React from 'react';
import './AddStudentDialog.css';

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newStudent: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    password?: string;
  };
  setNewStudent: React.Dispatch<React.SetStateAction<any>>;
  handleAddStudent: (e: React.FormEvent) => void;
}

export const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  isOpen,
  onClose,
  newStudent,
  setNewStudent,
  handleAddStudent
}) => {
  if (!isOpen) return null;

  return (
    <div className="asd-overlay" onClick={onClose}>
      <div className="asd-modal" onClick={e => e.stopPropagation()}>
        <div className="asd-header">
          <h3>Add New Student</h3>
          <button className="asd-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleAddStudent} className="asd-form">
          <div className="asd-row">
            <div className="asd-group">
              <label>First Name *</label>
              <input type="text" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} required />
            </div>
            <div className="asd-group">
              <label>Last Name *</label>
              <input type="text" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} required />
            </div>
          </div>

          <div className="asd-group">
            <label>Email *</label>
            <input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} required />
          </div>

          <div className="asd-row">
            <div className="asd-group">
              <label>Phone</label>
              <input type="tel" value={newStudent.phone || ''} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
            </div>
            <div className="asd-group">
              <label>Status</label>
              <select value={newStudent.status} onChange={e => setNewStudent({...newStudent, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="asd-group">
            <label>Initial Password</label>
            <input type="password" placeholder="Leave empty for auto-generate" onChange={e => setNewStudent({...newStudent, password: e.target.value})}/>
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
