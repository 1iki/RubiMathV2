import supabase from '../config/supabase';

// Mendapatkan semua siswa
export const getAllSiswa = async () => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .order('nama', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all siswa:', error);
    throw error;
  }
};

// Mendapatkan siswa berdasarkan ID
export const getSiswaById = async (idSiswa) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('id_siswa', idSiswa)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching siswa with id ${idSiswa}:`, error);
    throw error;
  }
};

// Mendapatkan siswa berdasarkan NIS
export const getSiswaByNIS = async (nis) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('nis', nis)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching siswa with NIS ${nis}:`, error);
    throw error;
  }
};

// Mendapatkan siswa berdasarkan ID kelas
export const getSiswaByKelas = async (idKelas) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('id_kelas', idKelas)
      .order('nama', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching siswa for kelas ${idKelas}:`, error);
    throw error;
  }
};

// Mendapatkan siswa berdasarkan ID wali
export const getSiswaByWali = async (idWali) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('id_wali', idWali);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching siswa with wali ${idWali}:`, error);
    throw error;
  }
};

// Menambahkan siswa baru
export const addSiswa = async (siswaData) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .insert([{
        nis: siswaData.nis,
        nama: siswaData.nama,
        tanggal_lahir: siswaData.tanggal_lahir,
        alamat: siswaData.alamat,
        id_kelas: siswaData.id_kelas,
        id_wali: siswaData.id_wali || null,
        id_role: 4, // Peran siswa
        auth_user_id: siswaData.auth_user_id || null,
        Jenis_Kelamin: siswaData.jenis_kelamin,
        avatar: siswaData.jenis_kelamin === 'P' ? 'perempuan' : 'laki',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding new siswa:', error);
    throw error;
  }
};

// Mengupdate data siswa
export const updateSiswa = async (idSiswa, siswaData) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .update({
        nis: siswaData.nis,
        nama: siswaData.nama,
        tanggal_lahir: siswaData.tanggal_lahir,
        alamat: siswaData.alamat,
        id_kelas: siswaData.id_kelas,
        id_wali: siswaData.id_wali,
        Jenis_Kelamin: siswaData.jenis_kelamin,
        avatar: siswaData.jenis_kelamin === 'P' ? 'perempuan' : 'laki',
        updated_at: new Date().toISOString()
      })
      .eq('id_siswa', idSiswa)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`Error updating siswa with id ${idSiswa}:`, error);
    throw error;
  }
};

// Menghapus data siswa
export const deleteSiswa = async (idSiswa) => {
  try {
    // Hapus nilai, kemajuan, dan catatan siswa terkait terlebih dahulu
    await Promise.all([
      supabase.from('nilai').delete().eq('id_siswa', idSiswa),
      supabase.from('kemajuan').delete().eq('id_siswa', idSiswa),
      supabase.from('siswa_catatan').delete().eq('id_siswa', idSiswa)
    ]);

    // Hapus siswa
    const { error } = await supabase
      .from('siswa')
      .delete()
      .eq('id_siswa', idSiswa);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting siswa with id ${idSiswa}:`, error);
    throw error;
  }
};

// Mencari siswa berdasarkan nama (menggunakan fungsi SQL)
export const searchSiswa = async (namaSiswa) => {
  try {
    const { data, error } = await supabase
      .rpc('cari_siswa', { p_nama: namaSiswa });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error searching siswa with nama "${namaSiswa}":`, error);
    throw error;
  }
};