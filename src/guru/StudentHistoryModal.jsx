import React, { useState, useEffect } from "react";
import {
  getNilaiSiswa,
  getDummyHistoryData,
  getRiwayatSiswa,
} from "../services/nilaiService";
import { getStudentGameProgress } from "../services/gameProgressService";
import "./guru.css";

const StudentHistoryModal = ({ isOpen, onClose, student }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useDummyData, setUseDummyData] = useState(false);
  const [dataSource, setDataSource] = useState("game_progress"); // 'game_progress', 'riwayat' atau 'nilai'
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filteredHistory, setFilteredHistory] = useState([]);
  // Helper function untuk format durasi dalam detik ke menit:detik
  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentHistory();
    }
  }, [isOpen, student]);

  const fetchStudentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      setUseDummyData(false);
      setDataSource("game_progress");

      // Pertama coba ambil data dari tabel game_progress
      let data;
      try {
        data = await getStudentGameProgress(student.id);

        // Jika tidak ada data di tabel game_progress, coba ambil dari tabel riwayat_siswa
        if (!data || data.length === 0) {
          setDataSource("riwayat");
          data = await getRiwayatSiswa(student.id);

          // Jika tidak ada data di tabel riwayat, coba ambil dari tabel nilai
          if (!data || data.length === 0) {
            setDataSource("nilai");
            data = await getNilaiSiswa(student.id);

            // Jika masih tidak ada data, gunakan dummy data
            if (!data || data.length === 0) {
              setUseDummyData(true);
              data = await getDummyHistoryData(student.id);
            }
          }
        }
      } catch (err) {
        console.warn(
          "Error fetching game progress, trying riwayat table:",
          err
        );

        try {
          setDataSource("riwayat");
          data = await getRiwayatSiswa(student.id);

          if (!data || data.length === 0) {
            setDataSource("nilai");
            data = await getNilaiSiswa(student.id);

            if (!data || data.length === 0) {
              setUseDummyData(true);
              data = await getDummyHistoryData(student.id);
            }
          }
        } catch (err2) {
          console.warn(
            "Error fetching from riwayat table, trying nilai table:",
            err2
          );

          try {
            setDataSource("nilai");
            data = await getNilaiSiswa(student.id);

            if (!data || data.length === 0) {
              setUseDummyData(true);
              data = await getDummyHistoryData(student.id);
            }
          } catch (err3) {
            console.warn(
              "Error fetching from nilai table, using dummy data:",
              err3
            );
            setUseDummyData(true);
            data = await getDummyHistoryData(student.id);
          }
        }
      }

      // Sort by date, most recent first
      let sortedData;

      if (dataSource === "game_progress") {
        // Data dari tabel game_progress sudah terurut dari API berdasarkan waktu_selesai
        sortedData = data;
      } else if (dataSource === "riwayat") {
        // Data dari tabel riwayat_siswa sudah terurut dari API
        sortedData = data;
      } else {
        // Data dari tabel nilai atau dummy data perlu diurutkan
        sortedData = data.sort((a, b) => {
          const dateA = a.waktu_pengerjaan ? a.waktu_pengerjaan : a.tanggal;
          const dateB = b.waktu_pengerjaan ? b.waktu_pengerjaan : b.tanggal;
          return new Date(dateB) - new Date(dateA);
        });
      }

      setHistory(sortedData);
    } catch (error) {
      console.error("Error fetching student history:", error);
      setError("Gagal memuat riwayat siswa");
    } finally {
      setLoading(false);
    }
  };
  // Effect untuk filter data berdasarkan kategori
  useEffect(() => {
    if (history.length > 0) {
      if (filterKategori === "semua") {
        setFilteredHistory(history);
      } else {
        const filtered = history.filter((item) => {
          let kategori;
          if (dataSource === "game_progress") {
            kategori = item.jenis_permainan || "";
          } else {
            kategori = item.kategori || item.materi?.kategori || "";
          }
          return kategori.toLowerCase() === filterKategori.toLowerCase();
        });
        setFilteredHistory(filtered);
      }
    } else {
      setFilteredHistory([]);
    }
  }, [history, filterKategori, dataSource]);

  // Fungsi untuk mendapatkan semua kategori unik dari data riwayat
  const getUniqueKategori = () => {
    const kategoriSet = new Set();
    history.forEach((item) => {
      let kategori;
      if (dataSource === "game_progress") {
        kategori = item.jenis_permainan;
      } else {
        kategori = item.kategori || item.materi?.kategori;
      }
      if (kategori) {
        kategoriSet.add(kategori);
      }
    });
    return ["semua", ...Array.from(kategoriSet)];
  };

  // Fungsi untuk mengekspor data riwayat ke CSV
  const exportToCSV = () => {
    // Buat header CSV
    let csvContent = "Tanggal,Materi,Kategori,Nilai";

    if (dataSource === "game_progress") {
      csvContent += ",Status,Skor Maksimal,Kelas,Bab,Level\n";
    } else if (dataSource === "riwayat") {
      csvContent += ",Benar,Salah,Level Kesulitan\n";
    } else {
      csvContent += "\n";
    }

    // Tambahkan data
    filteredHistory.forEach((item) => {
      let tanggal, materiName, kategori, nilai;

      if (dataSource === "game_progress") {
        tanggal = item.waktu_selesai || item.created_at;
        materiName = item.jenis_permainan || "-";
        kategori = item.jenis_permainan || "-"; // Gunakan jenis_permainan sebagai kategori juga
        nilai = item.skor || 0;

        // Format baris CSV sesuai dengan data game_progress
        const status = item.status_selesai ? "Selesai" : "Belum Selesai";
        const skorMaksimal = item.skor_maksimal || 100;
        const kelas = item.kelas || "-";
        const bab = item.bab || "-";
        const level = item.level || "-";

        let row = `"${new Date(tanggal).toLocaleDateString(
          "id-ID"
        )}","${materiName}","${kategori}","${nilai}"`;
        row += `,"${status}","${skorMaksimal}","${kelas}","${bab}","${level}"`;
        csvContent += row + "\n";
      } else {
        tanggal = item.waktu_pengerjaan ? item.waktu_pengerjaan : item.tanggal;
        materiName = item.materi?.nama_materi || "-";
        kategori = item.kategori || item.materi?.kategori || "-";
        nilai = item.nilai || 0;

        let row = `"${new Date(tanggal).toLocaleDateString(
          "id-ID"
        )}","${materiName}","${kategori}","${nilai}"`;

        if (dataSource === "riwayat") {
          // const durasi = formatDuration(item.durasi_pengerjaan);
          const benar = item.jumlah_benar || 0;
          const salah = item.jumlah_salah || 0;
          const level = item.level_kesulitan || "Sedang";

          row += `,"${benar}","${salah}","${level}"`;
        }

        csvContent += row + "\n";
      }
    });

    // Buat file blob dan download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `riwayat_${student.name}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Riwayat Belajar {student?.name || "Siswa"}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i> Memuat data riwayat...
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : history.length === 0 ? (
            <div className="empty-history">
              Belum ada riwayat belajar untuk siswa ini
            </div>
          ) : (
            <div className="history-list">
              {useDummyData && (
                <div className="dummy-data-notice">
                  <i className="fas fa-info-circle"></i> Menampilkan data
                  contoh. Data asli belum tersedia.
                </div>
              )}

              {!useDummyData && (
                <div className="data-source-info">
                  <i className="fas fa-database"></i>
                  Data dari:{" "}
                  {dataSource === "game_progress"
                    ? "Permainan Pembelajaran"
                    : dataSource === "riwayat"
                    ? "Riwayat Lengkap"
                    : "Nilai Ujian"}
                </div>
              )}

              <div className="filter-section">
                <label htmlFor="filterKategori">Filter Kategori:</label>
                <select
                  id="filterKategori"
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                >
                  {getUniqueKategori().map((kategori) => (
                    <option key={kategori} value={kategori}>
                      {kategori}
                    </option>
                  ))}
                </select>
                <button className="export-button" onClick={exportToCSV}>
                  Ekspor ke CSV
                </button>
              </div>

              <table className="history-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Materi</th>
                    <th>Kategori</th>
                    <th>Nilai</th>
                    {dataSource === "game_progress" && (
                      <>
                        <th>Status</th>
                        <th>Kelas</th>
                        <th>Bab</th>
                      </>
                    )}
                    {dataSource === "riwayat" && (
                      <>
                        <th>Benar</th>
                        <th>Level</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    let tanggal, materiName, kategori, nilai;

                    if (dataSource === "game_progress") {
                      // Untuk data dari tabel game_progress
                      tanggal = item.waktu_selesai || item.created_at;
                      materiName = item.jenis_permainan || "-";
                      kategori = item.jenis_permainan || "-";
                      nilai = item.skor || 0;

                      return (
                        <tr key={item.id_progress}>
                          <td>
                            {new Date(tanggal).toLocaleDateString("id-ID")}
                          </td>
                          <td>{materiName}</td>
                          <td>{kategori}</td>
                          <td
                            className={
                              nilai >= 70 ? "good-score" : "needs-improvement"
                            }
                          >
                            {nilai}
                          </td>
                          <td>
                            <span
                              className={
                                item.status_selesai
                                  ? "status-selesai"
                                  : "status-belum"
                              }
                            >
                              {item.status_selesai
                                ? "Selesai"
                                : "Belum Selesai"}
                            </span>
                          </td>
                          <td>{item.kelas}</td>
                          <td>{item.bab}</td>
                        </tr>
                      );
                    } else {
                      // Untuk data dari tabel riwayat_siswa atau nilai
                      tanggal = item.waktu_pengerjaan
                        ? item.waktu_pengerjaan
                        : item.tanggal;
                      materiName = item.materi?.nama_materi || "-";
                      kategori = item.kategori || item.materi?.kategori || "-";
                      nilai = item.nilai || 0;

                      return (
                        <tr key={item.id_riwayat || item.id_nilai}>
                          <td>
                            {new Date(tanggal).toLocaleDateString("id-ID")}
                          </td>
                          <td>{materiName}</td>
                          <td>{kategori}</td>
                          <td
                            className={
                              nilai >= 70 ? "good-score" : "needs-improvement"
                            }
                          >
                            {nilai}
                          </td>
                          {dataSource === "riwayat" && (
                            <>
                              <td>
                                {item.jumlah_benar || 0}/
                                {(item.jumlah_benar || 0) +
                                  (item.jumlah_salah || 0)}
                              </td>
                              <td>
                                <span
                                  className={`level-${
                                    item.level_kesulitan?.toLowerCase() ||
                                    "sedang"
                                  }`}
                                >
                                  {item.level_kesulitan || "Sedang"}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="action-button close" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHistoryModal;
