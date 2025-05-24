import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import '../../../game.css';
import '../SingleLevel.css';

const PengukuranVolume = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [babTitle, setBabTitle] = useState('Bab 4 Level 2 Pengukuran Volume');
  const totalQuestions = 5;
  const [confettiConfig, setConfettiConfig] = useState({
    run: false,
    recycle: true,
    numberOfPieces: 500,
    gravity: 0.3
  });

  // Set the currentLevelKey when component mounts
  useEffect(() => {
    // Extract level information from the URL path or location state
    // Default to bab3_level1 if no specific information is available
    const pathSegments = location.pathname.split('/');
    let babIndex = 3; // Bab 4 (0-indexed)
    let levelIndex = 1; // Level 2 (0-indexed)

    // Try to get babIndex and levelIndex from URL or state
    if (location.state && location.state.babIndex !== undefined) {
      babIndex = location.state.babIndex;
      levelIndex = location.state.levelIndex || 1;
    } else if (pathSegments.length >= 4) {
      // If URL format is like /materi/3/1 (bab 4, level 2)
      babIndex = parseInt(pathSegments[pathSegments.length - 2]) || 3;
      levelIndex = parseInt(pathSegments[pathSegments.length - 1]) || 1;
    }

    // Get query parameters from URL (for handling category links from main-siswa.jsx)
    const queryParams = new URLSearchParams(location.search);
    const queryBabIndex = queryParams.get('chapter');
    const queryLevelIndex = queryParams.get('level');

    if (queryBabIndex !== null && queryLevelIndex !== null) {
      babIndex = parseInt(queryBabIndex);
      levelIndex = parseInt(queryLevelIndex);
    }

    // Set the title with correct bab and level (add 1 for human-readable numbers)
    setBabTitle(`Bab ${babIndex + 1} Level ${levelIndex + 1} Pengukuran Volume`);

    // Save the current level key to localStorage
    const levelKey = `bab${babIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);

    // Save the operation type for this level
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      const avatarKey = `avatar_${avatar.name}_operations`;
      const operationData = JSON.parse(localStorage.getItem(avatarKey)) || {};
      operationData[levelKey] = "volume_measurement";
      localStorage.setItem(avatarKey, JSON.stringify(operationData));

      // Save current operation for HasilPage
      localStorage.setItem("currentOperation", "volume_measurement");
    }
  }, [location]);

  // Generate questions for volume measurement
  useEffect(() => {
    const generateVolumeQuestions = () => {
      const volumeQuestions = [
        {
          question: "Berapa volume kubus dengan panjang sisi 3 cm?",
          correctAnswer: "27 cm³",
          options: ["9 cm³", "18 cm³", "27 cm³", "36 cm³"],
          image: "/src/assets/pengukuran/kubus.png"
        },
        {
          question: "Berapa volume balok dengan panjang 4 cm, lebar 3 cm, dan tinggi 2 cm?",
          correctAnswer: "24 cm³",
          options: ["18 cm³", "24 cm³", "30 cm³", "36 cm³"],
          image: "/src/assets/pengukuran/balok.png"
        },
        {
          question: "Jika sebuah gelas berbentuk silinder dengan jari-jari 3 cm dan tinggi 10 cm, berapakah volume gelas tersebut? (π = 3)",
          correctAnswer: "270 cm³",
          options: ["90 cm³", "180 cm³", "270 cm³", "360 cm³"],
          image: "/src/assets/pengukuran/gelas.png"
        },
        {
          question: "Berapa kubus satuan yang dibutuhkan untuk membentuk balok dengan panjang 3 kubus, lebar 2 kubus, dan tinggi 4 kubus?",
          correctAnswer: "24 kubus",
          options: ["14 kubus", "18 kubus", "24 kubus", "30 kubus"],
          image: "/src/assets/pengukuran/kubus-satuan.png"
        },
        {
          question: "Sebuah akuarium berbentuk balok memiliki panjang 50 cm, lebar 30 cm, dan tinggi 40 cm. Berapa liter air yang dapat ditampung akuarium tersebut? (1 liter = 1000 cm³)",
          correctAnswer: "60 liter",
          options: ["40 liter", "50 liter", "60 liter", "70 liter"],
          image: "/src/assets/pengukuran/akuarium.png"
        }
      ];

      // Shuffle question order
      for (let i = volumeQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [volumeQuestions[i], volumeQuestions[j]] = [volumeQuestions[j], volumeQuestions[i]];
      }

      return volumeQuestions;
    };

    setQuestions(generateVolumeQuestions());
  }, []);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);

    const isAnswerCorrect = answer === questions[currentQuestion].correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect && selectedAnswer !== answer) {
      setShowConfetti(true);
      setConfettiConfig({
        ...confettiConfig,
        run: true,
        recycle: true,
        numberOfPieces: 500
      });

      setScore(score + 1);

      // Play success sound
      const successSound = new Audio('/src/assets/ding.mp3');
      successSound.play().catch(e => console.log('Audio play failed:', e));

      // Hide confetti after 4 seconds
      setTimeout(() => {
        setConfettiConfig({
          ...confettiConfig,
          run: false
        });
        setTimeout(() => {
          setShowConfetti(false);
        }, 500);
      }, 2000);
    } else if (!isAnswerCorrect && selectedAnswer !== answer) {
      // Play fail sound
      const failSound = new Audio('/src/assets/fail.mp3');
      failSound.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      navigate(`/hasil/${score}`, { state: { score, totalQuestions } });
    }
  };

  const handleClose = () => {
    navigate('/category4_bab4');
  };

  if (questions.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="game-page volume-game" style={{
      background: 'linear-gradient(180deg, #2196F3 0%, #64B5F6 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>      <motion.button
      className="close-button"
      onClick={handleClose}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: '#32323e',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        zIndex: 10
      }}
    >
        ✕
      </motion.button>

      {showConfetti && <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={confettiConfig.recycle}
        run={confettiConfig.run}
        numberOfPieces={confettiConfig.numberOfPieces}
        gravity={confettiConfig.gravity}
      />}
      <div className="question-container" style={{
        marginBottom: '25px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '15px'
        }}>{babTitle}</h1>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: '500',
          color: 'white',
          marginBottom: '15px'
        }}>Pertanyaan {currentQuestion + 1} dari {totalQuestions}</h2>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '15px',
          lineHeight: '1.4'
        }}>
          {currentQ.question}
        </div>        {currentQ.image && (
          <img
            src={currentQ.image}
            alt="Gambar soal"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              margin: '0 auto 15px auto',
              display: 'block',
              borderRadius: '8px',
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)'
            }}
          />
        )}
      </div>
      <div className="options-container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '15px',
        maxWidth: '550px',
        margin: '0 auto 25px auto'
      }}>
        {currentQ.options.map((option, index) => (
          <motion.button
            key={index}
            className={`option-button ${selectedAnswer === option ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
            onClick={() => handleAnswerClick(option)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }} style={{
              width: '110px',
              height: '70px',
              borderRadius: '12px',
              background: '#3F51B5',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {option}
          </motion.button>
        ))}
      </div>
      <button
        className="next-button"
        onClick={handleNextQuestion}
        disabled={selectedAnswer === null}
        style={{
          padding: '10px 25px',
          fontSize: '0.9rem',
          backgroundColor: '#E3F2FD',
          color: '#2196F3',
          border: 'none',
          borderRadius: '25px',
          cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
          opacity: selectedAnswer === null ? 0.7 : 1,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        Pertanyaan Selanjutnya
      </button>
    </div>
  );
};

export default PengukuranVolume;
