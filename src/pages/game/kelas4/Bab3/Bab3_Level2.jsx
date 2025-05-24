import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Bab3_Level2.css'; // Import CSS sebagai file terpisah

// Data soal
const questions = [
  {
    type: 'ganjil',
    question: "Lanjutkan pola bilangan ganjil berikut: 1, 3, 5, 7, ...",
    example: "Contoh: 1, 3, 5 adalah 3 bilangan ganjil pertama",
    answer: [9, 11],
    options: [4, 8, 9, 10, 11, 12]
  },
  {
    type: 'genap',
    question: "Lanjutkan pola bilangan genap berikut: 2, 4, 6, 8, ...",
    example: "Contoh: 2, 4, 6 adalah 3 bilangan genap pertama",
    answer: [10, 12],
    options: [5, 7, 9, 10, 11, 12]
  },
  {
    type: 'segitiga',
    question: "Lanjutkan pola bilangan segitiga berikut: 1, 3, 6, 10, ...",
    example: "Contoh: Angka 3 adalah bilangan segitiga ke-2 (1+2)",
    answer: [15, 21],
    options: [12, 14, 15, 16, 20, 21]
  },
  {
    type: 'fibonacci',
    question: "Lanjutkan pola Fibonacci berikut: 1, 1, 2, 3, ...",
    example: "Contoh: 1, 1, 2 adalah 3 bilangan Fibonacci pertama",
    answer: [5, 8],
    options: [4, 5, 6, 7, 8, 9]
  },
  {
    type: 'ganjil',
    question: "Tentukan 2 bilangan ganjil berikutnya: 13, 15, 17, ...",
    example: "Contoh: 11, 13 adalah dua bilangan ganjil berurutan",
    answer: [19, 21],
    options: [18, 19, 20, 21, 22, 23]
  },
  {
    type: 'genap',
    question: "Tentukan 2 bilangan genap berikutnya: 10, 12, 14, ...",
    example: "Contoh: 6, 8 adalah dua bilangan genap berurutan",
    answer: [16, 18],
    options: [15, 16, 17, 18, 19, 20]
  },
  {
    type: 'segitiga',
    question: "Lanjutkan pola bilangan segitiga: 10, 15, 21, 28, ...",
    example: "Contoh: 6 adalah bilangan segitiga ke-3 (1+2+3)",
    answer: [36, 45],
    options: [30, 35, 36, 40, 45, 50]
  },
  {
    type: 'fibonacci',
    question: "Lanjutkan pola Fibonacci: 5, 8, 13, 21, ...",
    example: "Contoh: 3, 5, 8 adalah tiga bilangan Fibonacci berurutan",
    answer: [34, 55],
    options: [25, 30, 34, 42, 55, 60]
  },
  {
    type: 'segitiga',
    question: "Tentukan bilangan segitiga ke-6 dan ke-7 (setelah 1, 3, 6, 10, 15)",
    example: "Contoh: 10 adalah bilangan segitiga ke-4",
    answer: [21, 28],
    options: [18, 20, 21, 25, 28, 30]
  },
  {
    type: 'fibonacci',
    question: "Tentukan 2 bilangan Fibonacci setelah 34 dan 55",
    example: "Contoh: 13 dan 21 adalah dua bilangan Fibonacci berurutan",
    answer: [89, 144],
    options: [60, 75, 89, 100, 120, 144]
  }
];

