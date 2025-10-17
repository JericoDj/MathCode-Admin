import React, { useState } from 'react';
import './SimpleDialogExample.css';

export const SimpleDialogExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="simple-dialog-container">
      <button className="open-dialog-btn" onClick={() => setIsDialogOpen(true)}>
        Open Dialog
      </button>

      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h1>Hello</h1>
            <button className="close-dialog-btn" onClick={() => setIsDialogOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
