-- ====================================================================
-- SCRIPT DATABASE PENDIDIKAN UNTUK SUPABASE
-- ====================================================================
-- Script ini mencakup pembuatan skema database lengkap untuk
-- sistem manajemen pendidikan dengan fitur-fitur:
-- - Manajemen admin, guru, wali, dan siswa
-- - Manajemen kelas dan materi pembelajaran
-- - Pencatatan nilai dan kemajuan siswa
-- - Keamanan dan optimasi database
-- ====================================================================

-- ====================================================================
-- BAGIAN 1: CLEANUP - MENGHAPUS OBJEK YANG SUDAH ADA
-- ====================================================================
-- DO $$
-- BEGIN
--     -- Hapus semua trigger terlebih dahulu
--     DROP TRIGGER IF EXISTS trg_update_guru_timestamp ON guru;
--     DROP TRIGGER IF EXISTS trg_update_siswa_timestamp ON siswa;
--     DROP TRIGGER IF EXISTS trg_update_wali_timestamp ON wali;
--     DROP TRIGGER IF EXISTS trg_validate_materi_pembuat ON materi;
--     DROP TRIGGER IF EXISTS trg_log_siswa_changes ON siswa;
    
--     -- Hapus semua tabel
--     DROP TABLE IF EXISTS log_aktivitas CASCADE;
--     DROP TABLE IF EXISTS nilai CASCADE;
--     DROP TABLE IF EXISTS kemajuan CASCADE;
--     DROP TABLE IF EXISTS siswa_catatan CASCADE;
--     DROP TABLE IF EXISTS catatan CASCADE;
--     DROP TABLE IF EXISTS materi CASCADE;
--     DROP TABLE IF EXISTS siswa CASCADE;
--     DROP TABLE IF EXISTS kelas CASCADE;
--     DROP TABLE IF EXISTS wali CASCADE;
--     DROP TABLE IF EXISTS guru CASCADE;
--     DROP TABLE IF EXISTS admin CASCADE;
--     DROP TABLE IF EXISTS role CASCADE;
    
--     -- Hapus semua fungsi
--     DROP FUNCTION IF EXISTS validate_materi_pembuat() CASCADE;
--     DROP FUNCTION IF EXISTS update_modified_column() CASCADE;
--     DROP FUNCTION IF EXISTS log_siswa_changes() CASCADE;
--     DROP FUNCTION IF EXISTS get_nama_pembuat_materi(INTEGER) CASCADE;
--     DROP FUNCTION IF EXISTS hitung_rata_nilai_siswa(INTEGER) CASCADE;
--     DROP FUNCTION IF EXISTS cari_siswa(TEXT) CASCADE;
    
--     -- Hapus semua view
--     DROP VIEW IF EXISTS materi_dengan_pembuat CASCADE;
    
--     -- Hapus prosedur
--     DROP PROCEDURE IF EXISTS tambah_siswa(VARCHAR, TEXT, DATE, TEXT, INTEGER, INTEGER, UUID) CASCADE;
    
--     -- Hapus tipe
--     DROP TYPE IF EXISTS admin_type CASCADE;
--     DROP TYPE IF EXISTS pembuat_type CASCADE;
    
--     -- Pastikan extension pgcrypto tersedia
--     CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- END$$;

-- ====================================================================
-- BAGIAN 2: DEFINISI TIPE DATA & ENUM
-- ====================================================================

-- Tipe admin: superadmin, admin_sekolah, admin_dev
CREATE TYPE admin_type AS ENUM ('superadmin', 'admin_sekolah', 'admin_dev');

-- Tipe pembuat materi: admin atau guru
CREATE TYPE pembuat_type AS ENUM ('admin', 'guru');

-- ====================================================================
-- BAGIAN 3: PEMBUATAN TABEL
-- ====================================================================

-- 1. Tabel Role
CREATE TABLE role (
    id_role SERIAL PRIMARY KEY,
    level VARCHAR(50) NOT NULL
);

