import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import "../../../game.css";
import "../SingleLevel.css";

const PengukuranLuas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [babTitle, setBabTitle] = useState("Bab 4 Level 1 Pengukuran Luas");
  const totalQuestions = 5;

  // Set the currentLevelKey when component mounts
  useEffect(() => {
    // Extract level information from the URL path or location state
    // Default to bab3_level0 if no specific information is available
    const pathSegments = location.pathname.split("/");
    let babIndex = 3; // Bab 4 (0-indexed)
    let levelIndex = 0; // Level 1 (0-indexed)

    // Try to get babIndex and levelIndex from URL or state
    if (location.state && location.state.babIndex !== undefined) {
      babIndex = location.state.babIndex;
      levelIndex = location.state.levelIndex || 0;
    } else if (pathSegments.length >= 4) {
      // If URL format is like /materi/3/0 (bab 4, level 1)
      babIndex = parseInt(pathSegments[pathSegments.length - 2]) || 3;
      levelIndex = parseInt(pathSegments[pathSegments.length - 1]) || 0;
    }

    // Get query parameters from URL (for handling category links from main-siswa.jsx)
    const queryParams = new URLSearchParams(location.search);
    const queryBabIndex = queryParams.get("chapter");
    const queryLevelIndex = queryParams.get("level");

    if (queryBabIndex !== null && queryLevelIndex !== null) {
      babIndex = parseInt(queryBabIndex);
      levelIndex = parseInt(queryLevelIndex);
    }

    // Set the title with correct bab and level (add 1 for human-readable numbers)
    setBabTitle(`Bab ${babIndex + 1} Level ${levelIndex + 1} Pengukuran Luas`);

    // Save the current level key to localStorage
    const levelKey = `bab${babIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);

    // Save the operation type for this level
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      const avatarKey = `avatar_${avatar.name}_operations`;
      const operationData = JSON.parse(localStorage.getItem(avatarKey)) || {};
      operationData[levelKey] = "area_measurement";
      localStorage.setItem(avatarKey, JSON.stringify(operationData));

      // Save current operation for HasilPage
      localStorage.setItem("currentOperation", "area_measurement");
    }
  }, [location]);

  // Generate questions for area measurement
  useEffect(() => {
    const generateAreaQuestions = () => {
      const areaQuestions = [
        {
          question: "Berapa luas persegi dengan sisi 4 cm?",
          correctAnswer: "16 cm²",
          options: ["12 cm²", "16 cm²", "8 cm²", "20 cm²"],
          image: "/src/assets/pengukuran/persegi.png",
        },
        {
          question:
            "Berapa luas persegi panjang dengan panjang 5 cm dan lebar 3 cm?",
          correctAnswer: "15 cm²",
          options: ["15 cm²", "8 cm²", "12 cm²", "18 cm²"],
          image: "/src/assets/pengukuran/persegi-panjang.png",
        },
        {
          question:
            "Area pada gambar ini diukur dengan satuan persegi kecil. Berapa luas area tersebut?",
          correctAnswer: "9 satuan",
          options: ["9 satuan", "7 satuan", "8 satuan", "10 satuan"],
          image: "/src/assets/pengukuran/area-kotak.png",
        },
        {
          question: "Berapa luas segitiga dengan alas 6 cm dan tinggi 4 cm?",
          correctAnswer: "12 cm²",
          options: ["10 cm²", "12 cm²", "14 cm²", "24 cm²"],
          image: "/src/assets/pengukuran/segitiga.png",
        },
        {
          question:
            "Jika 1 ubin memiliki luas 1 m², berapa ubin yang dibutuhkan untuk menutupi lantai dengan panjang 3 m dan lebar 4 m?",
          correctAnswer: "12 ubin",
          options: ["7 ubin", "10 ubin", "12 ubin", "14 ubin"],
          image: "/src/assets/pengukuran/lantai.png",
        },
      ];

      // Shuffle question order
      for (let i = areaQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [areaQuestions[i], areaQuestions[j]] = [
          areaQuestions[j],
          areaQuestions[i],
        ];
      }

      return areaQuestions;
    };

    setQuestions(generateAreaQuestions());
  }, []);

  const handleAnswerClick = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);

    if (correct && selectedAnswer !== selectedOption) {
      // Hanya mainkan audio dan tampilkan confetti jika ini adalah pilihan baru yang benar
      setShowConfetti(true);
      setScore(score + 1);

      // Play success sound
      const successSound = new Audio("/src/assets/ding.mp3");
      successSound.play().catch((e) => console.log("Audio play failed:", e));
    } else if (!correct && selectedAnswer !== selectedOption) {
      // Hanya mainkan audio jika ini adalah pilihan baru yang salah
      // Play fail sound
      const failSound = new Audio("/src/assets/fail.mp3");
      failSound.play().catch((e) => console.log("Audio play failed:", e));
    }

    // Delayed reset
    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Navigate to results page with score
      navigate(`/hasil/${score}`, { state: { score, totalQuestions } });
    }
  };

  if (questions.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="game-container" style={{ backgroundColor: "#4CAF50" }}>
      {showConfetti && <ReactConfetti recycle={false} />}
      <div className="close-button">
        <button
          onClick={() => navigate("/category4_bab4")}
          style={{
            width: "35px",
            height: "35px",
            fontSize: "18px",
            borderRadius: "50%",
            background: "#32323e",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          &times;
        </button>
      </div>
      <div className="question-section">
        <h1
          className="game-title"
          style={{ color: "white", fontSize: "1.3rem", marginBottom: "10px" }}
        >
          {babTitle}
        </h1>
        <h2 className="question-count" style={{ fontSize: "1rem" }}>
          Pertanyaan {currentQuestion + 1} dari {totalQuestions}
        </h2>

        <div className="question-text">
          <h2 style={{ fontSize: "1.1rem", lineHeight: "1.4" }}>
            {currentQ.question}
          </h2>
          {currentQ.image && (
            <img
              src={currentQ.image}
              alt="Gambar soal"
              style={{
                maxWidth: "280px",
                maxHeight: "280px",
                margin: "15px 0",
              }}
            />
          )}
        </div>
        <div className="answer-options">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              className={`answer-button ${selectedAnswer === option
                  ? option === currentQ.correctAnswer
                    ? "correct"
                    : "incorrect"
                  : ""
                }`}
              onClick={() => handleAnswerClick(option)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ fontSize: "0.9rem", padding: "8px 12px" }}
            >
              {option}
            </motion.button>
          ))}
        </div>
        <div className="next-btn-container">
          <motion.button
            className={`next-button ${selectedAnswer === null ? "disabled" : ""
              }`}
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            style={{ fontSize: "0.9rem", padding: "10px 20px" }}
          >
            Pertanyaan Selanjutnya
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PengukuranLuas;
