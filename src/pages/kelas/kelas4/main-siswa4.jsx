import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./style/siswa4.css";
import bronzeBadge from "../../../assets/bronze.PNG";
import silverBadge from "../../../assets/silver.PNG";
import goldBadge from "../../../assets/gold.PNG";
import backgroundImage from "../../../assets/mainsiswa.jpg";
import supabase from "../../../config/supabase";
import { getGameProgress } from "../../../services/gameProgressService";

// Definisi struktur game yang sebenarnya
const gameStructure = {
  1: { levels: 4, title: "Bab 1", description: "Bilangan Cacah" },
  2: { levels: 4, title: "Bab 2", description: "Operasi Hitung" },
  3: { levels: 2, title: "Bab 3", description: "Kelipatan dan Faktor" },
  4: { levels: 2, title: "Bab 4", description: "Pengukuran" },
  5: { levels: 1, title: "Bab 5", description: "Statistika" },
  6: { levels: 1, title: "Bab 6", description: "Pengolahan Data" }
};

const TOTAL_LEVELS = 14; // Total semua level
const BRONZE_THRESHOLD = 30; // 30% untuk Bronze
const SILVER_THRESHOLD = 60; // 60% untuk Silver
const GOLD_THRESHOLD = 100;  // 100% untuk Gold