-- 2. Tabel Admin
CREATE TABLE admin (
    id_admin SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    tipe_admin admin_type NOT NULL,
    auth_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password TEXT
);

-- 3. Tabel Guru
CREATE TABLE guru (
    id_guru SERIAL PRIMARY KEY,
    nuptk VARCHAR(50) NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    no_telp VARCHAR(20),
    alamat TEXT,
    id_role INTEGER REFERENCES role(id_role),
    auth_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password TEXT,
    kelas INTEGER,
    CONSTRAINT chk_guru_no_telp CHECK (no_telp ~ '^[0-9+\-\s]{8,20}$')
);

-- 4. Tabel wali
CREATE TABLE wali (
    id_wali SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    alamat TEXT,
    no_telp VARCHAR(20),
    id_role INTEGER REFERENCES role(id_role),
    auth_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password TEXT,
    CONSTRAINT chk_wali_no_telp CHECK (no_telp ~ '^[0-9+\-\s]{8,20}$')
);

-- 5. Tabel Kelas
CREATE TABLE kelas (
    id_kelas SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    id_guru INTEGER REFERENCES guru(id_guru),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Siswa
CREATE TABLE siswa (
    id_siswa SERIAL PRIMARY KEY,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    tanggal_lahir DATE,
    alamat TEXT,
    id_kelas INTEGER,
    id_wali INTEGER,
    id_role INTEGER REFERENCES role(id_role),
    auth_user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar TEXT
);

-- 7. Tabel Materi
CREATE TABLE materi (
    id_materi SERIAL PRIMARY KEY,
    nama_materi TEXT NOT NULL,
    kategori TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_video TEXT,
    tipe_pembuat pembuat_type,
    id_pembuat INTEGER
);

-- 8. Tabel Catatan
CREATE TABLE catatan (
    id_catatan SERIAL PRIMARY KEY,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_guru INTEGER REFERENCES guru(id_guru),
    id_wali INTEGER REFERENCES wali(id_wali),
    catatan TEXT
);

-- 9. Tabel Relasi Siswa - Catatan
CREATE TABLE siswa_catatan (
    id SERIAL PRIMARY KEY,
    id_siswa INTEGER REFERENCES siswa(id_siswa),
    id_catatan INTEGER REFERENCES catatan(id_catatan)
);

-- 10. Tabel Nilai
CREATE TABLE nilai (
    id_nilai SERIAL PRIMARY KEY,
    id_siswa INTEGER,
    id_materi INTEGER REFERENCES materi(id_materi),
    nilai FLOAT,
    tanggal DATE DEFAULT CURRENT_DATE,
    CONSTRAINT chk_nilai_range CHECK (nilai >= 0 AND nilai <= 100)
);

-- 11. Tabel Kemajuan
CREATE TABLE kemajuan (
    id_kemajuan SERIAL PRIMARY KEY,
    id_siswa INTEGER,
    tanggal DATE DEFAULT CURRENT_DATE,
    deskripsi TEXT
);

-- 12. Tabel Log Aktivitas untuk Audit Trail
CREATE TABLE log_aktivitas (
    id_log SERIAL PRIMARY KEY,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    jenis_operasi VARCHAR(10), -- INSERT, UPDATE, DELETE
    tabel_operasi VARCHAR(50),
    id_record INTEGER,
    deskripsi TEXT,
    user_id UUID
);

-- ====================================================================
-- BAGIAN 4: RELASI & CONSTRAINT
-- ====================================================================

-- Relasi Siswa dengan Kelas dan wali
ALTER TABLE siswa 
    ADD CONSTRAINT siswa_id_kelas_fkey 
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE siswa 
    ADD CONSTRAINT siswa_id_wali_fkey 
    FOREIGN KEY (id_wali) REFERENCES wali(id_wali) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Relasi Nilai dengan Siswa
ALTER TABLE nilai 
    ADD CONSTRAINT nilai_id_siswa_fkey 
    FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Relasi Kemajuan dengan Siswa
ALTER TABLE kemajuan 
    ADD CONSTRAINT kemajuan_id_siswa_fkey 
    FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Relasi dan Validasi untuk Materi
ALTER TABLE materi 
    ADD CONSTRAINT fk_materi_admin 
    FOREIGN KEY (id_pembuat) REFERENCES admin(id_admin) 
    DEFERRABLE INITIALLY DEFERRED;
    
ALTER TABLE materi 
    ADD CONSTRAINT fk_materi_guru 
    FOREIGN KEY (id_pembuat) REFERENCES guru(id_guru) 
    DEFERRABLE INITIALLY DEFERRED;

-- ====================================================================
-- BAGIAN 5: FUNGSI & TRIGGER
-- ====================================================================

-- Fungsi validasi pembuat materi
CREATE OR REPLACE FUNCTION validate_materi_pembuat()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipe_pembuat = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM admin WHERE id_admin = NEW.id_pembuat) THEN
            RAISE EXCEPTION 'id_pembuat tidak ditemukan di tabel admin';
        END IF;
    ELSIF NEW.tipe_pembuat = 'guru' THEN
        IF NOT EXISTS (SELECT 1 FROM guru WHERE id_guru = NEW.id_pembuat) THEN
            RAISE EXCEPTION 'id_pembuat tidak ditemukan di tabel guru';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk validasi pembuat materi
