// Data dummy untuk aplikasi dalam mode offline
// Saat Supabase tidak bisa terhubung, aplikasi akan menggunakan data ini

// Data siswa dari skema database
export const dummySiswa = [
  {
    id_siswa: 1,
    nis: "2023001",
    nama: "Rudi Hartono",
    id_kelas: 1,
    tanggal_lahir: "2012-03-14",
    alamat: "Jl. Cemara No.8",
    id_role: 4,
  },
  {
    id_siswa: 2,
    nis: "2023002",
    nama: "Nisa Kurnia",
    id_kelas: 2,
    tanggal_lahir: "2012-06-21",
    alamat: "Jl. Melati No.9",
    id_role: 4,
  },
  {
    id_siswa: 3,
    nis: "123131",
    nama: "Fachri Aditya Rizky",
    id_kelas: 1,
    alamat: "sdfscds",
    id_role: 4,
  },
];

// Data guru dari skema database
export const dummyGuru = [
  {
    id_guru: 1,
    nuptk: "198401232005011001",
    nama: "Ahmad Fauzi",
    no_telp: "081234567890",
    alamat: "Jl. Pendidikan No.1",
    id_role: 2,
  },
  {
    id_guru: 2,
    nuptk: "197905152003021002",
    nama: "Lilis Kusuma",
    no_telp: "082134567891",
    alamat: "Jl. Merdeka No.2",
    id_role: 2,
  },
];

// Data kelas
export const dummyKelas = [
  {
    id_kelas: 1,
    nama_kelas: "5A",
    id_guru: 1,
  },
  {
    id_kelas: 2,
    nama_kelas: "5B",
    id_guru: 2,
  },
];

// Data materi
export const dummyMateri = [
  {
    id_materi: 1,
    nama_materi: "Penjumlahan dan Pengurangan",
    kategori: "Bilangan 1-10000",
    tipe_pembuat: "guru",
    id_pembuat: 1,
  },
  {
    id_materi: 2,
    nama_materi: "Membaca Cerita Pendek",
    kategori: "Membaca bilangan",
    tipe_pembuat: "admin",
    id_pembuat: 2,
  },
  {
    id_materi: 3,
    nama_materi: "Lingkungan Sekitar",
    kategori: "Menghitung bilangan",
    tipe_pembuat: "guru",
    id_pembuat: 2,
  },
];

// Kredensial statis - disesuaikan dengan data admin di database
export const staticCredentials = {
  admin: [
    {
      username: "budi.setiawan",
      password: "admin123",
      type: "superadmin",
      nama: "Budi Setiawan",
    },
    {
      username: "siti.aminah",
      password: "pass1234",
      type: "admin_sekolah",
      nama: "Siti Aminah",
    },
    {
      username: "dodi.pratama",
      password: "pass1234",
      type: "admin_dev",
      nama: "Dodi Pratama",
    },
  ],
  guru: { username: "guru", password: "guru123" },
  ortu: { username: "ortu", password: "ortu123" },
};
