import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import '../../../game.css';
import '../SingleLevel.css';

const Pengurangan = () => {
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
  const [babTitle, setBabTitle] = useState('Bab 1 Level 1 Pengurangan');
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
    let babIndex = 0; // Default to chapter 0
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
    setBabTitle(`Bab ${babIndex + 1} Level ${levelIndex + 1} Pengurangan`);

    // Save the current level key to localStorage
    const levelKey = `bab${babIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);

    // Save the operation type for this level
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      const avatarKey = `avatar_${avatar.name}_operations`;
      const operationData = JSON.parse(localStorage.getItem(avatarKey)) || {};
      operationData[levelKey] = "subtraction";
      localStorage.setItem(avatarKey, JSON.stringify(operationData));

      // Save current operation for HasilPage
      localStorage.setItem("currentOperation", "subtraction");
    }
  }, [location]);

  useEffect(() => {
    generateProblem();
  }, []);

  const generateProblem = () => {
    const num1 = Math.floor(Math.random() * 30) + 10; // Numbers between 10-40
    const num2 = Math.floor(Math.random() * 9) + 1;  // Numbers between 1-9
    setCurrentProblem({ num1, num2 });

    const correctAnswer = num1 - num2;
    let optionsArray = [
      correctAnswer,
      correctAnswer + 1,
      correctAnswer - 1,
      correctAnswer + 2
    ];
    optionsArray = [...new Set(optionsArray)];
    while (optionsArray.length < 4) {
      const newOption = correctAnswer + Math.floor(Math.random() * 6) - 3;
      if (!optionsArray.includes(newOption)) {
        optionsArray.push(newOption);
      }
    }
    setOptions(shuffleArray(optionsArray));
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    setLastAnswer(selectedAnswer);

    const isAnswerCorrect = answer === currentProblem.num1 - currentProblem.num2;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setShowConfetti(true);
      setConfettiConfig({
        ...confettiConfig,
        run: true,
        recycle: true,
        numberOfPieces: 500
      });

      setTimeout(() => {
        setConfettiConfig({
          ...confettiConfig,
          run: false
        });
        setTimeout(() => {
          setShowConfetti(false);
        }, 500);
      }, 4000);

      if (!lastAnswer || lastAnswer !== currentProblem.num1 - currentProblem.num2) {
        setScore(score + 1);
      }
    } else {
      if (lastAnswer && lastAnswer === currentProblem.num1 - currentProblem.num2) {
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

  const handleCloseButton = () => {
    navigate('/category');
  };

  return (
    <div className="game-page" style={{
      background: 'linear-gradient(to bottom, #00c6fb, #005bea)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <button className="close-button" onClick={handleCloseButton}>
        <span className="close-button-text">×</span>
      </button>

      {showConfetti && <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={confettiConfig.recycle}
        run={confettiConfig.run}
        numberOfPieces={confettiConfig.numberOfPieces}
        gravity={confettiConfig.gravity}
      />}

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{
          color: 'white',
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '10px'
        }}>{babTitle}</h1>
        <h2 style={{ color: 'white', fontSize: '1.2rem' }}>
          Pertanyaan {currentQuestion} dari {totalQuestions}
        </h2>
      </div>

      <div style={{
        fontSize: '5rem',
        color: 'white',
        fontWeight: 'bold',
        marginBottom: '60px',
        textAlign: 'center'
      }}>
        {currentProblem.num1}-{currentProblem.num2}=?
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '30px',
        maxWidth: '650px'
      }}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            style={{
              backgroundColor: selectedAnswer === option ? '#65b4ff' : '#7ad0ff',
              color: 'white',
              borderRadius: '50%',
              width: '90px',
              height: '90px',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: selectedAnswer === option ? '4px solid rgba(255,255,255,0.5)' : 'none'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleNextQuestion}
        disabled={selectedAnswer === null}
        style={{
          padding: '15px 40px',
          backgroundColor: selectedAnswer === null ? 'rgba(230, 230, 230, 0.5)' : 'rgba(230, 230, 230, 0.9)',
          color: selectedAnswer === null ? '#888' : '#333',
          border: 'none',
          borderRadius: '10px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginTop: '60px',
          cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          opacity: selectedAnswer === null ? '0.7' : '1'
        }}
      >
        Pertanyaan Selanjutnya
      </button>
    </div>
  );
};

export default Pengurangan;