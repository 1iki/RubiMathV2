import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGameProgress, getGameProgress } from "../../../../services/gameProgressService";

// Data pertanyaan
const questions = [
  {
    question: "1. Rani mengisi ember dengan gelas plastik. Jika ember terisi penuh setelah 5 gelas, berapa volume ember tersebut?",
    options: [
      "5 gelas plastik",
      "3 gelas plastik",
      "7 gelas plastik",
      "10 gelas plastik"
    ],
    answer: 0,
    feedback: "Benar! Volume ember adalah 5 gelas plastik karena butuh 5 gelas untuk mengisi penuh ember tersebut."
  },
  {
    question: "2. Satuan baku untuk mengukur volume adalah...",
    options: [
      "Gelas dan sendok",
      "Liter dan mililiter",
      "Baskom dan ember",
      "Botol dan kaleng"
    ],
    answer: 1,
    feedback: "Benar! Liter dan mililiter adalah satuan baku untuk mengukur volume."
  },
  {
    question: "3. Ibu membuat jus jeruk sebanyak 1.5 liter. Berapa mililiter jus yang dibuat ibu? (1 liter = 1000 ml)",
    options: [
      "150 ml",
      "1.500 ml",
      "15.000 ml",
      "150.000 ml"
    ],
    answer: 1,
    feedback: "Benar! 1.5 liter = 1.500 mililiter."
  },
  {
    question: "4. Manakah yang termasuk satuan tidak baku untuk mengukur volume?",
    options: [
      "Mililiter",
      "Liter",
      "Gelas",
      "Meter kubik"
    ],
    answer: 2,
    feedback: "Benar! Gelas adalah satuan tidak baku karena ukuran gelas bisa berbeda-beda."
  },
  {
    question: "5. Volume akuarium kecil adalah 20 liter. Jika diukur dengan ember kecil yang volumenya 5 liter, berapa ember kecil yang dibutuhkan untuk mengisi penuh akuarium?",
    options: [
      "2 ember",
      "4 ember",
      "5 ember",
      "10 ember"
    ],
    answer: 1,
    feedback: "Benar! 20 liter ÷ 5 liter/ember = 4 ember."
  },
  {
    question: "6. 3.000 mililiter sama dengan...",
    options: [
      "3 liter",
      "30 liter",
      "300 liter",
      "0.3 liter"
    ],
    answer: 0,
    feedback: "Benar! 1.000 mililiter = 1 liter, jadi 3.000 mililiter = 3 liter."
  },
  {
    question: "7. Andi mengisi bak mandi dengan 8 ember air. Jika volume 1 ember adalah 5 liter, berapa liter volume air dalam bak mandi?",
    options: [
      "13 liter",
      "20 liter",
      "40 liter",
      "58 liter"
    ],
    answer: 2,
    feedback: "Benar! 8 ember × 5 liter/ember = 40 liter."
  },
  {
    question: "8. Manakah yang memiliki volume paling besar?",
    options: [
      "1 gelas air",
      "1 botol minum (600 ml)",
      "1 ember (10 liter)",
      "1 sendok makan"
    ],
    answer: 2,
    feedback: "Benar! 1 ember (10 liter) memiliki volume paling besar dibanding pilihan lainnya."
  },
  {
    question: "9. Sebuah jerigen berisi 5 liter minyak goreng. Jika sudah digunakan 2.500 ml, berapa liter sisa minyak dalam jerigen?",
    options: [
      "1 liter",
      "2.5 liter",
      "3 liter",
      "7.5 liter"
    ],
    answer: 1,
    feedback: "Benar! 2.500 ml = 2.5 liter. 5 liter - 2.5 liter = 2.5 liter."
  },
  {
    question: "10. Jika sebuah teko dapat diisi dengan 4 gelas air, dan volume 1 gelas adalah 250 ml, berapa liter volume teko tersebut?",
    options: [
      "0.5 liter",
      "1 liter",
      "1.5 liter",
      "2 liter"
    ],
    answer: 1,
    feedback: "Benar! 4 gelas × 250 ml = 1.000 ml = 1 liter."
  }
];

