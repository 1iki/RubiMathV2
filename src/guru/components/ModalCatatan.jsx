import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import supabase from '../../config/supabase';
import './ModalCatatan.css';

const ModalCatatan = ({ isOpen, onClose, studentId, teacherId, studentName }) => {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // Dapatkan user dari localStorage
    const getUser = async () => {
      console.log('Fetching user from localStorage...');
      setIsUserLoading(true);
      
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userRole = localStorage.getItem("userRole");
      const userDataString = localStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;

      console.log('Login status:', { isLoggedIn, userRole, userData });

      if (!isLoggedIn || userRole !== "guru" || !userData) {
        console.warn("No valid teacher login session found in localStorage");
        setUser(null);
      } else {
        console.log('User from localStorage:', userData);
        setUser(userData);
      }
      
      setIsUserLoading(false);
    };
    getUser();
  }, []);

  // Debug status tombol submit
  useEffect(() => {
    console.log('Button status:', {
      loading,
      isUserLoading,
      user: user ? 'User exists' : 'No user',
      teacherId,
      studentId
    });
  }, [loading, isUserLoading, user, teacherId, studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUserLoading) {
      console.log('User is still loading, preventing submit.');
      return;
    }

    if (!user) {
      alert('Anda harus login terlebih dahulu');
      return;
    }

    if (!catatan.trim()) {
      alert('Catatan tidak boleh kosong');
      return;
    }
    
    if (!teacherId) {
      console.error('teacherId tidak diberikan ke ModalCatatan.');
      alert('Terjadi kesalahan: Informasi guru tidak lengkap.');
      return;
    }

    try {
      setLoading(true);

      // Get current time in Jakarta timezone
      const jakartaTime = DateTime.local().setZone('Asia/Jakarta');

      // 1. Buat catatan baru
      const { data: catatanData, error: catatanError } = await supabase
        .from('catatan')
        .insert({
          id_guru: teacherId,
          catatan: catatan.trim(),
          waktu: jakartaTime.toISO() // Save in ISO format with correct timezone
        })
        .select()
        .single();

      if (catatanError) {
        console.error('Error membuat catatan:', catatanError);
        throw catatanError;
      }

      // 2. Buat relasi siswa-catatan
      const { error: relasiError } = await supabase
        .from('siswa_catatan')
        .insert({
          id_siswa: studentId,
          id_catatan: catatanData.id_catatan
        });

      if (relasiError) {
        console.error('Error membuat relasi:', relasiError);
        throw relasiError;
      }

      alert('Catatan berhasil disimpan');
      onClose();
      setCatatan('');

    } catch (error) {
      console.error('Error menyimpan catatan:', error);
      alert('Terjadi kesalahan saat menyimpan catatan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Tambah Catatan untuk {studentName}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="catatan">Catatan:</label>
            <textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tulis catatan untuk siswa..."
              rows="5"
              required
            />
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading || isUserLoading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || isUserLoading || !user}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Menyimpan...
                </>
              ) : isUserLoading ? (
                 'Memuat user...'
              ) : !user ? (
                'Login diperlukan'
              ) : (
                'Simpan Catatan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCatatan;