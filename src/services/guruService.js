import supabase from '../config/supabase';

// Mendapatkan semua guru
export const getAllGuru = async () => {
  try {
    const { data, error } = await supabase
      .from('guru')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all guru:', error);
    throw error;
  }
};

// Mendapatkan guru berdasarkan ID
export const getGuruById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('guru')
      .select('*')
      .eq('id_guru', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching guru with id ${id}:`, error);
    throw error;
  }
};

// Mendapatkan guru berdasarkan NUPTK
export const getGuruByNUPTK = async (nuptk) => {
  try {
    const { data, error } = await supabase
      .from('guru')
      .select('*')
      .eq('nuptk', nuptk)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching guru with NUPTK ${nuptk}:`, error);
    throw error;
  }
};

// Menambahkan guru baru
export const addGuru = async (guruData) => {
  try {
    const { data, error } = await supabase
      .from('guru')
      .insert([guruData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding guru:', error);
    throw error;
  }
};

// Mengupdate data guru
export const updateGuru = async (idGuru, guruData) => {
  try {
    const { data, error } = await supabase
      .from('guru')
      .update(guruData)
      .eq('id_guru', idGuru)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`Error updating guru with id ${idGuru}:`, error);
    throw error;
  }
};

// Menghapus data guru
export const deleteGuru = async (idGuru) => {
  try {
    // Cek apakah ada kelas dengan guru ini
    const { data: kelasData, error: kelasError } = await supabase
      .from('kelas')
      .select('id_kelas')
      .eq('id_guru', idGuru);
    
    if (kelasError) throw kelasError;
    
    // Jika guru memiliki kelas, harus update kelas terlebih dahulu
    if (kelasData && kelasData.length > 0) {
      const kelasIds = kelasData.map(k => k.id_kelas);
      const { error: updateKelasError } = await supabase
        .from('kelas')
        .update({ id_guru: null })
        .in('id_kelas', kelasIds);
      
      if (updateKelasError) throw updateKelasError;
    }
    
    // Hapus catatan terkait
    const { error: catatanError } = await supabase
      .from('catatan')
      .delete()
      .eq('id_guru', idGuru);
    
    if (catatanError) throw catatanError;
    
    // Hapus data guru
    const { error } = await supabase
      .from('guru')
      .delete()
      .eq('id_guru', idGuru);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting guru with id ${idGuru}:`, error);
    throw error;
  }
};

// Mendapatkan kelas yang diajar oleh guru
export const getKelasGuru = async (idGuru) => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .select('*')
      .eq('id_guru', idGuru);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching kelas for guru ${idGuru}:`, error);
    throw error;
  }
};

// Mendapatkan materi yang dibuat oleh guru
export const getMateriGuru = async (idGuru) => {
  try {
    const { data, error } = await supabase
      .from('materi')
      .select('*')
      .eq('tipe_pembuat', 'guru')
      .eq('id_pembuat', idGuru);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching materi for guru ${idGuru}:`, error);
    throw error;
  }
};

// Mendapatkan catatan yang dibuat oleh guru
export const getCatatanGuru = async (idGuru) => {
  try {
    const { data, error } = await supabase
      .from('catatan')
      .select(`
        *,
        siswa_catatan (
          id_siswa,
          siswa:id_siswa (nama)
        )
      `)
      .eq('id_guru', idGuru);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching catatan for guru ${idGuru}:`, error);
    throw error;
  }
};

// Menambahkan catatan untuk siswa
export const addCatatanGuru = async (idGuru, idWali, catatan, idSiswa) => {
  try {
    // Buat catatan terlebih dahulu
    const { data: catatanData, error: catatanError } = await supabase
      .from('catatan')
      .insert([{ id_guru: idGuru, id_wali: idWali, catatan }])
      .select();
    
    if (catatanError) throw catatanError;
    
    // Hubungkan catatan dengan siswa
    const { data: siswaCatatanData, error: siswaCatatanError } = await supabase
      .from('siswa_catatan')
      .insert([{ id_siswa: idSiswa, id_catatan: catatanData[0].id_catatan }])
      .select();
    
    if (siswaCatatanError) throw siswaCatatanError;
    
    return catatanData[0];
  } catch (error) {
    console.error(`Error adding catatan for siswa ${idSiswa} by guru ${idGuru}:`, error);
    throw error;
  }
}; 