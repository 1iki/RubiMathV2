import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../materistyle.css';
import logo from '../../../../assets/logo.png';

const MateriBab6_1 = () => {
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
              src={`https://www.youtube.com/embed/8QSjm3Un-xo?autoplay=1&mute=${isMuted ? 1 : 0}`}
              title="Bentuk Penyajian Data Tabel Dan Diagram"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <h1 className="materi-title">Bentuk Penyajian Data Tabel Dan Diagram</h1>

          <p className="materi-description">
            Data adalah kumpulan informasi yang dikumpulkan dari pengamatan. Kita bisa menyajikan data dengan
            berbagai cara supaya lebih mudah dibaca dan dipahami. Dua cara yang paling umum adalah menggunakan
            tabel dan diagram.
          </p>

          <div className="watch-info">
            <div className="watch-time">
              <svg className="clock-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM8.5 4H7V9L11.25 11.15L12 9.92L8.5 8.25V4Z" fill="currentColor" />
              </svg>
              5:40 menit
            </div>


          </div>

          <div className="ringkasan-section">
            <h2 className="ringkasan-title">Ringkasan Materi</h2>

            <div className="konsep-pengurangan">
              <h3 className="konsep-title">Apa Itu Data?</h3>
              <p className="konsep-content">
                Data adalah kumpulan informasi atau fakta yang kita dapatkan dari pengamatan atau pencatatan.
                Data bisa berupa angka, nama, atau keterangan lainnya.
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>Contoh data:</strong><br />
                  • Jumlah murid di kelas 4A<br />
                  • Buah kesukaan teman-teman<br />
                  • Nilai ulangan matematika<br />
                  • Tinggi badan siswa kelas 4
                </p>
              </div>

              <h3 className="konsep-title">Mengapa Kita Perlu Menyajikan Data?</h3>
              <p className="konsep-content">
                Data yang belum diatur biasanya sulit untuk dipahami. Jika kita menyajikan data dengan rapi
                menggunakan tabel atau diagram, maka:
              </p>
              <div className="example">
                <p className="konsep-content">
                  • Data menjadi lebih mudah dibaca<br />
                  • Informasi lebih cepat dipahami<br />
                  • Mudah menemukan informasi yang penting<br />
                  • Bisa melihat perbandingan antar data dengan jelas
                </p>
              </div>

              <h3 className="konsep-title">Cara Menyajikan Data dengan Tabel</h3>
              <p className="konsep-content">
                Tabel adalah cara menyajikan data dalam bentuk baris dan kolom. Tabel memiliki beberapa bagian penting:
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>Bagian-bagian tabel:</strong><br />
                  • Judul tabel - menjelaskan isi tabel<br />
                  • Judul kolom - nama untuk setiap kolom<br />
                  • Judul baris - nama untuk setiap baris<br />
                  • Data - informasi yang disajikan
                </p>

                <p className="konsep-content">
                  <strong>Contoh tabel: Buah Kesukaan Siswa Kelas 4</strong>
                </p>

                <div style={{ overflow: 'auto', marginBottom: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nama Buah</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Jumlah Siswa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Apel</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>8</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Jeruk</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>12</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Pisang</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>7</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Mangga</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="konsep-content">
                  Dari tabel di atas, kita bisa dengan mudah melihat bahwa buah kesukaan paling banyak adalah jeruk dengan 12 siswa.
                </p>
              </div>

              <h3 className="konsep-title">Cara Menyajikan Data dengan Diagram</h3>
              <p className="konsep-content">
                Diagram adalah cara menyajikan data dalam bentuk gambar atau grafik. Ada beberapa jenis diagram yang akan kita pelajari:
              </p>
              <div className="example">
                <p className="konsep-content">
                  <strong>1. Diagram Gambar (Piktogram)</strong><br />
                  Diagram gambar menggunakan simbol atau gambar untuk mewakili data. Setiap gambar biasanya mewakili
                  jumlah tertentu.
                </p>

                <p className="konsep-content">
                  <strong>Contoh:</strong> Jika 1 gambar apel mewakili 2 siswa, maka 4 gambar apel berarti ada 8 siswa
                  yang menyukai apel.
                </p>
                <p className="konsep-content">
                  🍎🍎🍎🍎 = 8 siswa yang suka apel<br />
                  🍊🍊🍊🍊🍊🍊 = 12 siswa yang suka jeruk
                </p>

                <p className="konsep-content">
                  <strong>2. Diagram Batang</strong><br />
                  Diagram batang menggunakan batang atau balok dengan tinggi yang berbeda-beda untuk menunjukkan
                  banyaknya data.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ background: '#FF6384', width: '40px', height: '80px' }}></div>
                      <div>Apel</div>
                      <div>8 siswa</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ background: '#36A2EB', width: '40px', height: '120px' }}></div>
                      <div>Jeruk</div>
                      <div>12 siswa</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ background: '#FFCE56', width: '40px', height: '70px' }}></div>
                      <div>Pisang</div>
                      <div>7 siswa</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ background: '#4BC0C0', width: '40px', height: '100px' }}></div>
                      <div>Mangga</div>
                      <div>10 siswa</div>
                    </div>
                  </div>
                </div>
                <p className="konsep-content">
                  Dari diagram batang di atas, kita bisa dengan mudah melihat bahwa jeruk adalah buah kesukaan terbanyak
                  dengan 12 siswa.
                </p>

                <p className="konsep-content">
                  <strong>3. Diagram Lingkaran (Diagram Pie)</strong><br />
                  Diagram lingkaran mirip seperti kue yang dibagi menjadi beberapa bagian. Setiap bagian menunjukkan
                  persentase dari keseluruhan data.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                  <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#FF6384', clipPath: 'polygon(50% 50%, 100% 50%, 100% 0, 66% 0, 50% 0)' }}></div>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#36A2EB', clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 80% 100%, 50% 80%)' }}></div>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#FFCE56', clipPath: 'polygon(50% 50%, 50% 80%, 80% 100%, 0% 100%, 0% 60%)' }}></div>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#4BC0C0', clipPath: 'polygon(50% 50%, 0% 60%, 0% 0%, 66% 0%, 50% 0%)' }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#FF6384' }}></div>
                    <div>Apel (22%)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#36A2EB' }}></div>
                    <div>Jeruk (32%)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#FFCE56' }}></div>
                    <div>Pisang (19%)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#4BC0C0' }}></div>
                    <div>Mangga (27%)</div>
                  </div>
                </div>
              </div>

              <h3 className="konsep-title">Cara Memilih Bentuk Penyajian Data yang Tepat</h3>
              <div className="example">
                <p className="konsep-content">
                  <strong>1. Tabel bagus untuk:</strong><br />
                  • Menyajikan data dengan angka yang tepat<br />
                  • Data yang perlu dibandingkan secara detail<br />
                  • Menunjukkan banyak informasi sekaligus
                </p>

                <p className="konsep-content">
                  <strong>2. Diagram Gambar (Piktogram) bagus untuk:</strong><br />
                  • Membuat data lebih menarik untuk dilihat<br />
                  • Menjelaskan data kepada anak-anak<br />
                  • Jumlah data yang tidak terlalu banyak
                </p>

                <p className="konsep-content">
                  <strong>3. Diagram Batang bagus untuk:</strong><br />
                  • Membandingkan nilai antar kelompok<br />
                  • Menunjukkan perubahan data dari waktu ke waktu<br />
                  • Melihat dengan cepat data mana yang paling besar/kecil
                </p>

                <p className="konsep-content">
                  <strong>4. Diagram Lingkaran bagus untuk:</strong><br />
                  • Menunjukkan bagian dari keseluruhan<br />
                  • Memperlihatkan persentase atau proporsi<br />
                  • Membandingkan kontribusi dari setiap kelompok
                </p>
              </div>

              <h3 className="konsep-title">Langkah-Langkah Membuat Tabel dan Diagram</h3>
              <div className="example">
                <p className="konsep-content">
                  <strong>Langkah membuat tabel:</strong><br />
                  1. Tentukan judul tabel<br />
                  2. Buat kolom untuk setiap kategori<br />
                  3. Buat baris untuk setiap data<br />
                  4. Isi data dengan benar dan rapi
                </p>

                <p className="konsep-content">
                  <strong>Langkah membuat diagram batang:</strong><br />
                  1. Buat sumbu mendatar dan sumbu tegak<br />
                  2. Tulis nama kategori pada sumbu mendatar<br />
                  3. Tulis angka pada sumbu tegak<br />
                  4. Gambar batang sesuai dengan nilai data<br />
                  5. Beri judul diagram
                </p>

                <p className="konsep-content">
                  <strong>Langkah membuat diagram gambar:</strong><br />
                  1. Tentukan simbol atau gambar yang akan digunakan<br />
                  2. Tentukan nilai setiap gambar (misalnya 1 gambar = 2 siswa)<br />
                  3. Gambar simbol sesuai dengan jumlah data<br />
                  4. Beri keterangan untuk setiap kategori<br />
                  5. Beri judul diagram
                </p>
              </div>

              <h3 className="konsep-title">Contoh Dalam Kehidupan Sehari-hari</h3>
              <div className="example">
                <p className="konsep-content">
                  <strong>1. Jadwal Pelajaran</strong><br />
                  Jadwal pelajaran di sekolah disajikan dalam bentuk tabel dengan hari dan jam sebagai baris dan kolom.
                </p>

                <p className="konsep-content">
                  <strong>2. Laporan Cuaca</strong><br />
                  Prakiraan cuaca sering menggunakan diagram untuk menunjukkan suhu dari hari ke hari.
                </p>

                <p className="konsep-content">
                  <strong>3. Nilai Ulangan</strong><br />
                  Guru biasanya mencatat nilai ulangan siswa dalam bentuk tabel dan bisa membuat diagram batang untuk
                  melihat distribusi nilai.
                </p>

                <p className="konsep-content">
                  <strong>4. Makanan Kesukaan</strong><br />
                  Saat mendata makanan kesukaan teman-teman, hasilnya bisa disajikan dengan diagram lingkaran untuk
                  melihat persentasenya.
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

export default MateriBab6_1;
