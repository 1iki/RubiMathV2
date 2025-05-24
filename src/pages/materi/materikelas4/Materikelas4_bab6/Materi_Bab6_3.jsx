import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../materistyle.css';
import logo from '../../../../assets/logo.png';

const Materi_Bab6_3 = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    // Pastikan body dan html dapat di-scroll
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    return () => {
      // Cleanup saat komponen unmount
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLatihan = () => {
    // Navigate to exercise page
    window.location.href = '/game/data-dan-pengukuran';
  };

  return (
    <>
      <header className="header-materiaddition">
        <Link to="/kelas4" className="header-logo">
          <img src={logo} alt="Math Fun" />
          <span>Math Fun</span>
        </Link>
        <div className="header-controls">
          <button
            className="header-icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="materi-container">
        <div className="materi-header">
          <Link to="/category4_bab6" className="back-buttonM">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor" />
            </svg>
            Kembali ke Bab 6
          </Link>
        </div>

        <div className="content-wrapper">
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/hrTMiLO3H_8?autoplay=1&mute=${isMuted ? 1 : 0}`}
              title="Belajar Diagram Batang"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <h1 className="materi-title">Diagram Batang</h1>

          <p className="materi-description">
            Diagram batang adalah cara untuk menampilkan data dengan menggunakan batang-batang yang tingginya
            menunjukkan nilai data. Diagram batang memudahkan kita untuk membandingkan data dengan cepat
            dan melihat perbedaan antara kelompok data.
          </p>

          <div className="watch-info">
            <div className="watch-time">
              <svg className="clock-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM8.5 4H7V9L11.25 11.15L12 9.92L8.5 8.25V4Z" fill="currentColor" />
              </svg>
              5:30 menit
            </div>


          </div>

          <div className="ringkasan-section">
            <h2 className="ringkasan-title">Ringkasan Materi</h2>
            <div className="konsep-pengurangan">
              <h3 className="konsep-title">Apa itu Diagram Batang?</h3>
              <p className="konsep-content">
                Diagram batang adalah cara untuk menampilkan data dengan menggunakan batang-batang yang
                tingginya sesuai dengan nilai data. Diagram batang sangat berguna untuk membandingkan data
                dari beberapa kelompok.
              </p>

              <h3 className="konsep-title">Bagian-Bagian Diagram Batang</h3>
              <p className="konsep-content">
                Diagram batang memiliki bagian-bagian penting:
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>1. Judul</strong><br />
                  Judul menjelaskan apa yang ditampilkan pada diagram.<br />
                  Contoh: "Buah Kesukaan Siswa Kelas 4"<br /><br />

                  <strong>2. Sumbu Mendatar (Sumbu X)</strong><br />
                  Menampilkan kategori atau kelompok data.<br />
                  Contoh: Jenis buah (Apel, Jeruk, Pisang, Mangga)<br /><br />

                  <strong>3. Sumbu Tegak (Sumbu Y)</strong><br />
                  Menampilkan nilai data dengan angka.<br />
                  Contoh: Jumlah siswa yang menyukai buah tersebut<br /><br />

                  <strong>4. Batang</strong><br />
                  Batang yang tingginya sesuai dengan nilai data.<br />
                </p>
              </div>

              <h3 className="konsep-title">Cara Membaca Diagram Batang</h3>
              <p className="konsep-content">
                Untuk membaca diagram batang, kamu perlu:
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>1.</strong> Perhatikan judulnya untuk mengetahui tentang apa diagram tersebut<br />
                  <strong>2.</strong> Lihat kategori apa yang ada di sumbu mendatar (X)<br />
                  <strong>3.</strong> Lihat nilai apa yang ditunjukkan pada sumbu tegak (Y)<br />
                  <strong>4.</strong> Perhatikan tinggi batang untuk melihat nilai tiap kategori<br />
                  <strong>5.</strong> Bandingkan tinggi batang untuk mengetahui kategori mana yang nilainya lebih besar
                </p>
              </div>

              <h3 className="konsep-title">Contoh Diagram Batang</h3>
              <div className="example">
                <p className="konsep-content">
                  <strong>Contoh 1: Buah Kesukaan Siswa Kelas 4</strong><br /><br />

                  Judul: "Buah Kesukaan Siswa Kelas 4"<br />
                  Sumbu X: Jenis buah (Apel, Jeruk, Pisang, Mangga)<br />
                  Sumbu Y: Jumlah siswa<br /><br />

                  Data:<br />
                  Apel: 8 siswa<br />
                  Jeruk: 12 siswa<br />
                  Pisang: 5 siswa<br />
                  Mangga: 15 siswa<br /><br />

                  Dari diagram di atas, kita bisa melihat bahwa:<br />
                  - Buah yang paling disukai adalah mangga (15 siswa)<br />
                  - Buah yang paling sedikit disukai adalah pisang (5 siswa)<br />
                  - Jeruk disukai oleh 12 siswa<br />
                  - Apel disukai oleh 8 siswa<br />
                </p>
              </div>

              <h3 className="konsep-title">Cara Membuat Diagram Batang</h3>
              <p className="konsep-content">
                Untuk membuat diagram batang, ikuti langkah-langkah ini:
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>1.</strong> Kumpulkan data yang ingin kamu tampilkan<br />
                  <strong>2.</strong> Buat dua garis: mendatar (sumbu X) dan tegak (sumbu Y)<br />
                  <strong>3.</strong> Tentukan kategori pada sumbu X<br />
                  <strong>4.</strong> Tentukan skala nilai pada sumbu Y<br />
                  <strong>5.</strong> Gambar batang untuk setiap kategori dengan tinggi sesuai nilainya<br />
                  <strong>6.</strong> Beri judul untuk diagram<br />
                </p>
              </div>

              <h3 className="konsep-title">Contoh Soal Diagram Batang</h3>
              <div className="example">
                <p className="konsep-content">
                  <strong>Soal 1:</strong><br />
                  Perhatikan diagram batang berikut:<br />
                  "Hasil Panen Sayuran Pak Tani"<br />
                  Wortel: 25 kg<br />
                  Kentang: 40 kg<br />
                  Kubis: 20 kg<br />
                  Tomat: 30 kg<br /><br />

                  Pertanyaan:<br />
                  a. Sayuran apa yang paling banyak dipanen?<br />
                  b. Berapa total hasil panen sayuran Pak Tani?<br /><br />

                  <strong>Jawaban:</strong><br />
                  a. Sayuran yang paling banyak dipanen adalah kentang (40 kg)<br />
                  b. Total hasil panen = 25 + 40 + 20 + 30 = 115 kg<br /><br />

                  <strong>Soal 2:</strong><br />
                  Diagram batang menunjukkan jumlah siswa yang mengikuti kegiatan ekstrakurikuler:<br />
                  Menari: 15 siswa<br />
                  Melukis: 10 siswa<br />
                  Olahraga: 25 siswa<br />
                  Musik: 20 siswa<br /><br />

                  Pertanyaan:<br />
                  a. Kegiatan apa yang paling sedikit peminatnya?<br />
                  b. Berapa selisih jumlah siswa antara kegiatan olahraga dan melukis?<br /><br />

                  <strong>Jawaban:</strong><br />
                  a. Kegiatan yang paling sedikit peminatnya adalah melukis (10 siswa)<br />
                  b. Selisih = 25 - 10 = 15 siswa<br />
                </p>
              </div>

              <h3 className="konsep-title">Aktivitas Belajar</h3>
              <p className="konsep-content">
                Berikut adalah beberapa aktivitas yang bisa kamu lakukan untuk lebih memahami diagram batang:
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>Aktivitas 1: Buat Diagram Batang Sederhana</strong><br />
                  Tanyakan kepada 10 temanmu buah apa yang mereka sukai. Catatlah hasilnya, lalu buatlah diagram batang untuk menunjukkan hasilnya.<br /><br />

                  <strong>Aktivitas 2: Cari Diagram Batang</strong><br />
                  Carilah contoh diagram batang di koran, majalah, atau buku pelajaranmu. Coba jelaskan informasi apa yang ditampilkan dalam diagram tersebut.<br /><br />

                  <strong>Aktivitas 3: Bandingkan Data</strong><br />
                  Buatlah diagram batang tentang kegiatan yang kamu dan temanmu lakukan di waktu luang. Bandingkan hasilnya dan diskusikan apa yang kamu temukan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-title">Math Fun</div>
            <div className="footer-subtitle">Belajar matematika jadi menyenangkan!</div>
          </div>
          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="copyright">
          © 2023 Math Fun. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Materi_Bab6_3;