CREATE TRIGGER trg_validate_materi_pembuat
BEFORE INSERT OR UPDATE ON materi
FOR EACH ROW EXECUTE FUNCTION validate_materi_pembuat();

-- Fungsi untuk update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update timestamp
CREATE TRIGGER trg_update_guru_timestamp
BEFORE UPDATE ON guru
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_update_siswa_timestamp
BEFORE UPDATE ON siswa
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_update_wali_timestamp
BEFORE UPDATE ON wali
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Fungsi untuk audit trail
CREATE OR REPLACE FUNCTION log_siswa_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO log_aktivitas(jenis_operasi, tabel_operasi, id_record, deskripsi, user_id)
        VALUES('INSERT', 'siswa', NEW.id_siswa, 'Tambah siswa: ' || NEW.nama, 
               current_setting('app.current_user_id', true)::uuid);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO log_aktivitas(jenis_operasi, tabel_operasi, id_record, deskripsi, user_id)
        VALUES('UPDATE', 'siswa', NEW.id_siswa, 'Update siswa: ' || NEW.nama, 
               current_setting('app.current_user_id', true)::uuid);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO log_aktivitas(jenis_operasi, tabel_operasi, id_record, deskripsi, user_id)
        VALUES('DELETE', 'siswa', OLD.id_siswa, 'Hapus siswa: ' || OLD.nama, 
               current_setting('app.current_user_id', true)::uuid);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk audit trail
CREATE TRIGGER trg_log_siswa_changes
AFTER INSERT OR UPDATE OR DELETE ON siswa
FOR EACH ROW EXECUTE FUNCTION log_siswa_changes();

-- ====================================================================
-- BAGIAN 6: VIEW & FUNGSI HELPER
-- ====================================================================

-- View untuk materi dengan informasi pembuat
CREATE OR REPLACE VIEW materi_dengan_pembuat AS
SELECT 
    m.id_materi,
    m.nama_materi,
    m.kategori,
    m.url_video,
    m.created_at,
    CASE 
        WHEN m.tipe_pembuat = 'admin' THEN a.nama
        WHEN m.tipe_pembuat = 'guru' THEN g.nama
        ELSE NULL
    END AS nama_pembuat,
    m.tipe_pembuat
FROM 
    materi m
LEFT JOIN 
    admin a ON m.tipe_pembuat = 'admin' AND m.id_pembuat = a.id_admin
LEFT JOIN 
    guru g ON m.tipe_pembuat = 'guru' AND m.id_pembuat = g.id_guru;

