import React from 'react';
import type { User } from '../../types/index';

interface LinkParentModalProps {
  student: User;
  parents: User[];
  onClose: () => void;
  onLinkParent: (parentId: string) => void;
}

export const LinkParentModal: React.FC<LinkParentModalProps> = ({
  student,
  parents,
  onClose,
  onLinkParent
}) => {
  if (!student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Link Guardian to {student.fullName || `${student.firstName} ${student.lastName}`}</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="parents-list">
            <h4>Available Parents</h4>
            {parents.length === 0 ? (
              <p>No parents available.</p>
            ) : (
              parents.map((parent) => (
                <div key={parent.id} className="parent-item">
                  <div className="parent-info">
                    <strong>{parent.fullName || `${parent.firstName} ${parent.lastName}`}</strong>
                    <div className="parent-email">{parent.email}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onLinkParent(parent.id)}
                  >
                    Link
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
