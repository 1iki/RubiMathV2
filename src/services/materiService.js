import supabase from '../config/supabase';

// Mendapatkan semua materi dengan informasi pembuat
export const getAllMateri = async () => {
  try {
    const { data, error } = await supabase
      .from('materi_dengan_pembuat')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all materi:', error);
    throw error;
  }
};

// Mendapatkan materi berdasarkan ID
export const getMateriById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('materi_dengan_pembuat')
      .select('*')
      .eq('id_materi', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching materi with id ${id}:`, error);
    throw error;
  }
};

// Mendapatkan materi berdasarkan kategori
export const getMateriByKategori = async (kategori) => {
  try {
    const { data, error } = await supabase
      .from('materi_dengan_pembuat')
      .select('*')
      .eq('kategori', kategori);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching materi with kategori ${kategori}:`, error);
    throw error;
  }
};

// Menambahkan materi baru (hanya admin atau guru yang bisa)
export const addMateri = async (materiData, tipePembuat, idPembuat) => {
  try {
    const { data, error } = await supabase
      .from('materi')
      .insert([{
        ...materiData,
        tipe_pembuat: tipePembuat,
        id_pembuat: idPembuat
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding materi:', error);
    throw error;
  }
};

// Mengupdate materi yang sudah ada
export const updateMateri = async (idMateri, materiData) => {
  try {
    const { data, error } = await supabase
      .from('materi')
      .update(materiData)
      .eq('id_materi', idMateri)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`Error updating materi with id ${idMateri}:`, error);
    throw error;
  }
};

// Menghapus materi
export const deleteMateri = async (idMateri) => {
  try {
    // Hapus referensi di tabel nilai terlebih dahulu
    const { error: nilaError } = await supabase
      .from('nilai')
      .delete()
      .eq('id_materi', idMateri);
    
    if (nilaError) throw nilaError;
    
    // Kemudian hapus materi
    const { error } = await supabase
      .from('materi')
      .delete()
      .eq('id_materi', idMateri);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting materi with id ${idMateri}:`, error);
    throw error;
  }
};

// Mendapatkan nama pembuat materi
export const getNamaPembuatMateri = async (idMateri) => {
  try {
    const { data, error } = await supabase
      .rpc('get_nama_pembuat_materi', { p_id_materi: idMateri });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting creator name for materi ${idMateri}:`, error);
    throw error;
  }
};

// Mendapatkan materi dengan filter (untuk pencarian)
export const searchMateri = async (query) => {
  try {
    const { data, error } = await supabase
      .from('materi_dengan_pembuat')
      .select('*')
      .or(`nama_materi.ilike.%${query}%,kategori.ilike.%${query}%`);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error searching materi with query "${query}":`, error);
    throw error;
  }
}; 