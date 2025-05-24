INSERT INTO "public"."admin" ("id_admin", "nama", "tipe_admin", "auth_user_id", "created_at", "password") VALUES ('1', 'Budi Setiawan', 'superadmin', '63c4d9ba-5d29-43cc-a8cf-4d2a42e6c2c7', '2025-05-14 07:08:02.998882', 'admin123'), ('2', 'Siti Aminah', 'admin_sekolah', 'd7269097-c916-4087-b470-f0d07220e4e1', '2025-05-14 07:08:02.998882', 'pass1234'), ('3', 'Dodi Pratama', 'admin_dev', '5cfed7b1-6af9-4d12-8870-d1c323a7fae9', '2025-05-14 07:08:02.998882', 'pass1234');

INSERT INTO "public"."guru" ("id_guru", "nuptk", "nama", "no_telp", "alamat", "id_role", "auth_user_id", "created_at", "updated_at", "password") VALUES ('1', '198401232005011001', 'Ahmad Fauzi', '081234567890', 'Jl. Pendidikan No.1', '2', '370b2a16-71cf-4197-872c-a89293727a90', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', 'pass1234'), ('2', '197905152003021002', 'Lilis Kusuma', '082134567891', 'Jl. Merdeka No.2', '2', '9e0cd5ea-e224-4306-997c-8152820dd0e2', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', 'pass1234');

INSERT INTO "public"."wali" ("id_wali", "nama", "alamat", "no_telp", "id_role", "auth_user_id", "created_at", "updated_at", "password") VALUES ('1', 'Hendra Wibowo', 'Jl. Dahlia No.5', '085234567892', '3', '30cc2629-4a3e-4ce4-b798-d33d3f6ea857', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', 'pass1234'), ('2', 'Yuli Astuti', 'Jl. Anggrek No.10', '085634567893', '3', '781d55e4-75fa-423f-9e98-70c9d1ce0cdc', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882', 'pass1234');

INSERT INTO "public"."siswa" ("id_siswa", "nis", "nama", "tanggal_lahir", "alamat", "id_kelas", "id_wali", "id_role", "auth_user_id", "created_at", "updated_at") VALUES ('1', '2023001', 'Rudi Hartono', '2012-03-14', 'Jl. Cemara No.8', '1', '1', '4', '5eb535e3-46a4-4114-bc14-4c2d3b1a352f', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882'), ('2', '2023002', 'Nisa Kurnia', '2012-06-21', 'Jl. Melati No.9', '2', '2', '4', '72be137c-43a6-468c-a3b4-4f9a03019164', '2025-05-14 07:08:02.998882', '2025-05-14 07:08:02.998882'), ('3', '123131', 'Fachri Aditya Rizky', null, 'sdfscds', '1', null, '4', 'e7c02eb5-7b44-42d7-a3c0-cdae198e99f8', '2025-05-14 14:12:03.599214', '2025-05-14 14:12:03.599214');

INSERT INTO "public"."role" ("id_role", "level") VALUES ('1', 'admin'), ('2', 'guru'), ('3', 'wali'), ('4', 'siswa');

INSERT INTO "public"."materi" ("id_materi", "nama_materi", "kategori", "created_at", "url_video", "dibuat_oleh") VALUES ('1', 'Penjumlahan dan Pengurangan', 'Bilangan 1-10000', '2025-05-14 13:28:27.230293', null, null), ('2', 'Membaca Cerita Pendek', 'Membaca bilangan', '2025-05-14 13:28:27.230293', null, null), ('3', 'Lingkungan Sekitar', 'Menghitung bilangan', '2025-05-14 13:28:27.230293', null, null);

INSERT INTO "public"."kelas" ("id_kelas", "nama_kelas", "id_guru", "created_at") VALUES ('1', '5A', '1', '2025-05-14 07:08:02.998882'), ('2', '5B', '2', '2025-05-14 07:08:02.998882');

INSERT INTO "public"."catatan" ("id_catatan", "waktu", "id_guru", "id_wali", "catatan") VALUES ('1', '2025-05-14 13:28:08.770526', '1', '1', 'Rudi kurang fokus di kelas, perlu perhatian lebih di rumah.'), ('2', '2025-05-14 13:28:08.770526', '2', '2', 'Nisa menunjukkan peningkatan dalam membaca dan berhitung.');

INSERT INTO "public"."kemajuan" ("id_kemajuan", "id_siswa", "tanggal", "deskripsi") VALUES ('1', '1', '2025-05-13', 'Sudah mulai memahami konsep dasar penjumlahan.'), ('2', '2', '2025-05-13', 'Bisa menjelaskan siklus air dengan bantuan gambar.');

INSERT INTO "public"."nilai" ("id_nilai", "id_siswa", "id_materi", "nilai", "tanggal") VALUES ('1', '1', '1', '75.5', '2025-05-10'), ('2', '1', '2', '80', '2025-05-11'), ('3', '2', '1', '90', '2025-05-10'), ('4', '2', '3', '85', '2025-05-12');

INSERT INTO "public"."siswa_catatan" ("id", "id_siswa", "id_catatan") VALUES ('1', '1', '1'), ('2', '2', '2');
