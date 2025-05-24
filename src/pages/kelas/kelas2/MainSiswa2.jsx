import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./style/siswa2.css";
import bronzeBadge from "../../../assets/bronze.PNG";
import silverBadge from "../../../assets/silver.PNG";
import goldBadge from "../../../assets/gold.PNG";
import backgroundImage from "../../../assets/mainsiswa.jpg";

const chapters = [
  { title: "Bab 1", levels: ["Level 1"] },
  { title: "Bab 2", levels: ["Level 1"] },
  { title: "Bab 3", levels: ["Level 1"] },
  { title: "Bab 4", levels: ["Level 1"] },
  { title: "Bab 5", levels: ["Level 1"] },
  { title: "Bab 6", levels: ["Level 1"] },
];

export default function MainSiswa2() {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(
    Array(chapters.length).fill(0)
  );
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [userData, setUserData] = useState({
    completedLevels: 0,
  });
  const [completedCategoriesMap, setCompletedCategoriesMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Pastikan halaman terlihat dengan menambahkan logging
    console.log("MainSiswa2 mounted");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#333333";

    // Cek apakah user sudah login
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage
    const userDataString = localStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    
    // Ambil avatar tersimpan yang dipilih selama proses login
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      setSelectedAvatar({
        ...avatar,
        displayName: userData?.nama || avatar.name // Use student name if available
      });

      // Ambil progress yang spesifik untuk avatar ini
      const avatarKey = `avatar_${avatar.name}_levelScores`;
      const levelScores = JSON.parse(localStorage.getItem(avatarKey)) || {};

      // Menghitung level yang telah diselesaikan
      let completedLevelsCount = 0;

      // Calculate chapter progress based on completed levels
      const newChapterProgress = Array(chapters.length).fill(0);

      // Update UI with calculated progress
      setChapterProgress(newChapterProgress);
      setUserData({ completedLevels: completedLevelsCount });
      setCompletedCategoriesMap({});

      // Calculate global progress (average of all chapters)
      const totalProgress =
        newChapterProgress.reduce((acc, val) => acc + val, 0) / chapters.length;
      setGlobalProgress(totalProgress);

      // Save the new progress calculations
      const avatarProgressKey = `avatar_${avatar.name}_chapterProgress`;
      localStorage.setItem(
        avatarProgressKey,
        JSON.stringify(newChapterProgress)
      );
    } else {
      // Jika tidak ada avatar, gunakan data dari localStorage normal (backwards compatibility)
      const storedProgress =
        JSON.parse(localStorage.getItem("chapterProgress")) ||
        Array(chapters.length).fill(0);
      setChapterProgress(storedProgress);
      const totalProgress =
        storedProgress.reduce((acc, val) => acc + val, 0) / chapters.length;
      setGlobalProgress(totalProgress);
    }
  }, [navigate]);

  // Modified to handle both direct navigation for Bab 1 and popup for other chapters
  const handleChapterClick = (index) => {
    if (index === 0) {
      // For Bab 1, navigate directly to Category2_Bab1.jsx
      localStorage.setItem("currentBabIndex", 0);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category2_bab1`); // Change to directly navigate to category2_bab1
    } else if (index === 1) {
      // For Bab 2, navigate directly to Category2_Bab2.jsx
      localStorage.setItem("currentBabIndex", 1);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category2_bab2`); // Navigate to category2_bab2
    } else if (index === 2) {
      // For Bab 3, navigate directly to Category2_Bab3.jsx
      localStorage.setItem("currentBabIndex", 2);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category2_bab3`); // Navigate to category2_bab3
    } else if (index === 3) {
      // For Bab 4, navigate directly to Category2_Bab4.jsx
      localStorage.setItem("currentBabIndex", 3);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category2_bab4`); // Navigate to category2_bab4
    } else if (index === 4) {
      // For Bab 5, navigate directly to Category2_Bab5.jsx
      localStorage.setItem("currentBabIndex", 4);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category2_bab5`); // Navigate to category2_bab5
    } else if (index === 5) {
      // For Bab 6, navigate directly to Category2_Bab6.jsx
      localStorage.setItem("currentBabIndex", 5);
      localStorage.setItem("currentLevelIndex", 0);
      navigate(`/category2_bab6`); // Navigate to category2_bab6
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

  // Fungsi untuk mendapatkan status apakah level sudah diselesaikan
  const isLevelCompleted = (chapterIndex, levelIndex) => {
    if (!selectedAvatar) return false;

    const levelKey = `bab${chapterIndex}_level${levelIndex}`;
    return (
      completedCategoriesMap[levelKey] &&
      completedCategoriesMap[levelKey].length > 0
    );
  };

  // Function to get the level progress percentage
  const getLevelProgress = (chapterIndex, levelIndex) => {
    if (!selectedAvatar) return 0;

    const levelKey = `bab${chapterIndex}_level${levelIndex}`;
    if (!completedCategoriesMap[levelKey]) return 0;

    // Return percentage based on completion status
    return completedCategoriesMap[levelKey].length > 0 ? 100 : 0;
  };
  return (
    <div
      className="main-siswa-container"
      style={{
        color: "#333333",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      <header
        className="header-siswa"
        style={{ position: "relative", zIndex: 1 }}
      >
        {" "}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            color: "#ff5722",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
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
            </button>{" "}
          </div>
        </div>
      </header>
      <div
        className="progress-container"
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
          padding: "15px",
        }}
      >
        <div className="progress-info" style={{ color: "white" }}>
          <p>
            Progress{" "}
            <strong>{selectedAvatar ? selectedAvatar.displayName : "Siswa"}</strong>:{" "}
            {Math.round(globalProgress)}%
          </p>
          <p>
            Level Selesai: <strong>{userData.completedLevels}</strong> dari 9
          </p>
        </div>
        {/* Progress Bar with Milestone Markers */}
        <div
          className="progress-bar"
          style={{
            position: "relative",
            marginBottom: "20px",
            width: "90%",
            margin: "0 auto 30px auto",
            height: "15px", // Increased height of the progress bar
          }}
        >
          {" "}
          {/* Bronze marker at 30% */}
          <div
            style={{
              position: "absolute",
              left: "30%",
              top: -2,
              bottom: -2,
              width: "3px",
              backgroundColor: "#ff5722",
            }}
          ></div>
          {/* Silver marker at 60% */}
          <div
            style={{
              position: "absolute",
              left: "60%",
              top: -2,
              bottom: -2,
              width: "3px",
              backgroundColor: "#ff5722",
            }}
          ></div>
          {/* Gold marker at 100% */}
          <div
            style={{
              position: "absolute",
              right: "0",
              top: -2,
              bottom: -2,
              width: "3px",
              backgroundColor: "#ff5722",
            }}
          ></div>
          <motion.div
            className="progress"
            style={{ width: `${globalProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${globalProgress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        {/* Badges row below progress bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
            position: "relative",
            padding: "0",
            height: "70px", // Increased height
            width: "90%" /* Match progress bar width */,
            margin: "0 auto" /* Center like progress bar */,
            overflow:
              "visible" /* Allow badges to be visible if they overflow */,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              left: "30%",
              transform: "translateX(-50%)",
            }}
          >
            {" "}
            <img
              src={bronzeBadge}
              alt="Bronze Badge"
              style={{
                width: "60px",
                height: "60px",
                marginRight: "10px",
                opacity: globalProgress >= 30 ? "1" : "0.4",
                filter: globalProgress >= 30 ? "none" : "grayscale(80%)",
                transition: "all 0.3s ease",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  opacity: globalProgress >= 30 ? "1" : "0.6",
                }}
              >
                Bronze
              </p>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "0.8rem",
                  textAlign: "left",
                  color: globalProgress >= 30 ? "#ff5722" : "#999999",
                }}
              >
                30%
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              left: "60%",
              transform: "translateX(-50%)",
            }}
          >
            {" "}
            <img
              src={silverBadge}
              alt="Silver Badge"
              style={{
                width: "60px",
                height: "60px",
                marginRight: "10px",
                opacity: globalProgress >= 60 ? "1" : "0.4",
                filter: globalProgress >= 60 ? "none" : "grayscale(80%)",
                transition: "all 0.3s ease",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  opacity: globalProgress >= 60 ? "1" : "0.6",
                }}
              >
                Silver
              </p>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "0.8rem",
                  textAlign: "left",
                  color: globalProgress >= 60 ? "#ff5722" : "#999999",
                }}
              >
                60%
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              left: "calc(100% - 2px)" /* Adjust slightly to avoid overlapping right border */,
              transform: "translateX(-50%)",
            }}
          >
            {" "}
            <img
              src={goldBadge}
              alt="Gold Badge"
              style={{
                width: "60px",
                height: "60px",
                marginRight: "10px",
                opacity: globalProgress >= 100 ? "1" : "0.4",
                filter: globalProgress >= 100 ? "none" : "grayscale(80%)",
                transition: "all 0.3s ease",
              }}
            />
            <div style={{ whiteSpace: "nowrap" }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  opacity: globalProgress >= 100 ? "1" : "0.6",
                }}
              >
                Gold
              </p>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "0.8rem",
                  textAlign: "left",
                  color: globalProgress >= 100 ? "#ff5722" : "#999999",
                }}
              >
                100%
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="chapter-buttons"
        style={{ position: "relative", zIndex: 1 }}
      >
        {chapters.map((chapter, index) => (
          <motion.button
            key={index}
            className="big-chapter-button"
            onClick={() => handleChapterClick(index)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index }}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              // border: "2px solid #ff5722",
              color: "white",
              textShadow: "1px 1px 2px black",
              padding: "25px 15px 15px",
              fontSize: "1.5rem",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {chapter.title}
          </motion.button>
        ))}
      </div>{" "}
      {selectedChapter !== null && selectedChapter !== 0 && (
        <div
          className="popup-overlay"
          style={{
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <motion.div
            className="popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "2px solid #ff5722",
              color: "white",
            }}
          >
            {" "}
            <h2>{chapters[selectedChapter].title}</h2>
            <div className="levels">
              {chapters[selectedChapter].levels.map((level, levelIndex) => (
                <div key={levelIndex} className="level-container">
                  <button
                    className={`level-button ${
                      isLevelCompleted(selectedChapter, levelIndex)
                        ? "level-completed"
                        : ""
                    }`}
                    onClick={() =>
                      handleLevelClick(selectedChapter, levelIndex)
                    }
                  >
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
