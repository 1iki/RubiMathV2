import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { saveGameProgress } from "../../../../services/gameProgressService";

const questions = [
  {
    question: "Berapakah hasil dari 0,3 + 0,6?",
    answers: ["0,9", "0,8", "1,0", "0,7"],
    correct: "0,9",
  },
  {
    question:
      "Jika kamu memiliki 0,7 kg apel dan menambah 0,2 kg lagi, berapa berat apel sekarang?",
    answers: ["0,5 kg", "0,9 kg", "0,8 kg", "0,6 kg"],
    correct: "0,9 kg",
  },
  {
    question: "Berapa nilai 0,5 dikurangi 0,3?",
    answers: ["0,8", "0,2", "0,3", "0,6"],
    correct: "0,2",
  },
  {
    question: "0,4 + 0,2 sama dengan ...?",
    answers: ["0,6", "0,42", "0,8", "0,7"],
    correct: "0,6",
  },
  {
    question: "Pecahan desimal manakah yang sama dengan tiga per sepuluh?",
    answers: ["0,03", "0,3", "0,30", "Semua benar"],
    correct: "Semua benar",
  },
  {
    question: "Jumlahkan 0,1 + 0,1 + 0,1. Berapa hasilnya?",
    answers: ["0,2", "0,3", "0,01", "1,3"],
    correct: "0,3",
  },
  {
    question: "Berapakah hasil dari 1 dikurangi 0,4?",
    answers: ["0,6", "0,4", "1,4", "0,5"],
    correct: "0,6",
  },
  {
    question: "Jika 0,7 liter air dikurangi 0,2 liter, sisa air berapa liter?",
    answers: ["0,9", "0,5", "0,4", "0,6"],
    correct: "0,5",
  },
  {
    question: "0,9 + 0,1 sama dengan ...?",
    answers: ["1,0", "0,01", "10", "9,1"],
    correct: "1,0",
  },
  {
    question: "Pecahan desimal untuk lima per sepuluh adalah ...?",
    answers: ["0,5", "0,05", "5,0", "0,50"],
    correct: "0,5",
  },
];

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    background: "white",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    padding: 30,
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    color: "#ff6f61",
    fontSize: "2.5rem",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#444",
    marginBottom: 25,
  },
  questionNumber: {
    fontSize: "1rem",
    marginBottom: 15,
    fontWeight: 600,
    color: "#777",
  },
  questionText: {
    fontSize: "1.4rem",
    marginBottom: 25,
    fontWeight: 600,
    color: "#333",
  },
  answers: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    marginBottom: 25,
  },
  answerBtn: {
    background: "#ffbaba",
    border: "none",
    borderRadius: 12,
    padding: "15px 20px",
    fontSize: "1.1rem",
    cursor: "pointer",
    color: "#5a2120",
    transition: "background 0.3s ease",
  },
  answerBtnHover: {
    background: "#ff7b79",
    color: "white",
  },
  answerCorrect: {
    background: "#a2f7a2",
    color: "#285428",
    cursor: "default",
  },
  answerWrong: {
    background: "#f79a9a",
    color: "#810000",
    cursor: "default",
  },
  feedback: {
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: 25,
    minHeight: 28,
  },
  score: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#e25822",
  },
  nextBtn: {
    background: "#ff6f61",
    color: "white",
    border: "none",
    borderRadius: 15,
    padding: "15px 35px",
    fontSize: "1.2rem",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  nextBtnHover: {
    background: "#d94e47",
  },
  resultContainer: {
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  emoji: {
    fontSize: "3rem",
    marginBottom: 20,
  },
  award: {
    margin: "30px auto",
    maxWidth: 200,
    background: "#fff5e6",
    border: "3px solid #ffcc80",
    borderRadius: 15,
    padding: 20,
    boxShadow: "0 6px 15px rgba(255, 153, 0, 0.2)",
  },
  awardIcon: {
    fontSize: "4rem",
    marginBottom: 10,
  },
  awardText: {
    color: "#ff8c00",
    fontSize: "1.2rem",
    fontWeight: 700,
  },
  categoryBtn: {
    background: "#4E6BFF",
    color: "white",
    border: "none",
    borderRadius: 15,
    padding: "15px 35px",
    fontSize: "1.2rem",
    marginTop: 20,
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  categoryBtnHover: {
    background: "#3a50c2",
  }
};

function DecimalFractionsQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSaveProgress = async () => {
    if (!user) return;
    
    const gameData = {
      kelas: 4,
      bab: 2,
      level: 3,
      jenis_permainan: "Game Pecahan Desimal",
      skor: score,
      skor_maksimal: questions.length * 10,
      status_selesai: gameOver,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: score / 10,
            total_soal: questions.length
          }
        ]
      }
    };

    await saveGameProgress(gameData);
  };

  useEffect(() => {
    if (score > 0 || gameOver) {
      handleSaveProgress();
    }
  }, [score, gameOver]);

  function shuffleArray(array) {
    return array
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  const currentQuestion = questions[currentQuestionIndex];
  const shuffledAnswers = shuffleArray(currentQuestion.answers);

  function handleAnswerClick(answer) {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === currentQuestion.correct) {
      setScore((prev) => prev + 10);
    }
  }

  function handleNextQuestion() {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setGameOver(true);
    }
  }

  function handleRestart() {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowFeedback(false);
    setGameOver(false);
  }
  
  function handleBackToCategory() {
    navigate("/category4_bab2");
  }

  function getAward() {
    const maxScore = questions.length * 10;
    const percentage = (score / maxScore) * 100;
    
    if (percentage === 100) {
      return {
        icon: "🏆",
        text: "Medali Emas",
        description: "Kamu menguasai pecahan desimal dengan sempurna!"
      };
    } else if (percentage >= 80) {
      return {
        icon: "🥈",
        text: "Medali Perak",
        description: "Kamu sangat baik dalam pecahan desimal!"
      };
    } else if (percentage >= 60) {
      return {
        icon: "🥉",
        text: "Medali Perunggu",
        description: "Kamu cukup baik dengan pecahan desimal!"
      };
    } else {
      return {
        icon: "🌟",
        text: "Bintang Partisipasi",
        description: "Terus berlatih ya!"
      };
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Game Pecahan Desimal</h1>
      <div style={styles.subtitle}>
        Menghitung Pecahan Desimal Sampai Persepuluhan
      </div>
      {!gameOver ? (
        <div>
          <div style={styles.questionNumber}>
            Soal {currentQuestionIndex + 1} dari {questions.length}
          </div>
          <div style={styles.questionText}>{currentQuestion.question}</div>
          <div style={styles.answers}>
            {shuffledAnswers.map((answer, index) => {
              const isCorrectAnswer = answer === currentQuestion.correct;
              const isSelected = answer === selectedAnswer;
              let btnStyle = { ...styles.answerBtn };
              if (showFeedback) {
                btnStyle.cursor = "default";
                if (isCorrectAnswer) {
                  btnStyle = { ...btnStyle, ...styles.answerCorrect };
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = { ...btnStyle, ...styles.answerWrong };
                } else {
                  btnStyle.opacity = 0.6;
                }
              }
              return (
                <button
                  key={index}
                  style={btnStyle}
                  onClick={() => handleAnswerClick(answer)}
                  disabled={showFeedback}
                  onMouseOver={(e) => {
                    if (!showFeedback) {
                      e.target.style.background = "#ff7b79";
                      e.target.style.color = "white";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!showFeedback) {
                      e.target.style.background = "#ffbaba";
                      e.target.style.color = "#5a2120";
                    }
                  }}
                >
                  {answer}
                </button>
              );
            })}
          </div>
          <div style={styles.feedback}>
            {showFeedback && selectedAnswer === currentQuestion.correct && (
              <span style={{ color: "#285428" }}>✅ Benar! Bagus sekali. +10 poin</span>
            )}
            {showFeedback && selectedAnswer !== currentQuestion.correct && (
              <span style={{ color: "#810000" }}>
                ❌ Salah! Jawaban yang benar adalah "{currentQuestion.correct}". +0 poin
              </span>
            )}
          </div>
          <button
            style={styles.nextBtn}
            onClick={handleNextQuestion}
            disabled={!showFeedback}
            onMouseOver={(e) => {
              e.target.style.background = "#d94e47";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#ff6f61";
            }}
          >
            {currentQuestionIndex + 1 === questions.length
              ? "Lihat Hasil"
              : "Soal Berikutnya"}
          </button>
        </div>
      ) : (
        <div style={styles.resultContainer}>
          <div style={styles.emoji}>
            {score === questions.length * 10
              ? "🌟🎉 Sempurna! Kamu hebat! 🎉🌟"
              : score >= questions.length * 7
              ? "👍 Bagus! Terus belajar ya!"
              : "🤔 Jangan menyerah, coba lagi ya!"}
          </div>
          <div style={styles.score}>
            Skor kamu adalah {score} dari {questions.length * 10}.
          </div>
          
          <div style={styles.award}>
            <div style={styles.awardIcon}>
              {getAward().icon}
            </div>
            <div style={styles.awardText}>
              {getAward().text}
            </div>
            <div style={{fontSize: "1rem", marginTop: 10, color: "#666"}}>
              {getAward().description}
            </div>
          </div>
          
          <button
            style={{ ...styles.nextBtn, marginTop: 30 }}
            onClick={handleRestart}
            onMouseOver={(e) => {
              e.target.style.background = "#d94e47";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#ff6f61";
            }}
          >
            Mainkan Lagi
          </button>
          
          <button
            style={styles.categoryBtn}
            onClick={handleBackToCategory}
            onMouseOver={(e) => {
              e.target.style.background = "#3a50c2";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#4E6BFF";
            }}
          >
            Kembali ke Kategori
          </button>
        </div>
      )}
    </div>
  );
}

export default DecimalFractionsQuiz;


