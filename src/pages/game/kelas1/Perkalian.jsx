import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import '../../../game.css';
import '../SingleLevel.css';

const Perkalian = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(5);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState({ num1: 0, num2: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [babTitle, setBabTitle] = useState('Bab 2 Level 1 Perkalian');
  const [confettiConfig, setConfettiConfig] = useState({
    run: false,
    recycle: true,
    numberOfPieces: 500,
    gravity: 0.3
  });

  // Set the currentLevelKey when component mounts
  useEffect(() => {
    // Extract level information from the URL path or location state
    // Default to bab0_level0 if no specific information is available
    const pathSegments = location.pathname.split('/');
    let babIndex = 0; // Default to chapter 0 (Bab 1 in display) instead of chapter 2
    let levelIndex = 0;

    // Try to get babIndex and levelIndex from URL or state
    if (location.state && location.state.babIndex !== undefined) {
      babIndex = location.state.babIndex;
      levelIndex = location.state.levelIndex || 0;
    } else if (pathSegments.length >= 4) {
      // If URL format is like /materi/0/1 (bab 0, level 1)
      babIndex = parseInt(pathSegments[pathSegments.length - 2]) || 0;
      levelIndex = parseInt(pathSegments[pathSegments.length - 1]) || 0;
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
    setBabTitle(`Bab ${babIndex + 1} Level ${levelIndex + 1} Perkalian`);

    // Save the current level key to localStorage
    const levelKey = `bab${babIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);

    // Save the operation type for this level
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      const avatarKey = `avatar_${avatar.name}_operations`;
      const operationData = JSON.parse(localStorage.getItem(avatarKey)) || {};
      operationData[levelKey] = "multiplication";
      localStorage.setItem(avatarKey, JSON.stringify(operationData));

      // Save current operation for HasilPage
      localStorage.setItem("currentOperation", "multiplication");
    }
  }, [location]);

  useEffect(() => {
    generateProblem();
  }, []);

  const generateProblem = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCurrentProblem({ num1, num2 });

    const correctAnswer = num1 * num2;
    const incorrectAnswers = Array.from({ length: 3 }, () => {
      let answer;
      do {
        answer = Math.floor(Math.random() * 100) + 1;
      } while (answer === correctAnswer);
      return answer;
    });

    const allOptions = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    setLastAnswer(selectedAnswer);

    const isAnswerCorrect = answer === currentProblem.num1 * currentProblem.num2;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setShowConfetti(true);
      setConfettiConfig({
        ...confettiConfig,
        run: true,
        recycle: true,
        numberOfPieces: 500
      });

      // Hide confetti after 4 seconds
      setTimeout(() => {
        setConfettiConfig({
          ...confettiConfig,
          run: false
        });
        setTimeout(() => {
          setShowConfetti(false);
        }, 500);
      }, 4000);

      if (!lastAnswer || lastAnswer !== currentProblem.num1 * currentProblem.num2) {
        setScore(score + 1);
      }
    } else {
      if (lastAnswer && lastAnswer === currentProblem.num1 * currentProblem.num2) {
        setScore(score - 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      generateProblem();
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      navigate(`/hasil/${score}`, { state: { score, totalQuestions } });
    }
  };

  const handleClose = () => {
    navigate('/category');
  };

  return (
    <div className="game-page multiplication-game" style={{
      background: 'linear-gradient(180deg, #5BCEFA 0%, #FF9DD3 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <motion.button
        className="close-button"
        onClick={handleClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#32323e',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
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
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '20px'
        }}>{babTitle}</h1>
        <h2 style={{
          fontSize: '1.2rem',
          fontWeight: '500',
          color: 'white',
          marginBottom: '20px'
        }}>Pertanyaan {currentQuestion} dari {totalQuestions}</h2>
        <div style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: 'white',
        }}>
          {currentProblem.num1}X{currentProblem.num2}=?
        </div>
      </div>

      <div className="options-container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        maxWidth: '600px',
        margin: '0 auto 30px auto'
      }}>
        {options.map((option, index) => (
          <motion.button
            key={index}
            className={`option-button ${selectedAnswer === option ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
            onClick={() => handleAnswerClick(option)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#FF4FA7',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
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
          padding: '12px 30px',
          fontSize: '1.2rem',
          backgroundColor: '#F3CAE6',
          color: '#666',
          border: 'none',
          borderRadius: '30px',
          cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
          opacity: selectedAnswer === null ? 0.7 : 1,
          boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)'
        }}
      >
        Pertanyaan Selanjutnya
      </button>
    </div>
  );
};

export default Perkalian;