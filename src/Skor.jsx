import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./skor.css";
import supabase from "./config/supabaseClient";

export default function Skor() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    avatar: null,
    id_kelas: null, // tambahkan default value untuk id_kelas
  });

  // Data progres siswa
  const [progressData, setProgressData] = useState({
    totalScore: 0,
    completedLevels: 0,
    completedOperations: 0,
    totalOperations: 36, // Total operasi: 3 bab × 3 level per bab × 4 operasi per level
    highestScore: 0,
    recentActivity: [],
  });
  // State untuk menyimpan bab dan level terakhir yang diklik
  const [lastClickedChapter] = useState(1);
  const [lastClickedLevel] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      const operationTypes = {
        addition: "Addition",
        subtraction: "Subtraction",
        multiplication: "Multiplication",
        division: "Division",
      };

      // Mengambil data pengguna dari localStorage
      const userRole = localStorage.getItem("userRole");
      const avatarData = JSON.parse(localStorage.getItem("selectedAvatar"));
      const existingKelas = localStorage.getItem("userKelas");
      const id_siswa = localStorage.getItem("id_siswa");
      const userDataFromStorage = JSON.parse(
        localStorage.getItem("userData") || "{}"
      );

      if (!avatarData) {
        navigate("/login");
        return;
      }

      // Inisialisasi siswaData dengan data dari localStorage
      let siswaData = null;

      // Jika ada userData tersimpan dengan id_siswa, gunakan itu
      if (userDataFromStorage && userDataFromStorage.id_siswa) {
        siswaData = userDataFromStorage;
        console.log("Using stored user data:", siswaData);
      } else {
        // Jika tidak ada userData, coba ambil dari Supabase
        try {
          let query = supabase.from("siswa").select("*");

          // Prioritaskan pencarian berdasarkan id_siswa
          if (id_siswa) {
            query = query.eq("id_siswa", id_siswa);
            console.log("Searching by id_siswa:", id_siswa);
          } else {
            // Jika tidak ada id_siswa, gunakan nama avatar sebagai fallback
            query = query.ilike("nama", avatarData.name);
            console.log("Searching by name:", avatarData.name);
          }

          const { data, error } = await query.maybeSingle();

          console.log("Fetched student data:", data);

          if (error) {
            console.error("Error fetching siswa:", error);
          } else if (data) {
            // Simpan data siswa ke localStorage
            localStorage.setItem("userData", JSON.stringify(data));
            localStorage.setItem("userKelas", data.id_kelas.toString());
            localStorage.setItem("id_siswa", data.id_siswa.toString());
            siswaData = data;
          } else {
            console.log("No student data found");
            // Jika tidak ada data ditemukan, coba ambil dari localStorage yang ada
            if (existingKelas) {
              siswaData = { id_kelas: parseInt(existingKelas) };
            }
          }
        } catch (err) {
          console.error("Exception fetching siswa:", err);
          // Gunakan data dari localStorage jika ada error
          if (existingKelas) {
            siswaData = { id_kelas: parseInt(existingKelas) };
          }
        }
      }

      // If no class data was found anywhere, set it to class 2
      if (!siswaData) {
        siswaData = { id_kelas: 2 };
        localStorage.setItem("userKelas", "2");
      }
      setUserData({
        name: userDataFromStorage?.nama || avatarData.name || "Siswa",
        role: userRole || "siswa",
        avatar: {
          ...avatarData,
          displayName: userDataFromStorage?.nama || avatarData.name,
        },
        id_kelas: siswaData.id_kelas,
      });

      // Mengambil data progres dari avatar yang dipilih
      let levelScores = {};
      const avatarKey = `avatar_${avatarData.name}_levelScores`;
      levelScores = JSON.parse(localStorage.getItem(avatarKey)) || {};

      // Mengambil data operasi matematika yang disimpan
      const avatarOperationsKey = `avatar_${avatarData.name}_operations`;
      const operationData =
        JSON.parse(localStorage.getItem(avatarOperationsKey)) || {};

      // Menghitung total skor dan level yang sudah diselesaikan
      let totalScore = 0;
      let completedLevels = 0;
      let completedOperations = 0;
      let highestScore = 0;
      let recentActivity = [];

      // Buat lookup untuk melacak operasi yang telah diselesaikan per level
      const completedOperationsByLevel = {};

      // Track unique levels
      const uniqueLevels = new Set();

      // Menghitung jumlah operasi yang diselesaikan berdasarkan data skor
      Object.entries(levelScores).forEach(([key, score]) => {
        if (score > 0) {
          // Key sekarang dalam format "babX_levelY_operation_timestamp" atau format lama
          const keyParts = key.split("_");

          // Handle berbagai format key
          let levelKey, operation, timestamp;

          if (keyParts.length >= 3) {
            // Format baru dengan timestamp: babX_levelY_operation_timestamp
            levelKey = `${keyParts[0]}_${keyParts[1]}`;
            operation = keyParts[2];
            timestamp =
              keyParts.length > 3 ? keyParts[3] : Date.now().toString();
          } else if (keyParts.length === 2) {
            // Format lama: babX_levelY
            levelKey = key;
            operation = operationData[key] || "unknown";
            timestamp = Date.now().toString();
          } else {
            // Format tidak dikenal
            return;
          }

          // Tambahkan levelKey ke Set untuk melacak level unik
          uniqueLevels.add(levelKey);

          if (!completedOperationsByLevel[levelKey]) {
            completedOperationsByLevel[levelKey] = [];
          }

          if (!completedOperationsByLevel[levelKey].includes(operation)) {
            completedOperationsByLevel[levelKey].push(operation);
            completedOperations++;
          }

          if (score > highestScore) {
            highestScore = score;
          }

          // Format: "bab0_level0" -> "Bab 1 Level 1"
          const [bab, level] = levelKey.split("_");
          const babNumber = parseInt(bab.replace("bab", "")) + 1; // +1 karena indeks dimulai dari 0
          const levelNumber = parseInt(level.replace("level", "")) + 1; // +1 karena indeks dimulai dari 0

          // Mendapatkan jenis operasi matematika
          const operationLabel = operationTypes[operation] || operation;

          // Gunakan key lengkap sebagai ID unik
          const activityTimestamp = parseInt(
            localStorage.getItem(`${key}_timestamp`) || timestamp
          );

          recentActivity.push({
            id: key, // Gunakan key lengkap sebagai ID unik
            bab: babNumber,
            level: levelNumber,
            title: `Level ${levelNumber} ${operationLabel}`,
            score: score,
            timestamp: activityTimestamp,
            operation: operation,
          });

          totalScore += score;
        }
      });

      // Hitung berapa level yang memiliki setidaknya satu operasi yang diselesaikan
      completedLevels = uniqueLevels.size;

      // Urutkan aktivitas terbaru berdasarkan timestamp (terbaru dulu)
      recentActivity.sort((a, b) => b.timestamp - a.timestamp);

      setProgressData({
        totalScore,
        completedOperations,
        completedLevels,
        totalOperations: 36, // 3 bab × 3 level × 4 operasi
        highestScore,
        recentActivity,
      });
    };

    fetchUserData();
  }, [navigate]);

  const getProgressPercentage = () => {
    return Math.round(
      (progressData.completedOperations / progressData.totalOperations) * 100
    );
  };
  const handleBackToMenu = () => {
    // Ambil kelas dari userData yang sudah diupdate dari database
    const kelasUser = userData.id_kelas;
    console.log("Navigating based on kelas:", kelasUser);

    // Navigasi berdasarkan kelas pengguna
    switch (kelasUser) {
      case 2:
        navigate("/kelas2");
        break;
      case 4:
        navigate("/kelas4");
        break;
      case 5:
        navigate("/kelas5");
        break;
      case 6:
        navigate("/kelas6");
        break;
      default:
        navigate("/main-siswa");
    }
  };

  // Fungsi untuk mendapatkan aktivitas berdasarkan bab, level, dan operasi
  const getActivitiesByChapterLevelAndOperation = (bab, level, operation) => {
    return progressData.recentActivity.filter(
      (activity) =>
        activity.bab === bab &&
        activity.level === level &&
        activity.operation === operation
    );
  };

  // Fungsi untuk memformat tanggal aktivitas
  const formatActivityDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  return (
    <motion.div
      className="hasil-page skor-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Progres Belajarmu</h1>

      {/* Informasi profil */}
      <div className="profile-info">
        {userData.avatar && (
          <div className="avatar-container">
            <img
              src={userData.avatar.src}
              alt="Avatar"
              className="user-avatar"
            />
          </div>
        )}
        <p>Hai, {userData.avatar ? userData.avatar.displayName : "Siswa"}!</p>
      </div>

      {/* Progres overview */}
      <div className="progress-overview">
        <p>
          Total Skor: <strong>{progressData.totalScore}</strong>
        </p>
        <p>
          Level Mulai Dikerjakan:{" "}
          <strong>{progressData.completedLevels}</strong> dari 9
        </p>
        <p>
          Operasi Selesai: <strong>{progressData.completedOperations}</strong>{" "}
          dari {progressData.totalOperations}
        </p>
        <p>
          Progres Keseluruhan: <strong>{getProgressPercentage()}%</strong>
        </p>
      </div>

      {/* Progress bar */}
      <div className="skor-progress-container">
        <div className="skor-progress-bar">
          <div
            className="skor-progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <p className="progress-percentage">{getProgressPercentage()}%</p>
      </div>

      {/* Highlight capaian */}
      <div className="achievement-highlight">
        <p>
          Skor Tertinggi: <strong>{progressData.highestScore}</strong>
        </p>
      </div>

      {/* Aktivitas terbaru - menampilkan semua operasi dan multiple entries */}
      {progressData.recentActivity.length > 0 ? (
        <div className="recent-activities-container">
          <h2 className="aktivitas-title">Aktivitas Terakhir</h2>
          <div className="recent-activities-box">
            <h3 className="bab-title">Bab {lastClickedChapter}</h3>
            <div className="divider"></div>

            <div className="level-container">
              <h4 className="level-title">Level {lastClickedLevel}</h4>

              {/* Tampilkan aktivitas terkelompok berdasarkan operasi */}
              <div className="operations-container">
                {/* Addition Activities */}
                <div className="operation-section">
                  <h5 className="operation-title">Addition</h5>
                  <div className="activities-grid">
                    {getActivitiesByChapterLevelAndOperation(
                      lastClickedChapter,
                      lastClickedLevel,
                      "addition"
                    ).length > 0 ? (
                      getActivitiesByChapterLevelAndOperation(
                        lastClickedChapter,
                        lastClickedLevel,
                        "addition"
                      ).map((activity) => (
                        <div key={activity.id} className="activity-white-card">
                          <div className="operation-score">
                            Skor: <span>{activity.score}</span>
                          </div>
                          <div className="activity-date">
                            {formatActivityDate(activity.timestamp)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-activity-message">
                        Belum ada aktivitas Addition
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtraction Activities */}
                <div className="operation-section">
                  <h5 className="operation-title">Subtraction</h5>
                  <div className="activities-grid">
                    {getActivitiesByChapterLevelAndOperation(
                      lastClickedChapter,
                      lastClickedLevel,
                      "subtraction"
                    ).length > 0 ? (
                      getActivitiesByChapterLevelAndOperation(
                        lastClickedChapter,
                        lastClickedLevel,
                        "subtraction"
                      ).map((activity) => (
                        <div key={activity.id} className="activity-white-card">
                          <div className="operation-score">
                            Skor: <span>{activity.score}</span>
                          </div>
                          <div className="activity-date">
                            {formatActivityDate(activity.timestamp)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-activity-message">
                        Belum ada aktivitas Subtraction
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiplication Activities */}
                <div className="operation-section">
                  <h5 className="operation-title">Multiplication</h5>
                  <div className="activities-grid">
                    {getActivitiesByChapterLevelAndOperation(
                      lastClickedChapter,
                      lastClickedLevel,
                      "multiplication"
                    ).length > 0 ? (
                      getActivitiesByChapterLevelAndOperation(
                        lastClickedChapter,
                        lastClickedLevel,
                        "multiplication"
                      ).map((activity) => (
                        <div key={activity.id} className="activity-white-card">
                          <div className="operation-score">
                            Skor: <span>{activity.score}</span>
                          </div>
                          <div className="activity-date">
                            {formatActivityDate(activity.timestamp)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-activity-message">
                        Belum ada aktivitas Multiplication
                      </div>
                    )}
                  </div>
                </div>

                {/* Division Activities */}
                <div className="operation-section">
                  <h5 className="operation-title">Division</h5>
                  <div className="activities-grid">
                    {getActivitiesByChapterLevelAndOperation(
                      lastClickedChapter,
                      lastClickedLevel,
                      "division"
                    ).length > 0 ? (
                      getActivitiesByChapterLevelAndOperation(
                        lastClickedChapter,
                        lastClickedLevel,
                        "division"
                      ).map((activity) => (
                        <div key={activity.id} className="activity-white-card">
                          <div className="operation-score">
                            Skor: <span>{activity.score}</span>
                          </div>
                          <div className="activity-date">
                            {formatActivityDate(activity.timestamp)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-activity-message">
                        Belum ada aktivitas Division
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="recent-activities-container empty-activities">
          <h2 className="aktivitas-title">Aktivitas Terakhir</h2>
          <div className="empty-message">
            <p>Belum ada aktivitas. Ayo mulai belajar!</p>
          </div>
        </div>
      )}

      {/* Tombol navigasi */}
      <div className="navigation-buttons">
        <button onClick={handleBackToMenu} className="menu-button">
          Kembali ke Menu
        </button>
      </div>
    </motion.div>
  );
}
