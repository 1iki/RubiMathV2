import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import '../../../game.css';
import '../SingleLevel.css';

const Pembagian = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [babTitle, setBabTitle] = useState('Bab 3 Level 1 Pembagian');
  const totalQuestions = 5;

  // Set the currentLevelKey when component mounts
  useEffect(() => {
    // Extract level information from the URL path or location state
    // Default to bab0_level0 if no specific information is available
    const pathSegments = location.pathname.split('/');
    let babIndex = 0; // Default to chapter 0 (Bab 1 in display) instead of chapter 3
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
    setBabTitle(`Bab ${babIndex + 1} Level ${levelIndex + 1} Pembagian`);

    // Save the current level key to localStorage
    const levelKey = `bab${babIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);

    // Save the operation type for this level
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      const avatarKey = `avatar_${avatar.name}_operations`;
      const operationData = JSON.parse(localStorage.getItem(avatarKey)) || {};
      operationData[levelKey] = "division";
      localStorage.setItem(avatarKey, JSON.stringify(operationData));

      // Save current operation for HasilPage
      localStorage.setItem("currentOperation", "division");
    }
  }, [location]);

  // Generate random questions for division
  useEffect(() => {
    const generatedQuestions = [];
    for (let i = 0; i < totalQuestions; i++) {
      // For division, create divisible numbers to avoid complex decimal answers
      const divisor = Math.floor(Math.random() * 10) + 2; // Between 2 and 11
      const quotient = Math.floor(Math.random() * 12) + 1; // Between 1 and 12
      const dividend = divisor * quotient; // Ensures clean division
      const correctAnswer = quotient;

      // Generate options (some with decimal values to match the image)
      let options = [
        correctAnswer, // The exact answer
        correctAnswer * 2, // Double the correct answer
        (correctAnswer + 0.05).toFixed(2), // Slightly over
        (correctAnswer + 0.01).toFixed(2), // Slightly over
      ];

      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      generatedQuestions.push({
        dividend,
        divisor,
        correctAnswer,
        options: options
      });
    }
    setQuestions(generatedQuestions);
  }, []);

  const handleAnswerClick = (selectedOption) => {
    // Convert to numbers for comparison (handle string "7.00" vs number 7)
    const selectedNum = parseFloat(selectedOption);
    const correctNum = questions[currentQuestion].correctAnswer;

    setSelectedAnswer(selectedNum);
    const correct = selectedNum === correctNum;
    setIsCorrect(correct);

    if (correct && selectedAnswer !== selectedNum) {
      setShowConfetti(true);
      setScore(score + 1);

      // Play success sound
      const successSound = new Audio('/src/assets/ding.mp3');
      successSound.play().catch(e => console.log('Audio play failed:', e));
    } else if (!correct && selectedAnswer !== selectedNum) {
      // Play fail sound
      const failSound = new Audio('/src/assets/fail.mp3');
      failSound.play().catch(e => console.log('Audio play failed:', e));
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
    <div className="game-container" style={{ backgroundColor: '#4CD137' }}>
      {showConfetti && <ReactConfetti recycle={false} />}

      <div className="close-button">
        <button onClick={() => navigate('/category')}>&times;</button>
      </div>

      <div className="question-section">
        <h2 className="question-count">Pertanyaan {currentQuestion + 1} dari {totalQuestions}</h2>

        <div className="question-text">
          <h1>{currentQ.dividend}/{currentQ.divisor}=?</h1>
        </div>

        <div className="answer-options">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              className={`answer-button circle-button ${selectedAnswer === parseFloat(option)
                ? parseFloat(option) === currentQ.correctAnswer ? 'correct' : 'incorrect'
                : ''}`}
              onClick={() => handleAnswerClick(option)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {option}
            </motion.button>
          ))}
        </div>

        <div className="next-btn-container">
          <motion.button
            className={`next-button ${selectedAnswer === null ? 'disabled' : ''}`}
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            Pertanyaan Selanjutnya
          </motion.button>
        </div>
      </div>

      <div className="title-section">
        <h1>{babTitle}</h1>
      </div>
    </div>
  );
};

export default Pembagian;