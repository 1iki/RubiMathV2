import { useState, useEffect } from 'react';
import { saveGameProgress, getGameProgress } from "../../../../services/gameProgressService";

// Custom CSS for the component
const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: 'linear-gradient(to bottom, #f0f9ff, #e1f5fe, #b3e5fc)',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundPatterns: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 20%, transparent 20%), radial-gradient(circle, rgba(255,255,255,0.7) 20%, transparent 20%)',
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 20px 20px',
    zIndex: 1,
    opacity: 0.5
  },
  gameContainer: {
    maxWidth: '800px',
    width: '100%',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2
  },
  header: {
    textAlign: 'center',
    color: '#267F45',
    borderBottom: '2px solid #267F45',
    width: '100%',
    paddingBottom: '10px',
    marginBottom: '20px',
    fontWeight: 'bold',
    fontSize: '24px'
  },
  scoreDisplay: {
    textAlign: 'right',
    width: '100%',
    fontWeight: 'bold',
    marginBottom: '15px',
    fontSize: '16px',
    color: '#333'
  },
  questionText: {
    marginBottom: '20px',
    fontSize: '16px',
    width: '100%',
    textAlign: 'left',
    lineHeight: '1.5',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    width: '100%',
    marginBottom: '20px'
  },
  optionButton: {
    padding: '12px 15px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#333',
    fontSize: '15px',
    textAlign: 'left',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden'
  },
  optionButtonHover: {
    backgroundColor: '#edf7f0',
    borderColor: '#267F45',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  optionButtonCorrect: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    color: '#155724'
  },
  optionButtonIncorrect: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    color: '#721c24'
  },
  nextButton: {
    backgroundColor: '#267F45',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '15px',
    fontWeight: 'bold',
    boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  nextButtonHover: {
    backgroundColor: '#1d6935',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 10px rgba(0,0,0,0.15)'
  },
  resultMessage: {
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '10px',
    borderRadius: '6px',
    width: '100%'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '20px'
  },
  emoji: {
    fontSize: '24px',
    padding: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '2px solid #eaeaea'
  },
  progressContainer: {
    width: '100%',
    marginBottom: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '10px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  progressBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#267F45',
    borderRadius: '5px',
    transition: 'width 0.3s ease-in-out'
  },
  introContainer: {
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    position: 'relative',
    overflow: 'hidden'
  },
  introPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 10% 20%, rgba(38, 127, 69, 0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(38, 127, 69, 0.1) 0%, transparent 20%)',
    zIndex: 0
  },
  introContent: {
    position: 'relative',
    zIndex: 1
  },
  finishedContainer: {
    textAlign: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '35px',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  gameTitle: {
    fontWeight: 'bold',
    color: '#267F45',
    marginBottom: '15px',
    fontSize: '28px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
  },
  decorationTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '8px',
    background: 'linear-gradient(90deg, #267F45, #4CAF50, #8BC34A, #267F45)',
  },
  decorationBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '8px',
    background: 'linear-gradient(90deg, #267F45, #4CAF50, #8BC34A, #267F45)',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#267F45',
    color: 'white',
    borderRadius: '30px',
    padding: '5px 15px',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  confetti: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: '#ff0000',
    borderRadius: '50%',
    animation: 'confetti-fall 5s ease-in-out infinite'
  }
};

