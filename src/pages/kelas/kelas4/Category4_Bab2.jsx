import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./style/Category4.css";
import confetti from "react-confetti";
import supabase from "../../../config/supabase";
import { getGameProgress } from "../../../services/gameProgressService";

// Define the levels data with icons, colors and content
const levels = [
  {
    id: 1,
    title: "Level 1",
    description: "Pengenalan Operasi Hitung",
    icon: "🔍",
    color: "#4E6BFF",
    gradient: "linear-gradient(135deg, #4E6BFF, #8393FF)",
    subChapters: [
      { id: 1, title: "Pembilang Satu", icon: "📝" },
      { id: 2, title: "Menyebut Pecahan Yang Penyebutnya Sama", icon: "📊" },
    ],
    games: [
      {
        id: 1,
        title: "Permainan Mencari Pecahan Dan Pembilang",
        path: "/game/kelas4/bab2/level1",
        icon: "🎲",
      },
    ],
  },
  {
    id: 2,
    title: "Level 2",
    description: "Pengukuran & Pola",
    icon: "📏",
    color: "#FF5733",
    gradient: "linear-gradient(135deg, #FF5733, #FF9A7A)",
    subChapters: [
      { id: 3, title: "Mengurutkan dan Membandingkan Pecahan", icon: "🧩" },
      { id: 4, title: "Pecahan Senilai", icon: "🔢" },
    ],
    games: [
      {
        id: 3,
        title: "Tantangan Mengurutkan Dan Pecahan Senilai",
        path: "/game/kelas4/bab2/level2",
        icon: "🎯",
      },
    ],
  },
  {
    id: 3,
    title: "Level 3",
    description: "Operasi Kompleks",
    icon: "🧮",
    color: "#9C27B0",
    gradient: "linear-gradient(135deg, #9C27B0, #D066E2)",
    subChapters: [
      { id: 5, title: "Pecahan Desimal", icon: "✖️" },
      { id: 6, title: "Pecahan Desimal: Persepuluhan", icon: "➗" },
    ],
    games: [
      {
        id: 5,
        title: "Menghitung Pecahan Desimal Sampai Perespuluhan",
        path: "/game/kelas4/bab2/level3",
        icon: "🧩",
      },
    ],
  },
  {
    id: 4,
    title: "Level 4",
    description: "Evaluasi & Penerapan",
    icon: "🏆",
    color: "#009688",
    gradient: "linear-gradient(135deg, #009688, #4DB6AC)",
    subChapters: [
      { id: 7, title: "Pecahan Desimal: Perseratusan dan Persen", icon: "📊" },
      { id: 8, title: "Rangkuman Singkat", icon: "📝" },
    ],
    games: [
      {
        id: 7,
        title: "Game Latihan Pecahan Desimal",
        path: "/game/kelas4/bab2/level4",
        icon: "🎮",
      },
    ],
    locked: false,
  },
];

