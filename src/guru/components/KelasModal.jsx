import React from 'react';
import './EditStudentModal.css';

const KelasModal = ({ 
  isOpen, 
  onClose, 
  student, 
  availableClasses, 
  onConfirm, 
  type
}) => {
  if (!isOpen) return null;

  const handleSelect = (targetClass) => {
    const message = type === 'naik' 
      ? `Apakah Anda yakin ingin menaikkan ${student.name} ke ${targetClass}?`
      : `Apakah Anda yakin ingin memindahkan ${student.name} ke ${targetClass}?`;

    if (window.confirm(message)) {
      onConfirm(targetClass);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal" style={{ maxWidth: '500px' }}>
        <div className="edit-modal-header" style={{ 
          background: type === 'naik' ? '#4CAF50' : '#2196F3',
          color: 'white'
        }}>
          <h2>
            {type === 'naik' ? 'Naik Kelas' : 'Pindah Kelas'} - {student.name}
          </h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body" style={{ padding: '20px' }}>
          <p style={{ 
            marginBottom: '15px',
            fontSize: '16px',
            color: '#666'
          }}>
            {type === 'naik' 
              ? 'Pilih kelas tujuan untuk kenaikan kelas:' 
              : 'Pilih kelas tujuan untuk pindah kelas:'}
          </p>
          
          <div className="class-options" style={{ 
            display: 'grid', 
            gap: '10px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '5px'
          }}>
            {availableClasses.map((kelas) => (
              <button
                key={kelas}
                onClick={() => handleSelect(kelas)}
                style={{
                  padding: '12px 15px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = type === 'naik' ? '#4CAF50' : '#2196F3';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                <i className={`fas ${type === 'naik' ? 'fa-arrow-up' : 'fa-exchange-alt'}`} 
                   style={{ color: type === 'naik' ? '#4CAF50' : '#2196F3' }}/>
                {kelas}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ 
          padding: '15px 20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button 
            onClick={onClose}
            className="cancel-button"
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
            }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default KelasModal;