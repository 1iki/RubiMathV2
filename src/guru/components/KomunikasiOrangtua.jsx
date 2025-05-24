import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabase';

const Komunikasiwali = ({ teacherId }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentInfo, setParentInfo] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, [teacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      fetchNotes(selectedStudent);
      fetchParentInfo(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('*')
        .eq('id_guru', teacherId);

      if (error) throw error;
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClass(data[0].id_kelas);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Terjadi kesalahan saat memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('id_kelas', classId);

      if (error) throw error;
      setStudents(data || []);
      if (data && data.length > 0) {
        setSelectedStudent(data[0].id_siswa);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Terjadi kesalahan saat memuat data siswa');
    }
  };

  const fetchNotes = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('catatan')
        .select(`
          *,
          siswa_catatan!inner(*)
        `)
        .eq('siswa_catatan.id_siswa', studentId)
        .order('waktu', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Terjadi kesalahan saat memuat catatan');
    }
  };

  const fetchParentInfo = async (studentId) => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('siswa')
        .select('id_wali')
        .eq('id_siswa', studentId)
        .single();

      if (studentError) throw studentError;

      if (studentData?.id_wali) {
        const { data: parentData, error: parentError } = await supabase
          .from('wali')
          .select('*')
          .eq('id_wali', studentData.id_wali)
          .single();

        if (parentError) throw parentError;
        setParentInfo(parentData);
      } else {
        setParentInfo(null);
      }
    } catch (error) {
      console.error('Error fetching parent info:', error);
      alert('Terjadi kesalahan saat memuat informasi orang tua');
    }
  };

  const handleSendNote = async () => {
    if (!newNote.trim()) {
      alert('Catatan tidak boleh kosong');
      return;
    }

    try {
      // Create note record
      const { data: noteData, error: noteError } = await supabase
        .from('catatan')
        .insert({
          id_guru: teacherId,
          catatan: newNote,
          waktu: new Date().toISOString()
        })
        .select()
        .single();

      if (noteError) throw noteError;

      // Create student_note relationship
      const { error: relationError } = await supabase
        .from('siswa_catatan')
        .insert({
          id_siswa: selectedStudent,
          id_catatan: noteData.id_catatan
        });

      if (relationError) throw relationError;

      // Update local state
      setNotes(prev => [noteData, ...prev]);
      setNewNote('');

    } catch (error) {
      console.error('Error sending note:', error);
      alert('Terjadi kesalahan saat mengirim catatan');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i> Memuat data...
      </div>
    );
  }

  return (
    <div className="komunikasi-wali">
      <div className="filters">
        <div className="filter-group">
          <label>Pilih Kelas:</label>
          <select 
            value={selectedClass || ''} 
            onChange={(e) => setSelectedClass(parseInt(e.target.value))}
          >
            {classes.map(kelas => (
              <option key={kelas.id_kelas} value={kelas.id_kelas}>
                {kelas.nama_kelas}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Pilih Siswa:</label>
          <select 
            value={selectedStudent || ''} 
            onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
          >
            {students.map(siswa => (
              <option key={siswa.id_siswa} value={siswa.id_siswa}>
                {siswa.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedStudent && (
        <div className="communication-content">
          <div className="parent-info">
            <h3>Informasi Orang Tua</h3>
            {parentInfo ? (
              <div className="info-card">
                <p><strong>Nama:</strong> {parentInfo.nama}</p>
                <p><strong>Email:</strong> {parentInfo.email}</p>
                <p><strong>Telepon:</strong> {parentInfo.no_telp}</p>
              </div>
            ) : (
              <p className="no-data">Belum ada informasi orang tua</p>
            )}
          </div>

          <div className="send-note">
            <h3>Kirim Catatan</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Tulis catatan untuk orang tua..."
              rows="4"
            />
            <button onClick={handleSendNote} className="send-button">
              <i className="fas fa-paper-plane"></i> Kirim
            </button>
          </div>

          <div className="notes-history">
            <h3>Riwayat Catatan</h3>
            {notes.length > 0 ? (
              <div className="notes-list">
                {notes.map(note => (
                  <div key={note.id_catatan} className="note-item">
                    <div className="note-header">
                      <span className="note-date">
                        {new Date(note.waktu).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="note-content">
                      {note.catatan}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Belum ada catatan</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Komunikasiwali; 