-- Fungsi untuk mendapatkan nama pembuat materi
CREATE OR REPLACE FUNCTION get_nama_pembuat_materi(p_id_materi INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipe_pembuat pembuat_type;
    v_id_pembuat INTEGER;
    v_nama TEXT;
BEGIN
    -- Get the creator type and ID
    SELECT tipe_pembuat, id_pembuat INTO v_tipe_pembuat, v_id_pembuat
    FROM materi
    WHERE id_materi = p_id_materi;
    
    -- If no record found
    IF v_tipe_pembuat IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get name based on creator type
    IF v_tipe_pembuat = 'admin' THEN
        SELECT nama INTO v_nama FROM admin WHERE id_admin = v_id_pembuat;
    ELSIF v_tipe_pembuat = 'guru' THEN
        SELECT nama INTO v_nama FROM guru WHERE id_guru = v_id_pembuat;
    END IF;
    
    RETURN v_nama;
END;
$$;

-- Fungsi untuk menghitung rata-rata nilai siswa
CREATE OR REPLACE FUNCTION hitung_rata_nilai_siswa(p_id_siswa INTEGER)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
DECLARE
    v_rata_rata FLOAT;
BEGIN
    SELECT AVG(nilai) INTO v_rata_rata
    FROM nilai
    WHERE id_siswa = p_id_siswa;
    
    RETURN v_rata_rata;
END;
$$;

-- Fungsi untuk mencari siswa berdasarkan nama
CREATE OR REPLACE FUNCTION cari_siswa(p_nama TEXT)
RETURNS TABLE (
    id_siswa INTEGER,
    nis VARCHAR(20),
    nama TEXT,
    nama_kelas VARCHAR(50),
    nama_wali TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id_siswa, 
        s.nis, 
        s.nama, 
        k.nama_kelas,
        o.nama AS nama_wali
    FROM 
        siswa s
    LEFT JOIN 
        kelas k ON s.id_kelas = k.id_kelas
    LEFT JOIN 
        wali o ON s.id_wali = o.id_wali
    WHERE 
        s.nama ILIKE '%' || p_nama || '%';
END;
$$;

-- Stored procedure untuk menambah siswa
CREATE OR REPLACE PROCEDURE tambah_siswa(
    p_nis VARCHAR(20),
    p_nama TEXT,
    p_tanggal_lahir DATE,
    p_alamat TEXT,
    p_id_kelas INTEGER,
    p_id_wali INTEGER,
    p_auth_user_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO siswa (nis, nama, tanggal_lahir, alamat, id_kelas, id_wali, id_role, auth_user_id)
    VALUES (p_nis, p_nama, p_tanggal_lahir, p_alamat, p_id_kelas, p_id_wali, 4, p_auth_user_id);
    
    COMMIT;
END;
$$;

-- ====================================================================
-- BAGIAN 7: INDEXING UNTUK OPTIMASI
-- ====================================================================

-- Indeks untuk optimasi query
CREATE INDEX idx_siswa_kelas ON siswa(id_kelas);
CREATE INDEX idx_catatan_guru ON catatan(id_guru);
CREATE INDEX idx_catatan_wali ON catatan(id_wali);
CREATE INDEX idx_nilai_siswa ON nilai(id_siswa);
CREATE INDEX idx_kemajuan_siswa ON kemajuan(id_siswa);
CREATE INDEX idx_siswa_nama ON siswa(nama);
CREATE INDEX idx_siswa_nis ON siswa(nis);
CREATE INDEX idx_guru_nama ON guru(nama);
CREATE INDEX idx_guru_nuptk ON guru(nuptk);
CREATE INDEX idx_materi_nama ON materi(nama_materi);
CREATE INDEX idx_auth_user_id ON admin(auth_user_id);
CREATE INDEX idx_guru_auth_user_id ON guru(auth_user_id);
CREATE INDEX idx_wali_auth_user_id ON wali(auth_user_id);
CREATE INDEX idx_siswa_auth_user_id ON siswa(auth_user_id);
CREATE INDEX idx_log_waktu ON log_aktivitas(waktu);
CREATE INDEX idx_log_user ON log_aktivitas(user_id);

-- ====================================================================
-- BAGIAN 8: KEAMANAN
-- ====================================================================

-- Aktivasi Row Level Security
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa_catatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kemajuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nilai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Contoh RLS Policy
CREATE POLICY admin_self_access ON admin
    USING (auth_user_id = current_setting('app.current_user_id', true)::uuid);
    
CREATE POLICY superadmin_all_access ON admin
    USING (EXISTS (
        SELECT 1 FROM admin 
        WHERE auth_user_id = current_setting('app.current_user_id', true)::uuid 
        AND tipe_admin = 'superadmin'
    ));

-- ====================================================================
-- BAGIAN 9: DATA DUMMY
-- ====================================================================

-- Migrasi password ke format hash (untuk data dummy)
-- Menambahkan kolom sementara
ALTER TABLE admin ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE guru ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE wali ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Role
INSERT INTO role (id_role, level) VALUES 
  (1, 'admin'),
  (2, 'guru'),
  (3, 'wali'),
  (4, 'siswa');

-- Admin
INSERT INTO admin (id_admin, nama, tipe_admin, auth_user_id, created_at, password) VALUES 
  (1, 'Budi Setiawan', 'superadmin', '63c4d9ba-5d29-43cc-a8cf-4d2a42e6c2c7', '2025-05-14 07:08:02.998882', crypt('admin123', gen_salt('bf'))),
  (2, 'Siti Aminah', 'admin_sekolah', 'd7269097-c916-4087-b470-f0d07220e4e1', '2025-05-14 07:08:02.998882', crypt('pass1234', gen_salt('bf'))),
  (3, 'Dodi Pratama', 'admin_dev', '5cfed7b1-6af9-4d12-8870-d1c323a7fae9', '2025-05-14 07:08:02.998882', crypt('pass1234', gen_salt('bf')));

-- Reset sequence untuk admin
SELECT setval('admin_id_admin_seq', (SELECT MAX(id_admin) FROM admin));

-- Guru
INSERT INTO guru (id_guru, nuptk, nama, no_telp, alamat, id_role, auth_user_id, created_at, updated_at, password) VALUES 
  (1, '198401232005011001', 'Ahmad Fauzi', '081234567890', 'Jl. Pendidikan No.1', 2, '370b2a16-71cf-4197-872c-a89293727a90', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', crypt('pass1234', gen_salt('bf'))),
  (2, '197905152003021002', 'Lilis Kusuma', '082134567891', 'Jl. Merdeka No.2', 2, '9e0cd5ea-e224-4306-997c-8152820dd0e2', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', crypt('pass1234', gen_salt('bf')));

-- Reset sequence untuk guru
SELECT setval('guru_id_guru_seq', (SELECT MAX(id_guru) FROM guru));

-- wali
INSERT INTO wali (id_wali, nama, alamat, no_telp, id_role, auth_user_id, created_at, updated_at, password) VALUES 
  (1, 'Hendra Wibowo', 'Jl. Dahlia No.5', '085234567892', 3, '30cc2629-4a3e-4ce4-b798-d33d3f6ea857', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', crypt('pass1234', gen_salt('bf'))),
  (2, 'Yuli Astuti', 'Jl. Anggrek No.10', '085634567893', 3, '781d55e4-75fa-423f-9e98-70c9d1ce0cdc', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', crypt('pass1234', gen_salt('bf')));

-- Reset sequence untuk wali
SELECT setval('wali_id_wali_seq', (SELECT MAX(id_wali) FROM wali));

-- Kelas
INSERT INTO kelas (id_kelas, nama_kelas, id_guru, created_at) VALUES 
  (1, '5A', 1, '2025-05-14 07:08:02.998882'),
  (2, '5B', 2, '2025-05-14 07:08:02.998882');

-- Reset sequence untuk kelas
SELECT setval('kelas_id_kelas_seq', (SELECT MAX(id_kelas) FROM kelas));

-- Siswa
INSERT INTO siswa (id_siswa, nis, nama, tanggal_lahir, alamat, id_kelas, id_wali, id_role, auth_user_id, created_at, updated_at) VALUES 
  (1, '2023001', 'Rudi Hartono', '2012-03-14', 'Jl. Cemara No.8', 1, 1, 4, '5eb535e3-46a4-4114-bc14-4c2d3b1a352f', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882'),
  (2, '2023002', 'Nisa Kurnia', '2012-06-21', 'Jl. Melati No.9', 2, 2, 4, '72be137c-43a6-468c-a3b4-4f9a03019164', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882'),
  (3, '123131', 'Fachri Aditya Rizky', null, 'sdfscds', 1, null, 4, 'e7c02eb5-7b44-42d7-a3c0-cdae198e99f8', '2025-05-14 14:12:03.599214', '2025-05-14 14:12:03.599214');

-- Reset sequence untuk siswa
SELECT setval('siswa_id_siswa_seq', (SELECT MAX(id_siswa) FROM siswa));

-- Materi
INSERT INTO materi (id_materi, nama_materi, kategori, created_at, url_video, tipe_pembuat, id_pembuat) VALUES 
  (1, 'Penjumlahan dan Pengurangan', 'Bilangan 1-10000', '2025-05-14 13:28:27.230293', NULL, 'guru', 1),
  (2, 'Membaca Cerita Pendek', 'Membaca bilangan', '2025-05-14 13:28:27.230293', NULL, 'admin', 2),
  (3, 'Lingkungan Sekitar', 'Menghitung bilangan', '2025-05-14 13:28:27.230293', NULL, 'guru', 2);

-- Reset sequence untuk materi
SELECT setval('materi_id_materi_seq', (SELECT MAX(id_materi) FROM materi));

-- Catatan
INSERT INTO catatan (id_catatan, waktu, id_guru, id_wali, catatan) VALUES 
  (1, '2025-05-14 13:28:08.770526', 1, 1, 'Rudi kurang fokus di kelas, perlu perhatian lebih di rumah.'),
  (2, '2025-05-14 13:28:08.770526', 2, 2, 'Nisa menunjukkan peningkatan dalam membaca dan berhitung.');

-- Reset sequence untuk catatan
SELECT setval('catatan_id_catatan_seq', (SELECT MAX(id_catatan) FROM catatan));

-- Siswa-Catatan
INSERT INTO siswa_catatan (id, id_siswa, id_catatan) VALUES 
  (1, 1, 1),
  (2, 2, 2);

-- Reset sequence untuk siswa_catatan
SELECT setval('siswa_catatan_id_seq', (SELECT MAX(id) FROM siswa_catatan));

-- Nilai
INSERT INTO nilai (id_nilai, id_siswa, id_materi, nilai, tanggal) VALUES 
  (1, 1, 1, 75.5, '2025-05-10'),
  (2, 1, 2, 80.0, '2025-05-11'),
  (3, 2, 1, 90.0, '2025-05-10'),
  (4, 2, 3, 85.0, '2025-05-12');

-- Reset sequence untuk nilai
SELECT setval('nilai_id_nilai_seq', (SELECT MAX(id_nilai) FROM nilai));

-- Kemajuan
INSERT INTO kemajuan (id_kemajuan, id_siswa, tanggal, deskripsi) VALUES 
  (1, 1, '2025-05-13', 'Sudah mulai memahami konsep dasar penjumlahan.'),
  (2, 2, '2025-05-13', 'Bisa menjelaskan siklus air dengan bantuan gambar.');

-- Reset sequence untuk kemajuan
SELECT setval('kemajuan_id_kemajuan_seq', (SELECT MAX(id_kemajuan) FROM kemajuan));