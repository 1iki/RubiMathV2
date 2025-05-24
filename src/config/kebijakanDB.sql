-- ========================
-- KEBIJAKAN DATABASE
-- ========================
-- 1. Perbaikan Foreign Key pada tabel materi
-- ========================
ALTER TABLE materi ADD CONSTRAINT fk_materi_admin 
    FOREIGN KEY (id_pembuat) REFERENCES admin(id_admin) 
    DEFERRABLE INITIALLY DEFERRED;
    
ALTER TABLE materi ADD CONSTRAINT fk_materi_guru 
    FOREIGN KEY (id_pembuat) REFERENCES guru(id_guru) 
    DEFERRABLE INITIALLY DEFERRED;
    
-- Tambahkan trigger untuk memvalidasi tipe_pembuat dan id_pembuat sesuai
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

CREATE TRIGGER trg_validate_materi_pembuat
BEFORE INSERT OR UPDATE ON materi
FOR EACH ROW EXECUTE FUNCTION validate_materi_pembuat();

-- ========================
-- 2. Menambahkan delete behavior pada foreign key
-- ========================
-- Contoh untuk tabel siswa referensi ke kelas
ALTER TABLE siswa DROP CONSTRAINT IF EXISTS siswa_id_kelas_fkey;
ALTER TABLE siswa ADD CONSTRAINT siswa_id_kelas_fkey 
    FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE siswa DROP CONSTRAINT IF EXISTS siswa_id_wali_fkey;
ALTER TABLE siswa ADD CONSTRAINT siswa_id_wali_fkey 
    FOREIGN KEY (id_wali) REFERENCES wali(id_wali) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE nilai DROP CONSTRAINT IF EXISTS nilai_id_siswa_fkey;
ALTER TABLE nilai ADD CONSTRAINT nilai_id_siswa_fkey 
    FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE kemajuan DROP CONSTRAINT IF EXISTS kemajuan_id_siswa_fkey;
ALTER TABLE kemajuan ADD CONSTRAINT kemajuan_id_siswa_fkey 
    FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================
-- 3. Menambahkan check constraint untuk validasi data
-- ========================
ALTER TABLE nilai ADD CONSTRAINT chk_nilai_range CHECK (nilai >= 0 AND nilai <= 100);

ALTER TABLE guru ADD CONSTRAINT chk_guru_no_telp CHECK (no_telp ~ '^[0-9+\-\s]{8,20}$');
ALTER TABLE wali ADD CONSTRAINT chk_wali_no_telp CHECK (no_telp ~ '^[0-9+\-\s]{8,20}$');

-- ========================
-- 4. Perbaikan aspek keamanan
-- ========================
-- Migrasi password ke hash (contoh menggunakan pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Membuat kolom password_hash baru untuk migrasi
ALTER TABLE admin ADD COLUMN password_hash TEXT;
ALTER TABLE guru ADD COLUMN password_hash TEXT;
ALTER TABLE wali ADD COLUMN password_hash TEXT;

-- Update password ke hash
UPDATE admin SET password_hash = crypt(password, gen_salt('bf'));
UPDATE guru SET password_hash = crypt(password, gen_salt('bf'));
UPDATE wali SET password_hash = crypt(password, gen_salt('bf'));

-- Hapus kolom password lama setelah semua diupdate
ALTER TABLE admin DROP COLUMN password;
ALTER TABLE guru DROP COLUMN password;
ALTER TABLE wali DROP COLUMN password;

-- Rename kolom password_hash menjadi password
ALTER TABLE admin RENAME COLUMN password_hash TO password;
ALTER TABLE guru RENAME COLUMN password_hash TO password;
ALTER TABLE wali RENAME COLUMN password_hash TO password;

-- Membuat RLS Policy untuk tabel admin (contoh)
CREATE POLICY admin_self_access ON admin
    USING (auth_user_id = current_setting('app.current_user_id', true)::uuid);
    
CREATE POLICY superadmin_all_access ON admin
    USING (EXISTS (
        SELECT 1 FROM admin 
        WHERE auth_user_id = current_setting('app.current_user_id', true)::uuid 
        AND tipe_admin = 'superadmin'
    ));

-- ========================
-- 5. Menambahkan trigger untuk updated_at
-- ========================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_guru_timestamp
BEFORE UPDATE ON guru
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_update_siswa_timestamp
BEFORE UPDATE ON siswa
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_update_wali_timestamp
BEFORE UPDATE ON wali
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ========================
-- 6. Menambahkan indeks pada kolom yang sering dilakukan pencarian
-- ========================
CREATE INDEX IF NOT EXISTS idx_siswa_nama ON siswa(nama);
CREATE INDEX IF NOT EXISTS idx_siswa_nis ON siswa(nis);
CREATE INDEX IF NOT EXISTS idx_guru_nama ON guru(nama);
CREATE INDEX IF NOT EXISTS idx_guru_nuptk ON guru(nuptk);
CREATE INDEX IF NOT EXISTS idx_materi_nama ON materi(nama_materi);
CREATE INDEX IF NOT EXISTS idx_auth_user_id ON admin(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_guru_auth_user_id ON guru(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_wali_auth_user_id ON wali(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_siswa_auth_user_id ON siswa(auth_user_id);

-- ========================
-- 7. Tambahkan log table untuk audit trail
-- ========================
CREATE TABLE log_aktivitas (
    id_log SERIAL PRIMARY KEY,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    jenis_operasi VARCHAR(10), -- INSERT, UPDATE, DELETE
    tabel_operasi VARCHAR(50),
    id_record INTEGER,
    deskripsi TEXT,
    user_id UUID
);

CREATE INDEX idx_log_waktu ON log_aktivitas(waktu);
CREATE INDEX idx_log_user ON log_aktivitas(user_id);

-- Contoh trigger untuk audit trail pada tabel siswa
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

CREATE TRIGGER trg_log_siswa_changes
AFTER INSERT OR UPDATE OR DELETE ON siswa
FOR EACH ROW EXECUTE FUNCTION log_siswa_changes();

-- ========================
-- 8. Membuat stored procedure untuk operasi umum
-- ========================
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

-- ========================
-- 9. Function untuk menghitung rata-rata nilai siswa
-- ========================
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

-- ========================
-- 10. Function untuk mencari siswa berdasarkan nama
-- ========================
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