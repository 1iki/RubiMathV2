import React from 'react';
import { DateTime } from 'luxon';
import './ModalLihatCatatan.css';

const ModalLihatCatatan = ({ isOpen, onClose, student, notes, onDeleteNote }) => {
  const formatJakartaTime = (isoString) => {
    return DateTime.fromISO(isoString)
      .setZone('Asia/Jakarta')
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS, {
        locale: 'id'
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Catatan Siswa</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="student-info">
          <h3>{student.name}</h3>
          <p className="student-class">{student.class}</p>
        </div>

        <div className="notes-container">
          {notes && notes.length > 0 ? (
            notes.map((note, index) => (
              <div key={index} className="note-item">
                <div className="note-header">
                  <span className="note-date">
                    {formatJakartaTime(note.waktu)}
                  </span>
                </div>
                <div className="note-content">
                  <p className="note-text">{note.catatan}</p>
                  <div className="note-actions">
                    <button
                      className="send-to-parent-button-inline"
                      onClick={() => alert(`Kirim catatan ID ${note.id_catatan} ke wali`)}
                    >
                      <i className="fas fa-paper-plane"></i> Kirim ke wali
                    </button>
                    <button
                      className="delete-note-button-inline"
                      onClick={() => onDeleteNote(note.id_catatan)}
                    >
                      <i className="fas fa-trash"></i> Hapus Catatan
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notes">
              <i className="fas fa-info-circle"></i>
              <p>Belum ada catatan untuk siswa ini</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-modal-button" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLihatCatatan;