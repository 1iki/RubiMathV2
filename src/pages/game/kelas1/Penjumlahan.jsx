import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import '../../../game.css';
import '../SingleLevel.css';

const Penjumlahan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [babTitle, setBabTitle] = useState('Bab 0 Level 1 Penjumlahan');
  const totalQuestions = 5;

  // Set the currentLevelKey when component mounts
  useEffect(() => {
    // Extract level information from the URL path or location state
    // Default to bab0_level0 if no specific information is available
    const pathSegments = location.pathname.split('/');
    let babIndex = 0;
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
    setBabTitle(`Bab ${babIndex + 1} Level ${levelIndex + 1} Penjumlahan`);

    // Save the current level key to localStorage
    const levelKey = `bab${babIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);

    // Save the operation type for this level
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      const avatar = JSON.parse(savedAvatar);
      const avatarKey = `avatar_${avatar.name}_operations`;
      const operationData = JSON.parse(localStorage.getItem(avatarKey)) || {};
      operationData[levelKey] = "addition";
      localStorage.setItem(avatarKey, JSON.stringify(operationData));

      // Save current operation for HasilPage
      localStorage.setItem("currentOperation", "addition");
    }
  }, [location]);

  // Generate random questions for addition
  useEffect(() => {
    const generatedQuestions = [];
    for (let i = 0; i < totalQuestions; i++) {
      const num1 = Math.floor(Math.random() * 20) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const correctAnswer = num1 + num2;

      // Generate 3 wrong answers
      let wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        const wrongAnswer = Math.floor(Math.random() * 40) + 1;
        if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
          wrongAnswers.push(wrongAnswer);
        }
      }

      // Combine correct and wrong answers, then shuffle
      const answers = [correctAnswer, ...wrongAnswers];
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
      }

      generatedQuestions.push({
        num1,
        num2,
        correctAnswer,
        options: answers
      });
    }
    setQuestions(generatedQuestions);
  }, []);

  const handleAnswerClick = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);

    if (correct && selectedAnswer !== selectedOption) { // Hanya mainkan audio dan tampilkan confetti jika ini adalah pilihan baru yang benar
      setShowConfetti(true);
      setScore(score + 1);

      // Play success sound
      const successSound = new Audio('/src/assets/ding.mp3');
      successSound.play().catch(e => console.log('Audio play failed:', e));
    } else if (!correct && selectedAnswer !== selectedOption) { // Hanya mainkan audio jika ini adalah pilihan baru yang salah
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
    <div className="game-container" style={{ backgroundColor: '#FF5722' }}>
      {showConfetti && <ReactConfetti recycle={false} />}

      <div className="close-button">
        <button onClick={() => navigate('/category')}>&times;</button>
      </div>

      <div className="question-section">
        <h1 className="game-title" style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>{babTitle}</h1>
        <h2 className="question-count">Pertanyaan {currentQuestion + 1} dari {totalQuestions}</h2>

        <div className="question-text">
          <h1>{currentQ.num1}+{currentQ.num2}=?</h1>
        </div>

        <div className="answer-options">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              className={`answer-button ${selectedAnswer === option
                ? option === currentQ.correctAnswer ? 'correct' : 'incorrect'
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
    </div>
  );
};

export default Penjumlahan;