export default function MainSiswa4() {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [chapterProgress, setChapterProgress] = useState({});
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [userData, setUserData] = useState({
    completedLevels: 0,
    totalScore: 0,
    averageScore: 0
  });
  const [completedCategoriesMap, setCompletedCategoriesMap] = useState({});
  const navigate = useNavigate();

  // Fungsi untuk mengambil progress dari database
  const fetchGameProgress = async (userId) => {
    try {
      let totalCompleted = 0;
      let totalScore = 0;
      let completedGames = 0;
      const chaptersProgress = {};

      // Iterasi setiap bab
      for (const [bab, structure] of Object.entries(gameStructure)) {
        chaptersProgress[bab] = {
          completed: 0,
          totalLevels: structure.levels,
          scores: []
        };

        // Iterasi setiap level dalam bab
        for (let level = 1; level <= structure.levels; level++) {
          const progress = await getGameProgress(4, parseInt(bab), level);
          
          if (progress) {
            if (progress.status_selesai) {
              totalCompleted++;
              chaptersProgress[bab].completed++;
            }
            if (progress.skor) {
              chaptersProgress[bab].scores.push(progress.skor);
              totalScore += progress.skor;
              completedGames++;
            }
          }
        }
      }

      // Hitung progress global dan rata-rata skor
      const globalProgressPercent = (totalCompleted / TOTAL_LEVELS) * 100;
      const averageScore = completedGames > 0 ? totalScore / completedGames : 0;

      // Update state
      setGlobalProgress(globalProgressPercent);
      setChapterProgress(chaptersProgress);
      setUserData({
        completedLevels: totalCompleted,
        totalScore: totalScore,
        averageScore: averageScore
      });

    } catch (error) {
      console.error('Error fetching game progress:', error);
    }
  };

  useEffect(() => {
    console.log("MainSiswa4 mounted");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#333333";
    
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const userDataString = localStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    
    if (userData && userData.nama) {
      setSelectedAvatar({ name: userData.nama });
      if (userData.id_siswa) {
        fetchGameProgress(userData.id_siswa);
      }
    } else {
      console.warn("No user data found in localStorage");
      navigate("/login");
      return;
    }

    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      setSelectedAvatar({
        ...avatar,
        displayName: userData.nama
      });
    }
  }, [navigate]);

  // Fungsi untuk mendapatkan total level dalam satu bab
  const getLevelsInChapter = (chapterIndex) => {
    return gameStructure[chapterIndex + 1].levels;
  };

  // Fungsi untuk mengecek apakah level sudah selesai
  const isLevelCompleted = (chapterIndex, levelIndex) => {
    const bab = chapterIndex + 1;
    const level = levelIndex + 1;
    return completedCategoriesMap[`bab${bab}_level${level}`] || false;
  };

  // Fungsi untuk mendapatkan progress level dalam persen
  const getLevelProgress = (chapterIndex, levelIndex) => {
    return isLevelCompleted(chapterIndex, levelIndex) ? 100 : 0;
  };

  // Modified to handle both direct navigation for Bab 1 and popup for other chapters
  const handleChapterClick = (index) => {
    if (index === 0) {
      // For Bab 1, navigate directly to Category4_Bab1.jsx
      localStorage.setItem("currentBabIndex", 0);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category4_bab1`); // Change to directly navigate to category4_bab1
    } else if (index === 1) {
      // For Bab 2, navigate directly to Category4_Bab2.jsx
      localStorage.setItem("currentBabIndex", 1);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category4_bab2`); // Navigate to category4_bab2
    } else if (index === 2) {
      // For Bab 3, navigate directly to Category4_Bab3.jsx
      localStorage.setItem("currentBabIndex", 2);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category4_bab3`); // Navigate to category4_bab3
    } else if (index === 3) {
      // For Bab 4, navigate directly to Category4_Bab4.jsx 
      localStorage.setItem("currentBabIndex", 3);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category4_bab4`); // Navigate to category4_bab4
    } else if (index === 4) {
      // For Bab 5, navigate directly to Category4_Bab5.jsx 
      localStorage.setItem("currentBabIndex", 4);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category4_bab5`); // Navigate to category4_bab5
    } else if (index === 5) {
      // For Bab 6, navigate directly to Category4_Bab6.jsx 
      localStorage.setItem("currentBabIndex", 5);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category4_bab6`); // Navigate to category4_bab6
    } else {
      // For other chapters, show the popup
      setSelectedChapter(index);
    }
  };

  const handleLevelClick = (chapterIndex, levelIndex) => {
    // Simpan informasi bab dan level ke localStorage
    localStorage.setItem("currentBabIndex", chapterIndex);
    localStorage.setItem("currentLevelIndex", levelIndex);

    // Navigasi ke halaman materi dengan parameter untuk identifikasi
    navigate(`/category?chapter=${chapterIndex}&level=${levelIndex}`);
  };

  const handleClosePopup = () => {
    setSelectedChapter(null);
  };

  // Fitur logout
  const handleLogout = () => {
    // Hapus status login tetapi simpan avatar
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleViewScore = () => {
    navigate("/skor");
  };

  // Render progress bar dengan milestone markers
  const renderProgressBar = () => (
    <div className="progress-container" style={{ 
      position: "relative", 
      zIndex: 1, 
      backgroundColor: "transparent",
      padding: "15px"
    }}>
      <div className="progress-info" style={{ color: "white" }}>
        <p>Progress <strong>{selectedAvatar ? selectedAvatar.displayName : "Siswa"}</strong>: {Math.round(globalProgress)}%</p>
        <p>Game Selesai: <strong>{userData.completedLevels}</strong> dari {TOTAL_LEVELS}</p>
        {userData.averageScore > 0 && (
          <p>Rata-rata Skor: <strong>{Math.round(userData.averageScore)}</strong></p>
        )}
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="progress-bar" style={{ 
        position: "relative", 
        marginBottom: "20px",
        width: "90%",
        margin: "0 auto 30px auto",
        height: "15px",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <motion.div
          className="progress"
          style={{
            width: `${globalProgress}%`,
            height: "100%",
            backgroundColor: "#ff5722",
            borderRadius: "10px",
            transition: "width 0.5s ease-out"
          }}
          initial={{ width: 0 }}
          animate={{ width: `${globalProgress}%` }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Milestone markers */}
        <div style={{ 
          position: "absolute", 
          left: `${BRONZE_THRESHOLD}%`, 
          top: -2, 
          bottom: -2, 
          width: "3px", 
          backgroundColor: "#cd7f32",
          transform: "translateX(-50%)"
        }} />
        <div style={{ 
          position: "absolute", 
          left: `${SILVER_THRESHOLD}%`, 
          top: -2, 
          bottom: -2, 
          width: "3px", 
          backgroundColor: "#c0c0c0",
          transform: "translateX(-50%)"
        }} />
        <div style={{ 
          position: "absolute", 
          right: "0", 
          top: -2, 
          bottom: -2, 
          width: "3px", 
          backgroundColor: "#ffd700",
          transform: "translateX(50%)"
        }} />
      </div>

      {/* Badges */}
      <div style={{ 
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "30px",
        position: "relative",
        padding: "0",
        height: "70px",
        width: "90%",
        margin: "0 auto",
        overflow: "visible"
      }}>
        {/* Bronze Badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          position: "absolute",
          left: `${BRONZE_THRESHOLD}%`, 
          transform: "translateX(-50%)"
        }}>
          <img 
            src={bronzeBadge} 
            alt="Bronze Badge" 
            style={{
              width: "60px",
              height: "60px",
              marginRight: "10px",
              opacity: globalProgress >= BRONZE_THRESHOLD ? "1" : "0.4",
              filter: globalProgress >= BRONZE_THRESHOLD ? "none" : "grayscale(80%)",
              transition: "all 0.3s ease"
            }} 
          />
          <div>
            <p style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: "0.9rem",
              textAlign: "left",
              opacity: globalProgress >= BRONZE_THRESHOLD ? "1" : "0.6"
            }}>Bronze</p>
            <p style={{
              margin: "2px 0 0 0",
              fontSize: "0.8rem",
              textAlign: "left",
              color: globalProgress >= BRONZE_THRESHOLD ? "#ff5722" : "#999999"
            }}>{BRONZE_THRESHOLD}%</p>
          </div>
        </div>

        {/* Silver Badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          position: "absolute",
          left: `${SILVER_THRESHOLD}%`, 
          transform: "translateX(-50%)"
        }}>
          <img 
            src={silverBadge} 
            alt="Silver Badge" 
            style={{
              width: "60px",
              height: "60px",
              marginRight: "10px",
              opacity: globalProgress >= SILVER_THRESHOLD ? "1" : "0.4",
              filter: globalProgress >= SILVER_THRESHOLD ? "none" : "grayscale(80%)",
              transition: "all 0.3s ease"
            }}
          />
          <div>
            <p style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: "0.9rem",
              textAlign: "left",
              opacity: globalProgress >= SILVER_THRESHOLD ? "1" : "0.6"
            }}>Silver</p>
            <p style={{
              margin: "2px 0 0 0",
              fontSize: "0.8rem",
              textAlign: "left",
              color: globalProgress >= SILVER_THRESHOLD ? "#ff5722" : "#999999"
            }}>{SILVER_THRESHOLD}%</p>
          </div>
        </div>

        {/* Gold Badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          position: "absolute",
          left: "100%", 
          transform: "translateX(-50%)"
        }}>
          <img 
            src={goldBadge} 
            alt="Gold Badge" 
            style={{
              width: "60px",
              height: "60px",
              marginRight: "10px",
              opacity: globalProgress >= GOLD_THRESHOLD ? "1" : "0.4",
              filter: globalProgress >= GOLD_THRESHOLD ? "none" : "grayscale(80%)",
              transition: "all 0.3s ease"
            }}
          />
          <div>
            <p style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: "0.9rem",
              textAlign: "left",
              opacity: globalProgress >= GOLD_THRESHOLD ? "1" : "0.6"
            }}>Gold</p>
            <p style={{
              margin: "2px 0 0 0",
              fontSize: "0.8rem",
              textAlign: "left",
              color: globalProgress >= GOLD_THRESHOLD ? "#ff5722" : "#999999"
            }}>{GOLD_THRESHOLD}%</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-siswa-container" style={{
      color: "#333333",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative"
    }}>
      <header className="header-siswa" style={{ position: "relative", zIndex: 1 }}>        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            color: "#ff5722", 
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
          }}
        >
          Game Matematika Siswa
        </motion.h1>

        {/* Avatar dan menu profil */}
        <div className="profile-section">
          <div className="profile-icon">
            {selectedAvatar ? (
              <img
                src={selectedAvatar.src}
                alt={selectedAvatar.displayName || selectedAvatar.name}
                className="avatar-image"
              />
            ) : (
              "👤"
            )}
          </div>
          <div className="profile-actions">
            <button onClick={handleViewScore} className="score-button">
              Lihat Progres
            </button>
            <button onClick={handleLogout} className="logout-button">
              Keluar
            </button>          </div>
        </div>
      </header>

      {/* Render progress bar */}
      {renderProgressBar()}

      <div className="chapter-buttons"style={{ position: "relative", zIndex: 1 }}>
        {Object.entries(gameStructure).map(([bab, info], index) => (          <motion.button
            key={bab}
            className="big-chapter-button"
            onClick={() => handleChapterClick(parseInt(bab) - 1)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index }}            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              textShadow: "1px 1px 2px black",
              padding: "25px 15px 15px",
              fontSize: "1.5rem",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
            <div>{info.title}</div>
            <div style={{ fontSize: "1rem", opacity: 0.8 }}>{info.description}</div>
            {chapterProgress[bab] && (
              <div style={{ 
                fontSize: "0.9rem", 
                marginTop: "8px",
                color: chapterProgress[bab].completed === info.levels ? "#4CAF50" : "#FFA726"
              }}>
                {chapterProgress[bab].completed}/{info.levels} Selesai
              </div>
            )}
          </motion.button>
        ))}
      </div>      {selectedChapter !== null && selectedChapter !== 0 && (
        <div className="popup-overlay" style={{ 
          zIndex: 10, 
          backgroundColor: "rgba(0, 0, 0, 0.7)" 
        }}>
          <motion.div
            className="popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ 
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "2px solid #ff5722",
              color: "white"
            }}
          >            <h2>{gameStructure[selectedChapter + 1].title}</h2>

            <div className="levels">
              {gameStructure[selectedChapter + 1].levels.map((level, levelIndex) => (
                <div key={levelIndex} className="level-container">
                  <button
                    className={`level-button ${
                      isLevelCompleted(selectedChapter, levelIndex)
                        ? "level-completed"
                        : ""
                    }`}
                    onClick={() =>
                      handleLevelClick(selectedChapter, levelIndex)
                    }                  >
                    {level}
                  </button>
                </div>
              ))}
            </div>

            <button className="close-popup-button" onClick={handleClosePopup}>
              ✖ Kembali ke Menu
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
