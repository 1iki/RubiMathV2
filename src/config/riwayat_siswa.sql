-- SQL untuk membuat tabel riwayat_siswa
CREATE TABLE riwayat_siswa (
    id_riwayat SERIAL PRIMARY KEY,
    id_siswa INTEGER REFERENCES siswa(id_siswa) ON DELETE CASCADE,
    id_materi INTEGER REFERENCES materi(id_materi) ON DELETE SET NULL,
    kategori VARCHAR(50),
    nilai INTEGER,
    waktu_pengerjaan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- durasi_pengerjaan INTEGER, -- dalam detik
    jumlah_benar INTEGER,
    jumlah_salah INTEGER,
    level_kesulitan VARCHAR(20), -- 'mudah', 'sedang', 'sulit'
    selesai BOOLEAN DEFAULT TRUE,
    keterangan TEXT
);

-- Indeks untuk mempercepat query
CREATE INDEX idx_riwayat_siswa_id_siswa ON riwayat_siswa(id_siswa);
CREATE INDEX idx_riwayat_siswa_id_materi ON riwayat_siswa(id_materi);
CREATE INDEX idx_riwayat_siswa_waktu ON riwayat_siswa(waktu_pengerjaan);

-- Script untuk migrasi data dari tabel nilai ke riwayat_siswa (jika diperlukan)
INSERT INTO riwayat_siswa (id_siswa, id_materi, nilai, waktu_pengerjaan)
SELECT id_siswa, id_materi, nilai, tanggal
FROM nilai;

-- Contoh query untuk mendapatkan riwayat lengkap seorang siswa
SELECT r.*, m.nama_materi 
FROM riwayat_siswa r
JOIN materi m ON r.id_materi = m.id_materi
WHERE r.id_siswa = [ID_SISWA]
ORDER BY r.waktu_pengerjaan DESC;

-- Contoh query untuk mendapatkan statistik siswa per kategori
SELECT kategori, 
       COUNT(*) as jumlah_aktivitas,
       AVG(nilai) as rata_nilai, 
       SUM(jumlah_benar) as total_benar,
       SUM(jumlah_salah) as total_salah,
       MIN(waktu_pengerjaan) as tanggal_mulai,
       MAX(waktu_pengerjaan) as tanggal_terakhir
FROM riwayat_siswa
WHERE id_siswa = [ID_SISWA]
GROUP BY kategori
ORDER BY kategori;
