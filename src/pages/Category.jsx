import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Category.css";

// Define the order in which categories should be unlocked
const categoryOrder = ["addition", "subtraction", "multiplication", "division"];

// Definisikan terjemahan kategori untuk tampilan
const categoryTranslations = {
  "addition": "penjumlahan",
  "subtraction": "pengurangan",
  "multiplication": "perkalian",
  "division": "pembagian"
};

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bubbles, setBubbles] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [completedOperations, setCompletedOperations] = useState({
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  });
  const [availableCategories, setAvailableCategories] = useState(categoryOrder); // All categories available by default

  useEffect(() => {
    // Generate random bubbles for background effect
    const generateBubbles = () => {
      const newBubbles = [];
      for (let i = 0; i < 15; i++) {
        newBubbles.push({
          id: i,
          left: `${Math.random() * 100}%`,
          size: `${Math.random() * 60 + 10}px`,
          delay: `${Math.random() * 15}s`,
          duration: `${Math.random() * 10 + 10}s`,
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();

    // Get chapter and level from query parameters
    const params = new URLSearchParams(location.search);
    const chapter = params.get("chapter");
    const level = params.get("level");

    if (chapter !== null && level !== null) {
      setCurrentChapter(parseInt(chapter));
      setCurrentLevel(parseInt(level));

      // Also store in localStorage
      localStorage.setItem("currentBabIndex", chapter);
      localStorage.setItem("currentLevelIndex", level);
    } else {
      // Try to get from localStorage if not in URL
      const storedChapter = localStorage.getItem("currentBabIndex");
      const storedLevel = localStorage.getItem("currentLevelIndex");

      if (storedChapter && storedLevel) {
        setCurrentChapter(parseInt(storedChapter));
        setCurrentLevel(parseInt(storedLevel));
      }
    }

    // Get selected avatar from localStorage
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      setSelectedAvatar(JSON.parse(savedAvatar));
    }

    // Check which operations have been completed for this level
    checkCompletedOperations();
  }, [location]);

  // Function to check which operations have been completed for the current level
  const checkCompletedOperations = () => {
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (!savedAvatar) return;

    const avatar = JSON.parse(savedAvatar);
    setSelectedAvatar(avatar); // Set the avatar in state

    const avatarOperationsKey = `avatar_${avatar.name}_operations`;
    const operationData =
      JSON.parse(localStorage.getItem(avatarOperationsKey)) || {};

    const chapter = localStorage.getItem("currentBabIndex");
    const level = localStorage.getItem("currentLevelIndex");
    const levelKey = `bab${chapter}_level${level}`;

    // Check each operation type and update state
    const completed = {
      addition: false,
      subtraction: false,
      multiplication: false,
      division: false,
    };

    // Look through all operations to find matches for this level
    Object.entries(operationData).forEach(([key, operation]) => {
      if (key === levelKey) {
        if (operation === "addition") completed.addition = true;
        if (operation === "subtraction") completed.subtraction = true;
        if (operation === "multiplication") completed.multiplication = true;
        if (operation === "division") completed.division = true;
      }
    });

    setCompletedOperations(completed);

    // Set all categories as available (lock feature disabled)
    setAvailableCategories(categoryOrder);
  };

  const handleCategoryClick = (category, type) => {
    if (type === "materi") {
      // Navigate to materi page with the selected category
      navigate(`/materi/${category}`);
    } else if (type === "soal") {
      // Gunakan nama file bahasa Indonesia
      if (category === "addition") {
        navigate(`/game/penjumlahan`);
      } else if (category === "subtraction") {
        navigate(`/game/pengurangan`);
      } else if (category === "multiplication") {
        navigate(`/game/perkalian`);
      } else if (category === "division") {
        navigate(`/game/pembagian`);
      }
    }
  };

  // Function to check if a category is available (always returns true now)
  const isCategoryAvailable = (category) => {
    return true; // All categories are now available
  };

  return (
    <div className="category-container">
      {/* Background bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        />
      ))}

      <div className="header2">
        <h1>
          Halo {selectedAvatar ? selectedAvatar.name : "Tamu"}{" "}
          <span className="wave">👋</span>
        </h1>
        <p>Silahkan pilih kategori yang ingin kamu pelajari</p>
        <p className="level-info">
          Bab {currentChapter + 1} Level {currentLevel + 1}
        </p>
      </div>

      <div className="categories-section">
        <h2>Kategori</h2>

        <div className="categories-grid">
          <div className="category-item">
            <div
              className={`category-circle addition ${
                completedOperations.addition ? "completed" : ""
              }`}
            >
              <span className="category-symbol">2+2</span>
              {completedOperations.addition && (
                <div className="completed-check">✓</div>
              )}
            </div>
            <p className="category-name">{categoryTranslations.addition}</p>
            <div className="category-buttons">
              <button
                className="btn-materi"
                onClick={() => handleCategoryClick("addition", "materi")}
              >
                Materi
              </button>
              <button
                className="btn-soal"
                onClick={() => handleCategoryClick("addition", "soal")}
              >
                Soal
              </button>
            </div>
          </div>

          <div className="category-item">
            <div
              className={`category-circle substraction ${
                completedOperations.subtraction ? "completed" : ""
              }`}
            >
              <span className="category-symbol">2-2</span>
              {completedOperations.subtraction && (
                <div className="completed-check">✓</div>
              )}
            </div>
            <p className="category-name">{categoryTranslations.subtraction}</p>
            <div className="category-buttons">
              <button
                className="btn-materi"
                onClick={() => handleCategoryClick("subtraction", "materi")}
              >
                Materi
              </button>
              <button
                className="btn-soal"
                onClick={() => handleCategoryClick("subtraction", "soal")}
              >
                Soal
              </button>
            </div>
          </div>

          <div className="category-item">
            <div
              className={`category-circle division ${
                completedOperations.division ? "completed" : ""
              }`}
            >
              <span className="category-symbol">10/5</span>
              {completedOperations.division && (
                <div className="completed-check">✓</div>
              )}
            </div>
            <p className="category-name">{categoryTranslations.division}</p>
            <div className="category-buttons">
              <button
                className="btn-materi"
                onClick={() => handleCategoryClick("division", "materi")}
              >
                Materi
              </button>
              <button
                className="btn-soal"
                onClick={() => handleCategoryClick("division", "soal")}
              >
                Soal
              </button>
            </div>
          </div>

          <div className="category-item">
            <div
              className={`category-circle multiplication ${
                completedOperations.multiplication ? "completed" : ""
              }`}
            >
              <span className="category-symbol">2×2</span>
              {completedOperations.multiplication && (
                <div className="completed-check">✓</div>
              )}
            </div>
            <p className="category-name">{categoryTranslations.multiplication}</p>
            <div className="category-buttons">
              <button
                className="btn-materi"
                onClick={() => handleCategoryClick("multiplication", "materi")}
              >
                Materi
              </button>
              <button
                className="btn-soal"
                onClick={() => handleCategoryClick("multiplication", "soal")}
              >
                Soal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
