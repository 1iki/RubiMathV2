import supabase from '../config/supabase';

// Mengambil semua nilai dengan data materi
export const getAllNilai = async () => {
  try {
    const { data, error } = await supabase
      .from('nilai')
      .select(`
        id_nilai,
        nilai,
        tanggal,
        siswa:id_siswa (id_siswa, nama, nis),
        materi:id_materi (id_materi, nama_materi, kategori)
      `);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching nilai:', error);
    throw error;
  }
};

// Mengambil nilai untuk siswa tertentu
export const getNilaiSiswa = async (idSiswa) => {
  try {
    const { data, error } = await supabase
      .from('nilai')
      .select(`
        id_nilai,
        nilai,
        tanggal,
        materi:id_materi (id_materi, nama_materi, kategori)
      `)
      .eq('id_siswa', idSiswa);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching nilai for siswa ${idSiswa}:`, error);
    throw error;
  }
};

// Mengambil nilai untuk materi tertentu
export const getNilaiMateri = async (idMateri) => {
  try {
    const { data, error } = await supabase
      .from('nilai')
      .select(`
        id_nilai,
        nilai,
        tanggal,
        siswa:id_siswa (id_siswa, nama, nis)
      `)
      .eq('id_materi', idMateri);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching nilai for materi ${idMateri}:`, error);
    throw error;
  }
};

// Menambahkan nilai baru
export const addNilai = async (idSiswa, idMateri, nilai) => {
  try {
    const { data, error } = await supabase
      .from('nilai')
      .insert([
        { id_siswa: idSiswa, id_materi: idMateri, nilai }
      ])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding nilai:', error);
    throw error;
  }
};

// Update nilai yang sudah ada
export const updateNilai = async (idNilai, nilai) => {
  try {
    const { data, error } = await supabase
      .from('nilai')
      .update({ nilai })
      .eq('id_nilai', idNilai)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`Error updating nilai ${idNilai}:`, error);
    throw error;
  }
};

// Menghapus nilai
export const deleteNilai = async (idNilai) => {
  try {
    const { data, error } = await supabase
      .from('nilai')
      .delete()
      .eq('id_nilai', idNilai);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting nilai ${idNilai}:`, error);
    throw error;
  }
};

// Mendapatkan rata-rata nilai siswa
export const getRataNilaiSiswa = async (idSiswa) => {
  try {
    const { data, error } = await supabase
      .rpc('hitung_rata_nilai_siswa', { p_id_siswa: idSiswa });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error calculating average for siswa ${idSiswa}:`, error);
    throw error;
  }
};

// Simpan hasil kuis siswa
export const saveQuizResult = async (idSiswa, idMateri, nilai) => {
  try {
    // Periksa apakah sudah ada nilai untuk siswa dan materi ini
    const { data: existingData, error: checkError } = await supabase
      .from('nilai')
      .select('id_nilai, nilai')
      .eq('id_siswa', idSiswa)
      .eq('id_materi', idMateri)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Jika sudah ada dan nilai baru lebih tinggi, update
    if (existingData) {
      if (nilai > existingData.nilai) {
        const { data, error } = await supabase
          .from('nilai')
          .update({ nilai })
          .eq('id_nilai', existingData.id_nilai)
          .select();
        
        if (error) throw error;
        return { data: data[0], isNewHighScore: true };
      }
      return { data: existingData, isNewHighScore: false };
    } 
    // Jika belum ada, buat baru
    else {
      const { data, error } = await supabase
        .from('nilai')
        .insert([
          { id_siswa: idSiswa, id_materi: idMateri, nilai }
        ])
        .select();
      
      if (error) throw error;
      return { data: data[0], isNewHighScore: true };
    }
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

// Mengambil data riwayat belajar siswa
export const getRiwayatSiswa = async (idSiswa) => {
  try {
    const { data, error } = await supabase
      .from('riwayat_siswa')
      .select(`
        id_riwayat,
        id_siswa,
        id_materi,
        kategori,
        nilai,
        waktu_pengerjaan,
        durasi_pengerjaan,
        jumlah_benar,
        jumlah_salah,
        level_kesulitan,
        selesai,
        keterangan,
        materi:id_materi (id_materi, nama_materi)
      `)
      .eq('id_siswa', idSiswa)
      .order('waktu_pengerjaan', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching riwayat for siswa ${idSiswa}:`, error);
    throw error;
  }
};

// Generate dummy history data for testing
export const getDummyHistoryData = async (studentId) => {
  // Sample materi data
  const materiList = [
    { id_materi: 101, nama_materi: "Penjumlahan 1-50", kategori: "Bilangan" },
    { id_materi: 102, nama_materi: "Pengurangan 1-50", kategori: "Bilangan" },
    { id_materi: 103, nama_materi: "Perkalian Dasar", kategori: "Bilangan" },
    { id_materi: 104, nama_materi: "Pembagian Dasar", kategori: "Bilangan" },
    { id_materi: 105, nama_materi: "Bangun Datar", kategori: "Geometri" },
    { id_materi: 106, nama_materi: "Bangun Ruang", kategori: "Geometri" },
    { id_materi: 107, nama_materi: "Satuan Panjang", kategori: "Pengukuran" },
    { id_materi: 108, nama_materi: "Satuan Berat", kategori: "Pengukuran" },
    { id_materi: 109, nama_materi: "Satuan Waktu", kategori: "Pengukuran" },
    { id_materi: 110, nama_materi: "Pecahan", kategori: "Bilangan Pecahan" },
  ];

  // Generate between 5-10 random history items
  const historyCount = Math.floor(Math.random() * 6) + 5; 
  const dummyHistory = [];
  
  // Generate dates in the past 3 months
  const today = new Date();
  
  for (let i = 0; i < historyCount; i++) {
    // Random date within the last 90 days
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);
    date.setDate(date.getDate() - randomDaysAgo);
    
    // Random materi
    const randomMateri = materiList[Math.floor(Math.random() * materiList.length)];
    
    // Random score between 0-100
    const score = Math.floor(Math.random() * 101);
    
    dummyHistory.push({
      id_nilai: i + 1000,
      id_siswa: studentId,
      id_materi: randomMateri.id_materi,
      nilai: score,
      tanggal: date.toISOString().split('T')[0],
      materi: randomMateri
    });
  }
  
  // Sort by date, most recent first
  dummyHistory.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return dummyHistory;
};