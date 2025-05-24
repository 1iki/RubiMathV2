import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./main-siswa.css";

const chapters = [
  { title: "Bab 1", levels: ["Level 1"] },
  { title: "Bab 2", levels: ["Level 1"] },
  { title: "Bab 3", levels: ["Level 1"] },
];

// Operations that need to be completed for each level
const operations = ["addition", "subtraction", "multiplication", "division"];

export default function MainSiswa() {
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
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage
    const userDataString = localStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    
    // Set selected avatar but use actual student name if available
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      setSelectedAvatar({
        ...avatar,
        displayName: userData?.nama || avatar.name // Use student name if available
      });

      // Get progress specific to this avatar
      const avatarKey = `avatar_${avatar.name}_levelScores`;
      const levelScores = JSON.parse(localStorage.getItem(avatarKey)) || {};

      // Get operations completed for each level
      const avatarOperationsKey = `avatar_${avatar.name}_operations`;
      const operationsData =
        JSON.parse(localStorage.getItem(avatarOperationsKey)) || {};

      // Maps to track completed categories for each level
      const categoriesCompletedMap = {};

      // Count completed levels based on operations completed
      let completedLevelsCount = 0;

      // Calculate chapter progress based on operations completed
      const newChapterProgress = Array(chapters.length).fill(0);

      // Process each chapter and level
      chapters.forEach((chapter, chapterIndex) => {
        let totalCategoriesInChapter =
          chapter.levels.length * operations.length;
        let completedCategoriesInChapter = 0;
        let chapterHasActivity = false;

        chapter.levels.forEach((_, levelIndex) => {
          const levelKey = `bab${chapterIndex}_level${levelIndex}`;
          const completedOperations = operationsData[levelKey] || [];

          categoriesCompletedMap[levelKey] = completedOperations;

          if (completedOperations.length === operations.length) {
            completedLevelsCount++;
          }

          completedCategoriesInChapter += completedOperations.length;
          if (completedOperations.length > 0) {
            chapterHasActivity = true;
          }
        });

        // Calculate progress percentage for this chapter
        newChapterProgress[chapterIndex] = chapterHasActivity
          ? (completedCategoriesInChapter / totalCategoriesInChapter) * 100
          : 0;
      });

      // Update UI with calculated progress
      setChapterProgress(newChapterProgress);
      setUserData({ completedLevels: completedLevelsCount });
      setCompletedCategoriesMap(categoriesCompletedMap);

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
    }
  }, [navigate]);

  const handleLevelClick = (chapterIndex, levelIndex) => {
    // Save chapter and level info to localStorage
    localStorage.setItem("currentBabIndex", chapterIndex);
    localStorage.setItem("currentLevelIndex", levelIndex);

    // Navigate to category page with parameters
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

    // Return percentage of completed categories out of 4 operations
    return (completedCategoriesMap[levelKey].length / operations.length) * 100;
  };

  // Function to check if a specific category is completed for a level
  const isCategoryCompleted = (chapterIndex, levelIndex, operation) => {
    if (!selectedAvatar) return false;

    const levelKey = `bab${chapterIndex}_level${levelIndex}`;
    return (
      completedCategoriesMap[levelKey] &&
      completedCategoriesMap[levelKey].includes(operation)
    );
  };

  return (
    <div className="main-siswa-container">
      <header className="header-siswa">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Game Matematika Siswa
        </motion.h1>

        {/* Avatar dan menu profil */}
        <div className="profile-section">
          <div className="profile-icon">
            {selectedAvatar ? (
              <img
                src={selectedAvatar.src}
                alt={selectedAvatar.displayName}
                className="avatar-image"
              />
            ) : (
              "👤"
            )}
          </div>
          <div className="progress-info">
            <p>
              Progress{" "}
              <strong>{selectedAvatar ? selectedAvatar.displayName : "Siswa"}</strong>:{" "}
              {Math.round(globalProgress)}%
            </p>
            <p>
              Level Selesai:{" "}
              <strong>{userData.completedLevels}</strong> dari{" "}
              {chapters.length * chapters[0].levels.length}
            </p>
          </div>
          </div>
      </header>

      <div className="progress-container">
        <div className="progress-info">
          <p>
            Progress{" "}
            <strong>{selectedAvatar ? selectedAvatar.name : "Siswa"}</strong>:{" "}
            {Math.round(globalProgress)}%
          </p>
          <p>
            Level Selesai:{" "}
            <strong>{userData.completedLevels}</strong> dari{" "}
            {chapters.length * chapters[0].levels.length}
          </p>
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress"
            style={{ width: `${globalProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${globalProgress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="chapter-buttons">
        {chapters.map((chapter, index) => (
          <motion.button
            key={index}
            className="big-chapter-button"
            onClick={() => setSelectedChapter(index)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index }}
          >
            {chapter.title}
            <div className="chapter-progress-indicator">
              <div className="chapter-progress-bar">
                <div
                  className="chapter-progress-fill"
                  style={{ width: `${chapterProgress[index]}%` }}
                ></div>
              </div>
              <span>{Math.round(chapterProgress[index])}%</span>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedChapter !== null && (
        <div className="popup-overlay">
          <motion.div
            className="popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>{chapters[selectedChapter].title}</h2>

            <div className="popup-progress-bar">
              <div
                className="popup-progress"
                style={{ width: `${chapterProgress[selectedChapter]}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.round(chapterProgress[selectedChapter])}% selesai
            </p>

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
                    <div className="level-progress-bar">
                      <div
                        className="level-progress-fill"
                        style={{
                          width: `${getLevelProgress(
                            selectedChapter,
                            levelIndex
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </button>

                  <div className="category-indicators">
                    {operations.map((operation, opIndex) => (
                      <div
                        key={opIndex}
                        className={`category-indicator ${
                          isCategoryCompleted(
                            selectedChapter,
                            levelIndex,
                            operation
                          )
                            ? "category-completed"
                            : ""
                        }`}
                        title={`${operation} ${
                          isCategoryCompleted(
                            selectedChapter,
                            levelIndex,
                            operation
                          )
                            ? "(completed)"
                            : "(not completed)"
                        }`}
                      >
                        {isCategoryCompleted(
                          selectedChapter,
                          levelIndex,
                          operation
                        ) && "✓"}
                      </div>
                    ))}
                  </div>
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