function App() {
  // State
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'end'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [usedOptionIndices, setUsedOptionIndices] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const navigate = useNavigate();
  
  // Initialize selected pieces when a new question is loaded
  useEffect(() => {
    if (gameState === 'playing') {
      setSelectedPieces(new Array(questions[currentQuestion].answer.length).fill(null));
      setUsedOptionIndices([]);
      setFeedback({ message: '', type: '' });
      setFeedbackVisible(false);
    }
  }, [currentQuestion, gameState]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
  };

  // Restart game
  const restartGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
  };

  // Navigate back to Category4_Bab3
  const goToCategory = () => {
    navigate('/category4_bab3');
  };

  // Select number for an answer slot
  const selectNumber = (num, optionIndex) => {
    // Find first empty slot
    const emptySlotIndex = selectedPieces.findIndex(piece => piece === null);
    
    if (emptySlotIndex !== -1) {
      const newSelectedPieces = [...selectedPieces];
      newSelectedPieces[emptySlotIndex] = num;
      setSelectedPieces(newSelectedPieces);
      
      // Mark this option as used
      setUsedOptionIndices([...usedOptionIndices, optionIndex]);
      
      // If all slots are filled, automatically check the answer
      if (!newSelectedPieces.includes(null)) {
        setTimeout(() => checkAnswer(newSelectedPieces), 300);
      }
    }
  };

  // Remove a number from an answer slot
  const removeFromSlot = (slotIndex) => {
    if (selectedPieces[slotIndex] !== null) {
      // Find which option this number corresponds to
      const numToRemove = selectedPieces[slotIndex];
      const options = questions[currentQuestion].options;
      let optionIndexToUnmark = usedOptionIndices.find(index => 
        options[index] === numToRemove);
      
      // Clear the slot
      const newSelectedPieces = [...selectedPieces];
      newSelectedPieces[slotIndex] = null;
      setSelectedPieces(newSelectedPieces);
      
      // Unmark this option as used
      setUsedOptionIndices(usedOptionIndices.filter(index => index !== optionIndexToUnmark));
    }
  };

  // Check answer and proceed to next question
  const checkAnswer = (pieces) => {
    const correctAnswer = questions[currentQuestion].answer;
    let isCorrect = true;
    
    for (let i = 0; i < correctAnswer.length; i++) {
      if (pieces[i] !== correctAnswer[i]) {
        isCorrect = false;
        break;
      }
    }
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 10);
      setFeedback({
        message: "Jawabanmu benar! +10 poin",
        type: 'correct'
      });
    } else {
      setFeedback({
        message: `Jawabanmu belum tepat. Jawaban yang benar adalah: ${correctAnswer.join(', ')}`,
        type: 'incorrect'
      });
    }
    
    setFeedbackVisible(true);
    
    // Automatically move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prevQuestion => prevQuestion + 1);
      } else {
        setGameState('end');
      }
    }, 2000);
  };

  // Shuffle an array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Render option pieces
  const renderOptions = () => {
    if (gameState !== 'playing') return null;
    
    const options = questions[currentQuestion].options;
    const shuffledIndices = Array.from({ length: options.length }, (_, i) => i);
    
    return shuffledIndices.map((originalIndex) => {
      const num = options[originalIndex];
      const isUsed = usedOptionIndices.includes(originalIndex);
      
      return (
        <button
          key={originalIndex}
          className={`number-piece ${isUsed ? 'invisible' : ''}`}
          onClick={() => selectNumber(num, originalIndex)}
          disabled={isUsed}
        >
          {num}
        </button>
      );
    });
  };

  // Render answer slots
  const renderAnswerSlots = () => {
    if (gameState !== 'playing') return null;
    
    return selectedPieces.map((piece, index) => (
      <div
        key={index}
        className={`answer-slot ${piece !== null ? 'filled-slot' : ''}`}
        onClick={() => removeFromSlot(index)}
      >
        {piece !== null && piece}
      </div>
    ));
  };

  // Render progress bar
  const renderProgressBar = () => {
    // When game is over (end state), show 100% progress, otherwise calculate based on current question
    const progress = gameState === 'end' ? 100 : (currentQuestion / questions.length) * 100;
    return (
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
    );
  };

  return (
    <div className="polaBilangan-container">
      <h1>Puzzle Pola Bilangan</h1>
      <p className="subtitle">Tebak pola bilangan dan dapatkan nilai tertinggi!</p>
      
      {gameState !== 'start' && renderProgressBar()}
      
      {/* Adding back the score display as plain text without decorative styling */}
      {gameState !== 'start' && (
        <p style={{ fontSize: '1.2em', margin: '0 0 20px 0' }}>
          Skor: <span>{score}</span> / 100
        </p>
      )}
      
      {/* Start Screen */}
      {gameState === 'start' && (
        <div id="start-screen">
          <p>Game ini akan menguji pemahamanmu tentang berbagai pola bilangan. Ada 10 soal dengan nilai 10 poin setiap soal.</p>
          <p>Jenis pola bilangan yang akan kamu temui:</p>
          <div className="pattern-info">
            <p><strong>Pola Bilangan Ganjil:</strong> 1, 3, 5, 7, 9, ...</p>
            <p><strong>Pola Bilangan Genap:</strong> 2, 4, 6, 8, 10, ...</p>
            <p><strong>Pola Bilangan Segitiga:</strong> 1, 3, 6, 10, 15, ...</p>
            <p><strong>Pola Fibonacci:</strong> 1, 1, 2, 3, 5, 8, ...</p>
          </div>
          <button onClick={startGame}>Mulai Game</button>
        </div>
      )}
      
      {/* Game Area */}
      {gameState === 'playing' && (
        <div className="game-area">
          <div className="question-card">
            <div className="question">
              {questions[currentQuestion].question}
            </div>
            <div className="example">
              {questions[currentQuestion].example}
            </div>
            <div className="answer-area">
              {renderAnswerSlots()}
            </div>
            <div className="answer-options">
              {renderOptions()}
            </div>
            {feedbackVisible && (
              <div className={`feedback ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* End Screen */}
      {gameState === 'end' && (
        <div className="end-screen">
          <div className="game-over">
            <p>Permainan Selesai!</p>
            <p>Skor akhir kamu: <span>{score}</span> / 100</p>
            {score >= 80 && <div className="celebration">🎉</div>}
          </div>
          <button onClick={restartGame}>Main Lagi</button>
          <button onClick={goToCategory} className="back-to-category">
            Kembali ke kategori
          </button>
        </div>
      )}
    </div>
  );
}

export default App;