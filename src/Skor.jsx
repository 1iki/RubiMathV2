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
    id_kelas: null,
  });

  // Data progres siswa dengan struktur baru
  const [progressData, setProgressData] = useState({
    totalScore: 0,
    completedLevels: 0,
    completedGames: 0,
    totalGames: 14, // Total game: Bab 1(4) + Bab 2(4) + Bab 3(2) + Bab 4(2) + Bab 5(1) + Bab 6(1)
    highestScore: 0,
    recentActivity: [],
  });

  // Struktur bab dan game
  const gameStructure = {
    1: { totalGames: 4, title: "Bab 1" },
    2: { totalGames: 4, title: "Bab 2" },
    3: { totalGames: 2, title: "Bab 3" },
    4: { totalGames: 2, title: "Bab 4" },
    5: { totalGames: 1, title: "Bab 5" },
    6: { totalGames: 1, title: "Bab 6" },
  };

  useEffect(() => {
    const fetchUserData = async () => {
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

      if (userDataFromStorage && userDataFromStorage.id_siswa) {
        siswaData = userDataFromStorage;
      } else {
        try {
          let query = supabase.from("siswa").select("*");

          if (id_siswa) {
            query = query.eq("id_siswa", id_siswa);
          } else {
            query = query.ilike("nama", avatarData.name);
          }

          const { data, error } = await query.maybeSingle();

          if (error) {
            console.error("Error fetching siswa:", error);
          } else if (data) {
            localStorage.setItem("userData", JSON.stringify(data));
            localStorage.setItem("userKelas", data.id_kelas.toString());
            localStorage.setItem("id_siswa", data.id_siswa.toString());
            siswaData = data;
          }
        } catch (err) {
          console.error("Exception fetching siswa:", err);
          if (existingKelas) {
            siswaData = { id_kelas: parseInt(existingKelas) };
          }
        }
      }

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

      // Fetch game progress from database
      try {
        const { data: progressData, error: progressError } = await supabase
          .from("game_progress")
          .select("*")
          .eq("id_siswa", id_siswa)
          .order("created_at", { ascending: false });

        if (progressError) {
          console.error("Error fetching progress:", progressError);
          return;
        }

        // Process progress data
        let totalScore = 0;
        let completedGames = 0;
        let highestScore = 0;
        let recentActivity = [];

        // Track completed games per bab
        const completedGamesByBab = {};

        progressData.forEach((progress) => {
          const { bab, level, skor, status_selesai, created_at } = progress;

          // Initialize bab tracking if not exists
          if (!completedGamesByBab[bab]) {
            completedGamesByBab[bab] = new Set();
          }

          // Add to completed games if status_selesai is true
          if (status_selesai) {
            completedGamesByBab[bab].add(level);
            completedGames++;
          }

          totalScore += skor || 0;
          highestScore = Math.max(highestScore, skor || 0);

          recentActivity.push({
            bab,
            level,
            score: skor,
            timestamp: created_at,
            status_selesai,
          });
        });

        // Sort activities by timestamp
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setProgressData({
          totalScore,
          completedGames,
          completedLevels: Object.keys(completedGamesByBab).length,
          totalGames: 14,
          highestScore,
          recentActivity,
        });

      } catch (error) {
        console.error("Error processing progress data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const getProgressPercentage = () => {
    return Math.round((progressData.completedGames / progressData.totalGames) * 100);
  };

  const handleBackToMenu = () => {
    const kelasUser = userData.id_kelas;
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

      <div className="progress-overview">
        <p>
          Total Skor: <strong>{progressData.totalScore}</strong>
        </p>
        <p>
          Game Selesai: <strong>{progressData.completedGames}</strong> dari {progressData.totalGames}
        </p>
        <p>
          Progres Keseluruhan: <strong>{getProgressPercentage()}%</strong>
        </p>
      </div>

      <div className="skor-progress-container">
        <div className="skor-progress-bar">
          <div
            className="skor-progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <p className="progress-percentage">{getProgressPercentage()}%</p>
      </div>

      <div className="achievement-highlight">
        <p>
          Skor Tertinggi: <strong>{progressData.highestScore}</strong>
        </p>
      </div>

      {progressData.recentActivity.length > 0 ? (
        <div className="recent-activities-container">
          <h2 className="aktivitas-title">Aktivitas Terakhir</h2>
          <div className="recent-activities-box">
            {Object.entries(gameStructure).map(([babNumber, babInfo]) => {
              const babActivities = progressData.recentActivity.filter(
                (activity) => activity.bab === parseInt(babNumber)
              );

              if (babActivities.length === 0) return null;

              return (
                <div key={babNumber} className="bab-section">
                  <h3 className="bab-title">{babInfo.title}</h3>
                  <div className="divider"></div>
                  <div className="activities-grid">
                    {babActivities.map((activity, index) => (
                      <div key={index} className="activity-white-card">
                        <div className="activity-title">Level {activity.level}</div>
                        <div className="operation-score">
                          Skor: <span>{activity.score}</span>
                        </div>
                        <div className="activity-status">
                          {activity.status_selesai ? "✅ Selesai" : "🔄 Dalam Progress"}
                        </div>
                        <div className="activity-date">
                          {formatActivityDate(activity.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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

      <div className="navigation-buttons">
        <button onClick={handleBackToMenu} className="menu-button">
          Kembali ke Menu
        </button>
      </div>
    </motion.div>
  );
}