export default function VolumeMeasurementGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Update progress bar width on question change
    const progress = (currentQuestion / questions.length) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
  }, [currentQuestion]);

  useEffect(() => {
    if (score > 0 || gameOver) {
      handleSaveProgress();
    }
  }, [score, gameOver]);

  const selectOption = (index) => {
    if (answered) return;
    
    setSelectedOption(index);
    setAnswered(true);
    
    const question = questions[currentQuestion];
    
    // Check answer and update score
    if (index === question.answer) {
      setScore(prevScore => prevScore + 10);
      setAnimateScore(true);
      setTimeout(() => setAnimateScore(false), 1000);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      setShowResult(true);
      // Update progress bar to 100%
      document.getElementById('progress').style.width = '100%';
    } else {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
      setAnswered(false);
      setSelectedOption(null);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedOption(null);
    setShowResult(false);
    setGameOver(false);
  };

  const goToCategory = () => {
    navigate('/category4_bab4');
  };

  const getResultMessage = () => {
    if (score === 100) {
      return {
        title: "Luar Biasa! 🎉",
        message: `Kamu mendapatkan nilai sempurna ${score} dari 100! Kamu benar-benar menguasai pengukuran volume.`
      };
    } else if (score >= 70) {
      return {
        title: "Bagus! 👏",
        message: `Kamu mendapatkan ${score} dari 100! Hanya sedikit lagi untuk mencapai nilai sempurna.`
      };
    } else if (score >= 50) {
      return {
        title: "Cukup Baik! 👍",
        message: `Kamu mendapatkan ${score} dari 100. Terus berlatih ya!`
      };
    } else {
      return {
        title: "Ayo Belajar Lagi! 💪",
        message: `Kamu mendapatkan ${score} dari 100. Jangan menyerah, terus berlatih!`
      };
    }
  };

  const getQuestionIcon = (questionIndex) => {
    switch(questionIndex) {
      case 0: return { icon: '🥤', label: 'Gelas dan ember' }; // Diganti dengan emoji gelas
      case 4: return { icon: '🐠', label: 'Akuarium' }; // Diganti dengan emoji akuarium/ikan
      case 7: return { icon: '🧊', label: 'Volume' }; // Menggunakan emoji kubus untuk volume
      default: return { icon: '📏', label: 'Pengukuran' }; // Default icon pengukuran
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const resultMessage = getResultMessage();
  const questionIcon = getQuestionIcon(currentQuestion);

  // Tambahkan fungsi handleSaveProgress
  const handleSaveProgress = async () => {
    const gameData = {
      kelas: 4,
      bab: 4,
      level: 2,
      jenis_permainan: "Pengukuran Level 2",
      skor: score,
      skor_maksimal: 100,
      status_selesai: gameOver,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: score === 100 ? questions.length : 0,
            total_soal: questions.length
          }
        ]
      }
    };

    await saveGameProgress(gameData);
  };

  // Styles
  const styles = {
    container: {
      fontFamily: "'Comic Sans MS', cursive, sans-serif",
      backgroundImage: "linear-gradient(120deg, #e0f7fa 0%, #bbdefb 100%)",
      margin: 0,
      padding: "20px",
      color: "#37474f",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    gameCard: {
      maxWidth: "800px",
      width: "100%",
      margin: "0 auto",
      background: "white",
      padding: "30px",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)",
      position: "relative",
      overflow: "hidden",
      paddingBottom: "100px", // Menambahkan padding bottom untuk memberikan ruang bagi tombol
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
      fontSize: "2.5rem",
      fontWeight: "bold",
      background: "linear-gradient(45deg, #ff7043, #ff5722)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
    },
    instruction: {
      background: "linear-gradient(to right, #fff9c4, #fff59d)",
      padding: "15px 20px",
      borderRadius: "12px",
      marginBottom: "20px",
      borderLeft: "6px solid #ffca28",
      fontSize: "1.1rem",
      position: "relative"
    },
    instructionBubble: {
      position: "absolute",
      right: "-10px",
      top: "-10px",
      background: "#ffca28",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: "rotate(15deg)"
    },
    progressContainer: {
      height: "10px",
      background: "#e0e0e0",
      borderRadius: "10px",
      marginBottom: "20px",
      overflow: "hidden"
    },
    progressBar: {
      height: "100%",
      background: "linear-gradient(to right, #4fc3f7, #2196f3)",
      width: "0%",
      transition: "width 0.5s ease",
      borderRadius: "10px"
    },
    scoreContainer: {
      textAlign: "center",
      fontSize: "1.5rem",
      marginBottom: "20px",
      fontWeight: "bold",
      color: "#1976d2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    scoreValue: {
      display: "inline-block",
      transition: "transform 0.3s ease",
      transform: animateScore ? "scale(1.3)" : "scale(1)"
    },
    scoreLabel: {
      marginRight: "10px"
    },
    questionCard: {
      background: "rgba(236, 239, 241, 0.7)",
      padding: "25px",
      borderRadius: "15px",
      marginBottom: "70px", // Meningkatkan margin bottom
      border: "3px solid #bbdefb",
      position: "relative",
      zIndex: "1",
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
    },
    questionNumber: {
      fontWeight: "bold",
      marginBottom: "15px",
      fontSize: "1.3rem",
      color: "#0d47a1",
      display: "flex",
      alignItems: "center"
    },
    questionIcon: {
      background: "#bbdefb",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "10px"
    },
    optionGrid: {
      display: "grid",
      gridGap: "10px"
    },
    optionButton: (isSelected, isCorrect, isAnswered, isCorrectAnswer) => ({
      background: isSelected && isCorrect ? "linear-gradient(to right, #66bb6a, #43a047)" :
               isSelected && !isCorrect ? "linear-gradient(to right, #ef5350, #e53935)" :
               isAnswered && isCorrectAnswer && !isSelected ? "linear-gradient(to right, #66bb6a, #43a047)" :
               "linear-gradient(to right, #90caf9, #64b5f6)",
      padding: "15px",
      borderRadius: "10px",
      cursor: isAnswered ? "default" : "pointer",
      transition: "all 0.2s ease",
      color: (isSelected || (isAnswered && isCorrectAnswer)) ? "white" : "#37474f",
      fontWeight: "500",
      border: "2px solid transparent",
      transform: isSelected ? "translateY(-3px)" : "translateY(0)",
      boxShadow: isSelected ? "0 6px 12px rgba(0,0,0,0.15)" : "0 2px 5px rgba(0,0,0,0.1)"
    }),
    feedback: (isCorrect) => ({
      marginTop: "20px",
      padding: "15px",
      borderRadius: "10px",
      background: isCorrect ? "rgba(200, 230, 201, 0.7)" : "rgba(255, 205, 210, 0.7)",
      color: isCorrect ? "#2e7d32" : "#c62828",
      fontWeight: "500",
      border: `2px solid ${isCorrect ? "#a5d6a7" : "#ef9a9a"}`,
      display: "flex",
      alignItems: "center"
    }),
    feedbackIcon: {
      marginRight: "10px",
      fontSize: "1.5rem"
    },
    nextButton: {
      background: answered 
        ? "linear-gradient(to right, #7e57c2, #5e35b1)" 
        : "linear-gradient(to right, #9e9e9e, #757575)",
      color: "white",
      border: "none",
      padding: "15px 30px",
      borderRadius: "10px",
      cursor: answered ? "pointer" : "not-allowed",
      display: "block",
      margin: "20px auto 0",
      fontSize: "1.1rem",
      fontWeight: "bold",
      transition: "all 0.2s ease",
      boxShadow: answered ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
      position: "relative", 
      zIndex: "20",
      marginTop: "30px",
      borderWidth: "3px",
      borderColor: "white",
      borderStyle: "solid",
      opacity: answered ? 1 : 0.7
    },
    resultContainer: {
      textAlign: "center",
      padding: "20px",
      marginBottom: "60px", // Menambahkan margin bottom untuk ruang bagi tombol
      position: "relative" // Menambahkan positioning relatif
    },
    resultTitle: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#5e35b1"
    },
    resultMessage: {
      fontSize: "1.2rem",
      marginBottom: "30px"
    },
    restartButton: {
      background: "linear-gradient(to right, #ff7043, #ff5722)",
      color: "white",
      border: "none",
      padding: "15px 30px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1.1rem",
      fontWeight: "bold",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      position: "relative",
      zIndex: "10",
      marginTop: "20px",
      marginBottom: "15px" // Add margin to create space between buttons
    },
    categoryButton: {
      background: "linear-gradient(to right, #26c6da, #00acc1)",
      color: "white",
      border: "none",
      padding: "15px 30px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1.1rem",
      fontWeight: "bold",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      position: "relative",
      zIndex: "10",
      display: "block",
      margin: "0 auto"
    },
    imageContainer: {
      maxHeight: "200px", 
      display: "flex",
      justifyContent: "center",
      margin: "15px 0",
      overflow: "hidden",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    },
    questionImage: {
      maxHeight: "200px",
      objectFit: "contain"
    },
    waterContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "10%", // Mengurangi tinggi water container
      background: "linear-gradient(to bottom, rgba(100, 181, 246, 0.3), rgba(30, 136, 229, 0.5))",
      borderRadius: "0 0 20px 20px",
      zIndex: "0" // Memastikan water container berada di bawah tombol
    },
    bubbles: {
      position: "absolute",
      width: "30px",
      height: "30px",
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      borderRadius: "50%",
      bottom: "5%",
      animation: "rise 8s infinite",
      zIndex: 0
    },
    bubblesStyles: [
      { left: '10%', width: '15px', height: '15px', animationDuration: '10s', animationDelay: '0.2s' },
      { left: '20%', width: '20px', height: '20px', animationDuration: '7s', animationDelay: '2s' },
      { left: '35%', width: '25px', height: '25px', animationDuration: '9s', animationDelay: '1s' },
      { left: '55%', width: '15px', height: '15px', animationDuration: '8s', animationDelay: '3s' },
      { left: '75%', width: '20px', height: '20px', animationDuration: '11s', animationDelay: '0.5s' },
      { left: '90%', width: '25px', height: '25px', animationDuration: '6s', animationDelay: '1.5s' }
    ],
    confetti: {
      position: "absolute",
      width: "15px",
      height: "15px",
      backgroundColor: "red",
      opacity: "0.7",
      animation: "confettiFall 5s infinite"
    },
    confettiStyles: score === 100 ? [
      { top: '-10%', left: '10%', backgroundColor: '#ffeb3b', width: '10px', height: '10px', animationDelay: '0s' },
      { top: '-10%', left: '20%', backgroundColor: '#2196f3', width: '15px', height: '15px', animationDelay: '0.5s' },
      { top: '-10%', left: '30%', backgroundColor: '#f44336', width: '10px', height: '10px', animationDelay: '1s' },
      { top: '-10%', left: '40%', backgroundColor: '#4caf50', width: '15px', height: '15px', animationDelay: '1.5s' },
      { top: '-10%', left: '50%', backgroundColor: '#9c27b0', width: '10px', height: '10px', animationDelay: '2s' },
      { top: '-10%', left: '60%', backgroundColor: '#ff9800', width: '15px', height: '15px', animationDelay: '2.5s' },
      { top: '-10%', left: '70%', backgroundColor: '#e91e63', width: '10px', height: '10px', animationDelay: '3s' },
      { top: '-10%', left: '80%', backgroundColor: '#009688', width: '15px', height: '15px', animationDelay: '3.5s' },
      { top: '-10%', left: '90%', backgroundColor: '#ffeb3b', width: '10px', height: '10px', animationDelay: '4s' }
    ] : []
  };

  const cssKeyframes = `
    @keyframes rise {
      0% {
        bottom: 5%;
        opacity: 1;
      }
      100% {
        bottom: 80%;
        opacity: 0;
      }
    }
    
    @keyframes confettiFall {
      0% {
        top: -10%;
        transform: rotate(0deg);
      }
      100% {
        top: 100%;
        transform: rotate(360deg);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{cssKeyframes}</style>
      
      <div style={styles.gameCard}>
        {/* Decorative water effect for volume theme */}
        <div style={styles.waterContainer}></div>
        {styles.bubblesStyles.map((style, index) => (
          <div key={index} style={{...styles.bubbles, ...style}}></div>
        ))}
        
        {/* Confetti for perfect score */}
        {styles.confettiStyles.map((style, index) => (
          <div key={index} style={{...styles.confetti, ...style}}></div>
        ))}
        
        <h1 style={styles.title}>Game Pengukuran Volume</h1>
        
        <div style={styles.instruction}>
          <div style={styles.instructionBubble}>💧</div>
          <p>Ayo belajar mengukur volume dengan satuan tidak baku dan satuan baku! Pilih jawaban yang benar untuk setiap soal. Setiap soal bernilai 10 poin.</p>
        </div>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressBar} id="progress"></div>
        </div>
        
        <div style={styles.scoreContainer}>
          <span style={styles.scoreLabel}>Skor:</span> 
          <span style={styles.scoreValue}>{score}</span>
          <span>/100</span>
        </div>
        
        {!showResult ? (
          <div>
            <div style={styles.questionCard}>
              <div style={styles.questionNumber}>
                <span style={styles.questionIcon}>Q</span>
                {currentQuestionData.question.split(". ")[1]}
              </div>
              
              {/* Mengganti imageContainer dengan iconContainer */}
              <div style={styles.iconContainer}>
                <span>{questionIcon.icon}</span>
                <span style={styles.iconLabel}>{questionIcon.label}</span>
              </div>
              
              <div style={styles.optionGrid}>
                {currentQuestionData.options.map((option, index) => (
                  <div 
                    key={index}
                    onClick={() => selectOption(index)}
                    style={styles.optionButton(
                      selectedOption === index,
                      index === currentQuestionData.answer,
                      answered,
                      index === currentQuestionData.answer
                    )}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
              </div>
              
              {answered && (
                <div style={styles.feedback(selectedOption === currentQuestionData.answer)}>
                  <span style={styles.feedbackIcon}>
                    {selectedOption === currentQuestionData.answer ? '✅' : '❌'}
                  </span>
                  {currentQuestionData.feedback}
                </div>
              )}
              
              <button 
                onClick={nextQuestion}
                disabled={!answered}
                style={styles.nextButton}
              >
                {currentQuestion === questions.length - 1 ? 'Lihat Hasil' : 'Lanjut'}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.resultContainer}>
            <h2 style={styles.resultTitle}>{resultMessage.title}</h2>
            <p style={styles.resultMessage}>{resultMessage.message}</p>
            
            {score === 100 && (
              <div style={{
                animation: "pulse 1s infinite",
                fontSize: "5rem",
                marginBottom: "20px"
              }}>
                🏆
              </div>
            )}
            
            <button 
              onClick={restartGame}
              style={styles.restartButton}
            >
              Main Lagi
            </button>
            
            <button 
              onClick={goToCategory}
              style={styles.categoryButton}
            >
              Kembali ke Kategori
            </button>
          </div>
        )}
      </div>
    </div>
  );
}