export default function Category4_Bab2() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [completedLevels, setCompletedLevels] = useState([]);
  const [animateBackground, setAnimateBackground] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [levelStatus, setLevelStatus] = useState({});

  // Create refs for level 1 elements
  const level1Ref = useRef(null);

  // Generate stars for background effect
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  // Generate clouds for background effect
  const clouds = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 150 + 100,
    left: Math.random() * 100,
    top: Math.random() * 20 + 10,
    speed: Math.random() * 100 + 50,
    delay: Math.random() * 20,
  }));

  // Add new function to check completion status
  const checkLevelCompletion = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.id_siswa) return;

      const completionStatus = {};
      
      // Check each level's completion status
      for (const level of levels) {
        const progress = await getGameProgress(4, 2, level.id);
        completionStatus[level.id] = progress?.status_selesai || false;
      }

      setLevelStatus(completionStatus);
    } catch (error) {
      console.error("Error checking level completion:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Load user progress from localStorage
    const avatar = JSON.parse(localStorage.getItem("selectedAvatar"));
    if (avatar) {
      // Add category identifier (bab2) to make progress tracking category-specific
      const progressKey = `avatar_${avatar.name}_bab2_levels_progress`;
      const savedProgress = JSON.parse(localStorage.getItem(progressKey)) || {};
      setUserProgress(savedProgress);

      // Calculate completed levels
      const completed = levels
        .filter(
          (level) =>
            !level.locked && savedProgress[`level_${level.id}`]?.completed
        )
        .map((level) => level.id);

      setCompletedLevels(completed);
    }

    // Show a hint after 3 seconds if no level is selected
    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 3000);

    checkLevelCompletion();

    return () => {
      clearTimeout(hintTimer);
    };
  }, [navigate]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleLevelClick = (level) => {
    if (level.locked) {
      // Show a message that this level is locked
      alert("Level ini terkunci! Selesaikan level sebelumnya terlebih dahulu.");
      return;
    }

    // Trigger background animation when level is clicked
    setAnimateBackground(true);

    // Trigger confetti for completed levels
    if (completedLevels.includes(level.id)) {
      triggerConfetti();
    }

    setSelectedLevel(level);
    setShowPopup(true);
    setShowHint(false);
  };

  // Add a direct way to open Level 1
  const openLevel1 = () => {
    const level1 = levels.find((level) => level.id === 1);
    if (level1) {
      setSelectedLevel(level1);
      setShowPopup(true);
      setShowHint(false);
      setAnimateBackground(true);
      if (completedLevels.includes(1)) {
        triggerConfetti();
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      setSelectedLevel(null);
      setAnimateBackground(false);
    }, 300);
  };

  const handleSubChapterClick = (subChapter) => {
    // Navigate to the corresponding materi page based on the subChapter id and title
    if (subChapter.title === "Pembilang Satu") {
      navigate(`/materi/materikelas4/materiBab2_1`);
    } else if (subChapter.title === "Menyebut Pecahan Yang Penyebutnya Sama") {
      navigate(`/materi/materikelas4/materiBab2_2`);
    } else if (subChapter.title === "Mengurutkan dan Membandingkan Pecahan") {
      navigate(`/materi/materikelas4/materiBab2_3`);
    } else if (subChapter.title === "Pecahan Senilai") {
      navigate(`/materi/materikelas4/materiBab2_4`);
    } else if (subChapter.title === "Pecahan Desimal") {
      navigate(`/materi/materikelas4/materiBab2_5`);
    } else if (subChapter.title === "Pecahan Desimal: Persepuluhan") {
      navigate(`/materi/materikelas4/materiBab2_6`);
    } else if (
      subChapter.title === "Pecahan Desimal: Perseratusan dan Persen"
    ) {
      navigate(`/materi/materikelas4/materiBab2_7`);
    } else {
      // For other sub chapters, use the original path format
      navigate(`/materi/materikelas4/materiBab1_${subChapter.id}`);
    }
  };

  const handleGameClick = (game) => {
    // Navigate to the game page
    navigate(game.path);
  };

  const handleBackClick = () => {
    // Add exit animation before navigating
    setAnimateBackground(true);
    setTimeout(() => {
      navigate("/kelas4");
    }, 500);
  };

  // Update isLevelCompleted function
  const isLevelCompleted = (levelNum) => {
    return levelStatus[levelNum] || false;
  };

  return (
    <div
      className={`category-container ${animateBackground ? "animate-bg" : ""}`}
    >
      {/* Background elements for visual appeal */}
      <div className="background-elements">
        {stars.map((star) => (
          <div
            key={`star-${star.id}`}
            className="star"
            style={{
              width: star.size + "px",
              height: star.size + "px",
              left: star.left + "%",
              top: star.top + "%",
              animationDelay: star.delay + "s",
              animationDuration: star.duration + "s",
            }}
          />
        ))}

        {clouds.map((cloud) => (
          <div
            key={`cloud-${cloud.id}`}
            className="cloud"
            style={{
              width: cloud.size + "px",
              height: cloud.size / 2 + "px",
              left: cloud.left + "%",
              top: cloud.top + "%",
              animationDuration: cloud.speed + "s",
              animationDelay: cloud.delay + "s",
            }}
          />
        ))}
      </div>

      <header className="header animated-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          BAB 2 <span className="wave">🧮</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="header-tagline"
        >
          Pilih level untuk memulai perjalanan belajar matematika!
        </motion.p>
      </header>

      <section className="categories-section">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="category-icon">📚</span> Bab 2: Operasi Hitung
        </motion.h2>

        {/* Hint bubble */}
        <motion.button
          className="back-button"
          onClick={handleBackClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Kembali
        </motion.button>
        <AnimatePresence>
          {showHint && (
            <motion.div
              className="hint-bubble"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="hint-arrow"></div>
              <p>Klik kartu level untuk mulai belajar!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="level-path">
          {levels.map((level, index) => (
            <React.Fragment key={`path-${level.id}`}>
              {index > 0 && (
                <div
                  className={`path-connector ${
                    completedLevels.includes(level.id - 1)
                      ? "completed-path"
                      : ""
                  }`}
                >
                  {completedLevels.includes(level.id - 1) && (
                    <div className="path-progress-animation"></div>
                  )}
                </div>
              )}
              <div
                className={`path-node ${
                  isLevelCompleted(level.id) ? "completed-node" : ""
                } ${level.locked ? "locked-node" : ""}`}
                onClick={() => handleLevelClick(level)}
              >
                {level.id}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="level-grid">
          {levels.map((level) => (
            <motion.div
              key={level.id}
              className={`level-card ${level.locked ? "level-locked" : ""} ${
                level.id === 1 ? "level1-card" : ""
              }`}
              onClick={() =>
                level.id === 1 ? openLevel1() : handleLevelClick(level)
              }
              whileHover={!level.locked ? { scale: 1.05, y: -5 } : {}}
              whileTap={!level.locked ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * level.id }}
              style={{
                boxShadow:
                  level.id === 1
                    ? `0 8px 25px rgba(78, 107, 255, 0.4)`
                    : `0 8px 20px rgba(0, 0, 0, 0.15)`,
              }}
              ref={level.id === 1 ? level1Ref : null}
            >
              <div
                className={`level-icon-circle ${
                  isLevelCompleted(level.id) ? "completed" : ""
                } ${level.id === 1 ? "level1-icon" : ""}`}
                style={{ background: level.gradient }}
              >
                {level.locked && <div className="lock-overlay">🔒</div>}
                {isLevelCompleted(level.id) && (
                  <div className="completed-check">✓</div>
                )}
                <span className="level-symbol">{level.icon}</span>
              </div>
              <h3 className="level-title">{level.title}</h3>
              <p className="level-description">{level.description}</p>
              <div className="level-info">
                <span className="info-item">
                  <i className="info-icon">📚</i> {level.subChapters.length} Sub
                  Bab
                </span>
                <span className="info-item">
                  <i className="info-icon">🎮</i> {level.games.length} Game
                </span>
              </div>

              <div className="level-badge" style={{ background: level.color }}>
                {level.id}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Level Popup Dialog */}
      <AnimatePresence>
        {showPopup && selectedLevel && (
          <motion.div
            className="popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          >
            <motion.div
              className="level-popup"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                background: `linear-gradient(to bottom right, white, #f9f9f9)`,
                borderTop: `5px solid ${selectedLevel.color}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="close-popup"
                onClick={closePopup}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                ✕
              </motion.button>

              <div
                className="popup-header"
                style={{ background: selectedLevel.gradient }}
              >
                <div className="popup-level-icon">{selectedLevel.icon}</div>
                <h2>
                  Level {selectedLevel.id}: {selectedLevel.title}
                </h2>
              </div>

              <div className="popup-sections">
                <div className="popup-section">
                  <h3>
                    <span className="section-icon">📚</span>
                    Sub-Bab Materi
                  </h3>
                  <div className="sub-chapter-list">
                    {selectedLevel.subChapters.map((subChapter) => (
                      <motion.div
                        key={subChapter.id}
                        className="sub-chapter-item"
                        onClick={() => handleSubChapterClick(subChapter)}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="sub-chapter-icon">
                          {subChapter.icon}
                        </div>
                        <div className="sub-chapter-content">
                          <div className="sub-chapter-number">
                            {subChapter.id}
                          </div>
                          <h4>{subChapter.title}</h4>
                        </div>
                        <div className="sub-chapter-arrow">→</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="popup-section">
                  <h3>
                    <span className="section-icon">🎮</span>
                    Game Latihan
                  </h3>
                  <div className="game-list">
                    {selectedLevel.games.map((game) => (
                      <motion.div
                        key={game.id}
                        className="game-item"
                        onClick={() => handleGameClick(game)}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="game-icon">{game.icon}</div>
                        <div className="game-content">
                          <h4>{game.title}</h4>
                          <span className="game-label">Main Sekarang</span>
                        </div>
                        <div className="game-arrow">→</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="popup-footer">
                {isLevelCompleted(selectedLevel.id) ? (
                  <div className="level-status completed-status">
                    <span className="status-icon">✓</span> Level Selesai
                  </div>
                ) : (
                  <div className="level-status">
                    <span className="status-icon">⏳</span> Belum Selesai
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
