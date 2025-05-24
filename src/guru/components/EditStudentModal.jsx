import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabase';
import './EditStudentModal.css';

const EditStudentModal = ({ isOpen, onClose, student, onUpdate }) => {
  const [formData, setFormData] = useState({
    nama: '',
    nis: '',
    tanggal_lahir: '',
    alamat: '',
    id_kelas: '',
    avatar: '',
    Jenis_Kelamin: '',
    id_wali: ''
  });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const animalAvatars = [
    'Anjing', 'Babi', 'Bebek', 'Gurita', 'Harimau',
    'Kelinci', 'Kucing', 'Sapi', 'Serigala', 'Singa'
  ];

  useEffect(() => {
    if (student) {
      setFormData({
        nama: student.name || '',
        nis: student.nis || '',
        tanggal_lahir: student.birthDate || '',
        alamat: student.address || '',
        id_kelas: student.class?.replace('Kelas ', '') || '',
        avatar: student.avatar || '',
        Jenis_Kelamin: student.gender || '',
        id_wali: student.id_wali || ''
      });
    }
    fetchParents();
  }, [student]);

  const fetchParents = async () => {
    try {
      const { data, error } = await supabase
        .from('wali')
        .select('id_wali, nama');
      
      if (error) throw error;
      setParents(data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
      setError('Gagal memuat data wali murid');
    }
  };

  const checkParentAssignments = async (id_wali) => {
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa')
        .eq('id_wali', id_wali);

      if (error) throw error;

      // If this parent is already assigned to 3 or more students (excluding current student)
      if (data && data.length >= 3 && !data.some(s => s.id_siswa === student.id)) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking parent assignments:', error);
      return false;
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    // Special handling for id_wali changes
    if (name === 'id_wali' && value) {
      const isValid = await checkParentAssignments(value);
      if (!isValid) {
        alert('Peringatan: Wali murid ini sudah ditautkan dengan 3 siswa lain.');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check parent assignments before submitting
      if (formData.id_wali) {
        const isValid = await checkParentAssignments(formData.id_wali);
        if (!isValid) {
          if (!confirm('Wali murid ini sudah ditautkan dengan 3 siswa lain. Apakah Anda yakin ingin melanjutkan?')) {
            setLoading(false);
            return;
          }
        }
      }

      const { error } = await supabase
        .from('siswa')
        .update({
          nama: formData.nama,
          nis: formData.nis,
          tanggal_lahir: formData.tanggal_lahir,
          alamat: formData.alamat,
          id_kelas: formData.id_kelas,
          avatar: formData.avatar,
          Jenis_Kelamin: formData.Jenis_Kelamin,
          id_wali: formData.id_wali || null
        })
        .eq('id_siswa', student.id);

      if (error) throw error;

      alert('Data siswa berhasil diperbarui!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
      setError('Gagal memperbarui data siswa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h2>Edit Data Siswa</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nama">Nama Siswa:</label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nis">NIS:</label>
            <input
              type="text"
              id="nis"
              name="nis"
              value={formData.nis}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tanggal_lahir">Tanggal Lahir:</label>
            <input
              type="date"
              id="tanggal_lahir"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="alamat">Alamat:</label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="id_kelas">Kelas:</label>
            <input
              type="number"
              id="id_kelas"
              name="id_kelas"
              value={formData.id_kelas}
              onChange={handleChange}
              min="1"
              max="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar:</label>
            <select
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Avatar</option>
              {animalAvatars.map((avatar) => (
                <option key={avatar} value={avatar}>
                  {avatar}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="Jenis_Kelamin">Jenis Kelamin:</label>
            <select
              id="Jenis_Kelamin"
              name="Jenis_Kelamin"
              value={formData.Jenis_Kelamin}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="id_wali">Wali Murid:</label>
            <select
              id="id_wali"
              name="id_wali"
              value={formData.id_wali || ''}
              onChange={handleChange}
            >
              <option value="">Pilih Wali Murid</option>
              {parents.map((parent) => (
                <option key={parent.id_wali} value={parent.id_wali}>
                  {parent.nama}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;