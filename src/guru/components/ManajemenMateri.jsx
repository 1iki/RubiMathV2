import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabase';

const ManajemenMateri = ({ teacherId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Form state
  const [newMaterial, setNewMaterial] = useState({
    nama_materi: '',
    kategori: '',
    url_video: '',
    file: null
  });

  useEffect(() => {
    fetchMaterials();
  }, [teacherId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materi')
        .select('*')
        .eq('id_pembuat', teacherId)
        .eq('tipe_pembuat', 'guru')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      alert('Terjadi kesalahan saat memuat data materi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, atau PPTX');
        return;
      }

      setNewMaterial(prev => ({
        ...prev,
        file
      }));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newMaterial.nama_materi.trim()) {
      setError('Nama materi tidak boleh kosong');
      return;
    }

    if (!newMaterial.kategori.trim()) {
      setError('Kategori materi tidak boleh kosong');
      return;
    }

    try {
      setUploadProgress(0);

      let fileUrl = null;
      if (newMaterial.file) {
        // Upload file ke storage
        const fileExt = newMaterial.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `materi/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('materi')
          .upload(filePath, newMaterial.file, {
            onUploadProgress: (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              setUploadProgress(percent);
            }
          });

        if (uploadError) throw uploadError;

        // Dapatkan URL file
        const { data: { publicUrl } } = supabase.storage
          .from('materi')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
      }

      // Simpan data materi ke database
      const { data, error: dbError } = await supabase
        .from('materi')
        .insert({
          nama_materi: newMaterial.nama_materi,
          kategori: newMaterial.kategori,
          url_video: newMaterial.url_video || null,
          file_url: fileUrl,
          tipe_pembuat: 'guru',
          id_pembuat: teacherId
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update state
      setMaterials(prev => [data, ...prev]);
      setNewMaterial({
        nama_materi: '',
        kategori: '',
        url_video: '',
        file: null
      });
      setUploadProgress(0);

    } catch (error) {
      console.error('Error uploading material:', error);
      setError('Terjadi kesalahan saat mengunggah materi');
    }
  };

  const handleDelete = async (materialId, fileUrl) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;

    try {
      // Hapus file dari storage jika ada
      if (fileUrl) {
        const filePath = fileUrl.split('/').pop();
        const { error: storageError } = await supabase.storage
          .from('materi')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Hapus data dari database
      const { error: dbError } = await supabase
        .from('materi')
        .delete()
        .eq('id_materi', materialId);

      if (dbError) throw dbError;

      // Update state
      setMaterials(prev => prev.filter(m => m.id_materi !== materialId));

    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Terjadi kesalahan saat menghapus materi');
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
    <div className="manajemen-materi">
      <div className="upload-section">
        <h3>Unggah Materi Baru</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nama_materi">Nama Materi:</label>
            <input
              type="text"
              id="nama_materi"
              name="nama_materi"
              value={newMaterial.nama_materi}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, nama_materi: e.target.value }))}
              placeholder="Masukkan nama materi"
            />
          </div>

          <div className="form-group">
            <label htmlFor="kategori">Kategori:</label>
            <input
              type="text"
              id="kategori"
              name="kategori" 
              value={newMaterial.kategori}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, kategori: e.target.value }))}
              placeholder="Masukkan kategori materi"
            />
          </div>

          <div className="form-group">
            <label htmlFor="url_video">URL Video (Opsional):</label>
            <input
              type="url"
              id="url_video"
              name="url_video"
              value={newMaterial.url_video}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, url_video: e.target.value }))}
              placeholder="Masukkan URL video (opsional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="file_materi">File Materi (Opsional):</label>
            <input
              type="file"
              id="file_materi"
              name="file_materi"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <small>Format yang didukung: PDF, DOC, DOCX, PPT, PPTX</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
          )}

          <button type="submit" className="upload-button">
            <i className="fas fa-upload"></i> Unggah Materi
          </button>
        </form>
      </div>

      <div className="materials-list">
        <h3>Daftar Materi</h3>
        {materials.length > 0 ? (
          <div className="materials-grid">
            {materials.map(material => (
              <div key={material.id_materi} className="material-card">
                <div className="material-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="material-info">
                  <h4>{material.nama_materi}</h4>
                  <p className="material-category">{material.kategori}</p>
                  {material.url_video && (
                    <a 
                      href={material.url_video} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="video-link"
                    >
                      <i className="fas fa-video"></i> Tonton Video
                    </a>
                  )}
                  <div className="material-meta">
                    <span>
                      {new Date(material.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="material-actions">
                  {material.file_url && (
                    <a 
                      href={material.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                  )}
                  <button 
                    onClick={() => handleDelete(material.id_materi, material.file_url)}
                    className="delete-button"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Belum ada materi yang diunggah</p>
        )}
      </div>
    </div>
  );
};

export default ManajemenMateri;