import React, { useState } from 'react';

export const SimpleDialogExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <button 
        style={{
          padding: '10px 20px',
          backgroundColor: '#00bfa6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        Open Dialog
      </button>

      {isDialogOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setIsDialogOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              minWidth: '300px',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h1>Hello</h1>
            <button 
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