// Data pertanyaan
const questions = [
  {
    question: "1. Ibu mengukur lebar meja dengan jengkal tangan. Ini adalah contoh pengukuran dengan satuan...",
    options: ["Baku", "Tidak baku", "Internasional", "Panjang"],
    correctAnswer: 1
  },
  {
    question: "2. Manakah yang termasuk satuan baku untuk mengukur panjang?",
    options: ["Jengkal", "Depa", "Sentimeter", "Tali"],
    correctAnswer: 2
  },
  {
    question: "3. Bima mengukur tepung menggunakan gelas belimbing. Ini adalah contoh satuan...",
    options: ["Baku untuk berat", "Tidak baku untuk volume", "Baku untuk volume", "Tidak baku untuk panjang"],
    correctAnswer: 1
  },
  {
    question: "4. Jika panjang buku 20 cm, manakah yang benar?",
    options: ["Lebih pendek dari 1 jengkal orang dewasa", "Lebih panjang dari 1 meter", "Sama dengan 1 depa", "Lebih pendek dari 1 pensil"],
    correctAnswer: 0
  },
  {
    question: "5. Satuan manakah yang TIDAK digunakan untuk mengukur berat?",
    options: ["Kilogram", "Ons", "Liter", "Gram"],
    correctAnswer: 2
  },
  {
    question: "6. Untuk mengukur panjang lapangan, satuan yang paling tepat adalah...",
    options: ["Jengkal", "Meter", "Centimeter", "Gelas"],
    correctAnswer: 1
  },
  {
    question: "7. Manakah yang termasuk satuan tidak baku untuk volume?",
    options: ["Liter", "Mililiter", "Gelas", "Meter kubik"],
    correctAnswer: 2
  },
  {
    question: "8. 1 kilogram sama dengan...",
    options: ["10 gram", "100 gram", "1000 gram", "10000 gram"],
    correctAnswer: 2
  },
  {
    question: "9. Untuk mengukur air dalam akuarium kecil, satuan yang tepat adalah...",
    options: ["Gelas", "Depa", "Liter", "Kilogram"],
    correctAnswer: 2
  },
  {
    question: "10. Manakah pernyataan yang BENAR tentang satuan baku?",
    options: ["Bisa berbeda-beda tiap orang", "Hanya ada di Indonesia", "Nilainya tetap sama di mana saja", "Hanya untuk mengukur panjang"],
    correctAnswer: 2
  }
];

