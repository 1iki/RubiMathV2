import supabase from '../config/supabase';

// Mendapatkan semua kelas dengan data guru
export const getAllKelas = async () => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .select(`
        id_kelas,
        nama_kelas,
        created_at,
        guru:id_guru (id_guru, nama, nuptk)
      `);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all kelas:', error);
    throw error;
  }
};

// Mendapatkan kelas berdasarkan ID
export const getKelasById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .select(`
        id_kelas,
        nama_kelas,
        created_at,
        guru:id_guru (id_guru, nama, nuptk)
      `)
      .eq('id_kelas', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching kelas with id ${id}:`, error);
    throw error;
  }
};

// Mendapatkan kelas berdasarkan nama
export const getKelasByNama = async (namaKelas) => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .select(`
        id_kelas,
        nama_kelas,
        created_at,
        guru:id_guru (id_guru, nama, nuptk)
      `)
      .eq('nama_kelas', namaKelas);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching kelas with nama ${namaKelas}:`, error);
    throw error;
  }
};

// Menambahkan kelas baru
export const addKelas = async (kelasData) => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .insert([kelasData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding kelas:', error);
    throw error;
  }
};

// Mengupdate data kelas
export const updateKelas = async (idKelas, kelasData) => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .update(kelasData)
      .eq('id_kelas', idKelas)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`Error updating kelas with id ${idKelas}:`, error);
    throw error;
  }
};

// Menghapus kelas
export const deleteKelas = async (idKelas) => {
  try {
    // Update siswa yang terkait
    const { error: siswaError } = await supabase
      .from('siswa')
      .update({ id_kelas: null })
      .eq('id_kelas', idKelas);
    
    if (siswaError) throw siswaError;
    
    // Hapus kelas
    const { error } = await supabase
      .from('kelas')
      .delete()
      .eq('id_kelas', idKelas);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting kelas with id ${idKelas}:`, error);
    throw error;
  }
};

// Mendapatkan siswa dalam kelas
export const getSiswaInKelas = async (idKelas) => {
  try {
    const { data, error } = await supabase
      .from('siswa')
      .select(`
        id_siswa,
        nis,
        nama,
        tanggal_lahir,
        alamat,
        wali:id_wali (id_wali, nama)
      `)
      .eq('id_kelas', idKelas);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching siswa in kelas ${idKelas}:`, error);
    throw error;
  }
};

// Mendapatkan statistik kelas
export const getKelasStats = async (idKelas) => {
  try {
    // Mendapatkan jumlah siswa di kelas
    const { data: siswaData, error: siswaError } = await supabase
      .from('siswa')
      .select('id_siswa', { count: 'exact' })
      .eq('id_kelas', idKelas);
    
    if (siswaError) throw siswaError;
    
    // Mendapatkan rata-rata nilai siswa di kelas
    // Di sini kita perlu melakukan beberapa query dan perhitungan manual
    // karena kemungkinan perlu agregasi data dari beberapa tabel
    
    const { data: nilaiData, error: nilaiError } = await supabase
      .from('siswa')
      .select(`
        id_siswa,
        nilai:id_siswa (nilai)
      `)
      .eq('id_kelas', idKelas);
    
    if (nilaiError) throw nilaiError;
    
    // Hitung rata-rata nilai
    let totalNilai = 0;
    let jumlahNilai = 0;
    
    nilaiData.forEach(siswa => {
      if (siswa.nilai && siswa.nilai.length > 0) {
        siswa.nilai.forEach(n => {
          totalNilai += n.nilai;
          jumlahNilai++;
        });
      }
    });
    
    const avgNilai = jumlahNilai > 0 ? totalNilai / jumlahNilai : 0;
    
    return {
      jumlahSiswa: siswaData.length,
      rataRataNilai: avgNilai
    };
  } catch (error) {
    console.error(`Error fetching stats for kelas ${idKelas}:`, error);
    throw error;
  }
}; 