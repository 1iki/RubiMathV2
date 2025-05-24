-- ========================
-- SCRIPT UNTUK MEMBERSIHKAN DATABASE SUPABASE
-- ========================
-- PERHATIAN: Script ini akan menghapus SEMUA tabel, fungsi, tipe data, dll.
-- Pastikan Anda memiliki backup jika data perlu disimpan!
-- ========================

-- Matikan notifikasi pesan informasi
SET client_min_messages TO WARNING;

-- Cara yang aman untuk menghapus semua objek database di Supabase
-- Pendekatan ini tidak mencoba menonaktifkan sistem trigger yang menyebabkan error permission

-- 1. Hapus semua views terlebih dahulu (karena mungkin bergantung pada tabel)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.table_name) || ' CASCADE;';
    END LOOP;
END $$;

-- 2. Hapus materialized views jika ada
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT matviewname FROM pg_matviews WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.' || quote_ident(r.matviewname) || ' CASCADE;';
    END LOOP;
END $$;

-- 3. Hapus semua tables sekaligus dengan CASCADE
-- CASCADE akan secara otomatis menghapus constraints, indexes, dan triggers terkait
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
END $$;

-- 4. Hapus semua sequences (yang tidak terhapus otomatis dengan tabel)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') 
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE;';
    END LOOP;
END $$;

-- 5. Hapus semua functions/procedures
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT routine_name, routine_type 
              FROM information_schema.routines 
              WHERE routine_schema = 'public') 
    LOOP
        IF r.routine_type = 'FUNCTION' THEN
            EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE;';
        ELSIF r.routine_type = 'PROCEDURE' THEN
            EXECUTE 'DROP PROCEDURE IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE;';
        END IF;
    END LOOP;
END $$;

-- 6. Hapus semua user-defined types (enums, composites, dll)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Hanya mencoba hapus tipe yang dibuat user
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.typtype IN ('e', 'c') -- enum dan composite types
        AND NOT EXISTS (
            SELECT 1 FROM pg_depend d
            WHERE d.objid = t.oid
            AND d.deptype = 'i' -- internal dependency
        )
    ) 
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE;';
    END LOOP;
END $$;

-- 7. Coba hapus kembali semua tipe data yang tersisa
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT t.typname 
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.typtype NOT IN ('b')  -- bukan base type
    ) 
    LOOP
        BEGIN
            EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE;';
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors
        END;
    END LOOP;
END $$;

-- 8. Coba hapus semua domain types jika ada
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT domain_name FROM information_schema.domains WHERE domain_schema = 'public')
    LOOP
        BEGIN
            EXECUTE 'DROP DOMAIN IF EXISTS public.' || quote_ident(r.domain_name) || ' CASCADE;';
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors
        END;
    END LOOP;
END $$;