export default function App() {
  const [gameState, setGameState] = useState('intro'); // intro, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [result, setResult] = useState({ message: '', isCorrect: false });
  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredNext, setHoveredNext] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setResult({ message: '', isCorrect: false });
    setGameOver(false);
  };

  const selectAnswer = (answerIndex) => {
    if (result.message !== '') return; // Prevent multiple selections
    
    const question = questions[currentQuestion];
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newUserAnswers);

    if (answerIndex === question.correctAnswer) {
      setScore(score + 10);
      setResult({
        message: 'Benar! (+10 poin)',
        isCorrect: true
      });
    } else {
      setResult({
        message: `Salah! Jawaban benar: ${question.options[question.correctAnswer]}`,
        isCorrect: false
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setResult({ message: '', isCorrect: false });
    } else {
      setGameState('finished');
      setGameOver(true);
    }
  };

  const getFeedback = () => {
    if (score >= 80) {
      return "Hebat! Kamu benar-benar menguasai pengukuran!";
    } else if (score >= 60) {
      return "Bagus! Kamu sudah paham banyak tentang pengukuran.";
    } else if (score >= 40) {
      return "Cukup baik. Coba pelajari lagi satuan baku dan tidak baku ya!";
    } else {
      return "Jangan menyerah! Pelajari lagi tentang pengukuran dan coba lagi!";
    }
  };

  // Generate random position for decoration elements
  const generateRandomPosition = (index) => {
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`
    };
  };

  // Create decorative elements
  const createDecorations = (count) => {
    const decorations = [];
    for (let i = 0; i < count; i++) {
      const pos = generateRandomPosition(i);
      decorations.push(
        <div 
          key={`deco-${i}`} 
          style={{
            ...styles.confetti,
            top: pos.top,
            left: pos.left,
            animationDelay: pos.animationDelay,
            backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'][i % 5],
          }}
        />
      );
    }
    return decorations;
  };

  // Tambahkan fungsi handleSaveProgress
  const handleSaveProgress = async () => {
    const gameData = {
      kelas: 4,
      bab: 4,
      level: 1,
      jenis_permainan: "Pengukuran",
      skor: score,
      skor_maksimal: 100,
      status_selesai: gameOver,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: score >= 80 ? 1 : score >= 60 ? 0.5 : score >= 40 ? 0.25 : 0,
            total_soal: questions.length
          }
        ]
      }
    };

    await saveGameProgress(gameData);
  };

  // Tambahkan useEffect untuk menyimpan progress
  useEffect(() => {
    if (score > 0 || gameOver) {
      handleSaveProgress();
    }
  }, [score, gameOver]);

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPatterns}></div>
      <div style={styles.gameContainer}>
        <div style={styles.iconContainer}>
          <div style={styles.emoji}>😀</div>
          <div style={styles.emoji}>🔍</div>
        </div>
        
        <h1 style={styles.header}>Petualangan Pengukuran Bersama Bima</h1>
        
        {gameState === 'intro' && (
          <div style={styles.introContainer}>
            <div style={styles.introPattern}></div>
            <div style={styles.decorationTop}></div>
            <div style={styles.introContent}>
              <h2 style={styles.gameTitle}>Siap Berpetualang?</h2>
              <p style={{marginBottom: '15px', lineHeight: '1.5'}}>
                Bima sedang menyiapkan bahan untuk membuat kue. Bantu Bima mengukur bahan-bahan menggunakan satuan baku dan tidak baku!
              </p>
              <div style={{margin: '20px 0'}}>
                <span style={styles.badge}>Pengetahuan</span>
                <span style={styles.badge}>Pengukuran</span>
                <span style={styles.badge}>Kelas 4</span>
              </div>
              <p style={{marginBottom: '25px', fontWeight: 'bold'}}>
                Setiap jawaban benar memberi kamu 10 poin. Total skor maksimal adalah 100!
              </p>
              <button 
                onClick={startGame}
                onMouseEnter={() => setHoveredNext(true)}
                onMouseLeave={() => setHoveredNext(false)}
                style={{
                  ...styles.nextButton,
                  ...(hoveredNext ? styles.nextButtonHover : {})
                }}
              >
                Mulai Petualangan!
              </button>
            </div>
            <div style={styles.decorationBottom}></div>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div style={{width: '100%'}}>
            <div style={styles.scoreDisplay}>
              Skor: {score}/100
            </div>
            
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill, 
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div style={styles.questionText}>
              {questions[currentQuestion].question}
            </div>
            
            <div style={styles.optionsGrid}>
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  onMouseEnter={() => result.message === '' && setHoveredButton(index)}
                  onMouseLeave={() => setHoveredButton(null)}
                  disabled={result.message !== ''}
                  style={{
                    ...styles.optionButton,
                    ...(hoveredButton === index && result.message === '' ? styles.optionButtonHover : {}),
                    ...(result.message !== '' && index === questions[currentQuestion].correctAnswer ? styles.optionButtonCorrect : {}),
                    ...(result.message !== '' && index === userAnswers[currentQuestion] && index !== questions[currentQuestion].correctAnswer ? styles.optionButtonIncorrect : {}),
                    ...(result.message !== '' && index !== questions[currentQuestion].correctAnswer && index !== userAnswers[currentQuestion] ? { opacity: 0.7 } : {})
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {result.message && (
              <div style={{
                ...styles.resultMessage,
                backgroundColor: result.isCorrect ? '#d4edda' : '#f8d7da',
                color: result.isCorrect ? '#155724' : '#721c24',
                border: `1px solid ${result.isCorrect ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {result.message}
              </div>
            )}
            
            {result.message && (
              <div style={{textAlign: 'center'}}>
                <button
                  onClick={nextQuestion}
                  onMouseEnter={() => setHoveredNext(true)}
                  onMouseLeave={() => setHoveredNext(false)}
                  style={{
                    ...styles.nextButton,
                    ...(hoveredNext ? styles.nextButtonHover : {})
                  }}
                >
                  {currentQuestion < questions.length - 1 ? 'Lanjut' : 'Lihat Hasil'}
                </button>
              </div>
            )}
          </div>
        )}
        
        {gameState === 'finished' && (
          <div style={styles.finishedContainer}>
            {createDecorations(20)}
            <div style={styles.decorationTop}></div>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#267F45'}}>
              Hasil Akhir
            </h2>
            
            <div style={{
              fontSize: '48px', 
              fontWeight: 'bold', 
              margin: '20px 0', 
              color: score >= 70 ? '#28a745' : score >= 40 ? '#ffc107' : '#dc3545',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              {score}/100
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: score >= 70 ? '#d4edda' : score >= 40 ? '#fff3cd' : '#f8d7da',
              borderRadius: '8px',
              marginBottom: '25px',
              color: score >= 70 ? '#155724' : score >= 40 ? '#856404' : '#721c24',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {getFeedback()}
            </div>
            
            <button
              onClick={startGame}
              onMouseEnter={() => setHoveredNext(true)}
              onMouseLeave={() => setHoveredNext(false)}
              style={{
                ...styles.nextButton,
                ...(hoveredNext ? styles.nextButtonHover : {}),
                backgroundColor: '#d9534f'
              }}
            >
              Main Lagi
            </button>
            <div style={styles.decorationBottom}></div>
          </div>
        )}
      </div>
    </div>
  );
}