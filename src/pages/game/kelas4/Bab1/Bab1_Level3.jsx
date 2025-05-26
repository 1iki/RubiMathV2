import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../../context/AuthContext";
import { saveGameProgress } from "../../../../services/gameProgressService";
import '../games4.css';

const questions = [
  { q: '125 × 4 = ?', a: 500 },
  { q: '900 ÷ 3 = ?', a: 300 },
  { q: '56 × 7 = ?', a: 392 },
  { q: '864 ÷ 12 = ?', a: 72 },
  { q: '35 × 25 = ?', a: 875 },
  { q: '720 ÷ 8 = ?', a: 90 },
  { q: '44 × 23 = ?', a: 1012 },
  { q: '945 ÷ 9 = ?', a: 105 },
  { q: '18 × 56 = ?', a: 1008 },
  { q: '680 ÷ 4 = ?', a: 170 },
];

// shuffle utility function
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// generate options close to correct answer
function generateOptions(correct) {
  const options = new Set();
  options.add(correct);
  while (options.size < 4) {
    const perturb = Math.floor(Math.random() * 60) + 1;
    const addOrSub = Math.random() > 0.5 ? 1 : -1;
    const option = correct + addOrSub * perturb;
    if (option > 0) options.add(option);
  }
  return shuffle(Array.from(options));
}

// Fungsi untuk membuat efek konfeti sederhana
const Confetti = ({ active }) => {
  const confettiElements = Array.from({ length: 50 }, (_, i) => i);
  
  const getRandomStyles = (index) => {
    const randomLeft = Math.random() * 100;
    const randomSize = Math.random() * 8 + 6;
    const randomDelay = (Math.random() * 2).toFixed(1);
    const randomRotation = Math.random() * 360;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const duration = `${Math.random() * 2 + 2}s`;
    
    return {
      width: `${randomSize}px`,
      height: `${randomSize}px`,
      backgroundColor: randomColor,
      left: `${randomLeft}%`,
      transform: `rotate(${randomRotation}deg)`,
      animationDelay: `${randomDelay}s`,
      position: 'absolute',
      top: '-10px',
      opacity: active ? 1 : 0,
      zIndex: 5,
      borderRadius: '50%',
      animation: active ? `confetti-fall ${duration} linear forwards` : 'none'
    };
  };

  return (
    <div className="confetti-container">
      {confettiElements.map((index) => (
        <div
          key={index}
          className="confetti-piece"
          style={getRandomStyles(index)}
        />
      ))}
      <style jsx="true">{`
        @keyframes confetti-fall {
          0% {
            top: -10px;
            opacity: 1;
          }
          100% {
            top: 100vh;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function GamePerkalianPembagian() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showScore, setShowScore] = useState(false);
  const [answerButtonsDisabled, setAnswerButtonsDisabled] = useState(false);
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shuffledQuestions] = useState(() => shuffle([...questions]));
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
      bab: 1,
      level: 3,
      jenis_permainan: "Game Perkalian dan Pembagian",
      skor: score,
      skor_maksimal: questions.length * 10,
      status_selesai: showScore,
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
    if (score > 0 || showScore) {
      handleSaveProgress();
    }
  }, [score, showScore]);

  // Gunakan useMemo untuk menjaga konsistensi opsi jawaban
  const currentQuestion = shuffledQuestions[currentIdx];
  const options = useMemo(() => 
    generateOptions(currentQuestion?.a || 0), 
    [currentQuestion]
  );

  function handleAnswer(option) {
    if (answerButtonsDisabled) return;
    setSelected(option);
    setAnswerButtonsDisabled(true);
    setIsFeedbackActive(true);

    if (option === currentQuestion.a) {
      setScore(prev => prev + 10);
      setFeedback('Benar! 🎉 +10 poin');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setFeedback(`Salah! Jawaban yang benar: ${currentQuestion.a}`);
    }

    setTimeout(() => {
      setFeedback('');
      setIsFeedbackActive(false);
      setSelected(null);
      setAnswerButtonsDisabled(false);
      if (currentIdx + 1 < shuffledQuestions.length) {
        setCurrentIdx(idx => idx + 1);
      } else {
        setShowScore(true);
      }
    }, 1800);
  }

  function restartGame() {
    window.location.reload(); // Reload halaman untuk memulai ulang permainan dengan soal yang benar-benar baru
  }

  function goBackToCategory() {
    navigate('/category4_bab1'); // Navigasi kembali ke halaman kategori
  }

  const getScoreMessage = () => {
    if (score === 100) return "Sempurna! 🏆";
    if (score >= 80) return "Hebat! 🎉";
    if (score >= 60) return "Bagus! 👍";
    if (score >= 40) return "Cukup baik. 😊";
    return "Ayo berlatih lagi! 💪";
  };

  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#e6f2ff'
  };

  const cardStyle = {
    width: '90%',
    maxWidth: '650px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: '#F06292',
    textAlign: 'center',
    marginBottom: '1rem',
    fontWeight: 'bold'
  };

  const subtitleStyle = {
    fontSize: '1.5rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const progressStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1.5rem'
  };

  const questionBoxStyle = {
    backgroundColor: '#f0fff0',
    padding: '2rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '150px'
  };

  const questionTextStyle = {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    textAlign: 'center'
  };

  const optionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const optionButtonBaseStyle = {
    padding: '1.5rem',
    fontSize: '2rem',
    fontWeight: 'bold',
    border: '2px solid #ddd',
    borderRadius: '15px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.2rem',
    color: '#666'
  };
  
  const progressTextStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4CAF50'
  };

  const buttonContainerStyle = {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1rem',
    alignItems: 'center'
  };

  const restartButtonStyle = {
    background: 'linear-gradient(to right, #FF5F6D, #FFC371)',
    color: 'white',
    padding: '1rem 2.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: '100%',
    maxWidth: '350px'
  };

  const backButtonStyle = {
    background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
    color: 'white',
    padding: '1rem 2.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: '100%',
    maxWidth: '350px'
  };

  return (
    <div style={containerStyle}>
      <Confetti active={showConfetti} />
      
      <div style={cardStyle}>
        <h1 style={titleStyle}>Game Matematika</h1>
        <p style={subtitleStyle}>Perkalian & Pembagian Sampai 1.000</p>

        {!showScore && (
          <>
            <div style={progressStyle}>
              <p style={progressTextStyle}>{`Soal ${currentIdx + 1} dari ${shuffledQuestions.length}`}</p>
            </div>
            
            <div style={questionBoxStyle}>
              <p style={questionTextStyle}>{currentQuestion.q}</p>
            </div>
            
            <div style={optionsGridStyle}>
              {options.map((option) => {
                const isCorrect = selected === option && option === currentQuestion.a;
                const isWrong = selected === option && option !== currentQuestion.a;
                
                const optionButtonStyle = {
                  ...optionButtonBaseStyle,
                  backgroundColor: isCorrect ? '#d4edda' : isWrong ? '#f8d7da' : '#f8f9fa',
                  color: isCorrect ? '#155724' : isWrong ? '#721c24' : '#333',
                  transform: isCorrect ? 'scale(1.05)' : 'scale(1)',
                  borderColor: isCorrect ? '#c3e6cb' : isWrong ? '#f5c6cb' : '#ddd',
                };
                
                return (
                  <button
                    key={option}
                    style={optionButtonStyle}
                    onClick={() => handleAnswer(option)}
                    disabled={answerButtonsDisabled}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            
            <div style={{ 
              textAlign: 'center',
              minHeight: '50px',
              opacity: isFeedbackActive ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              <p style={{ 
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: feedback.startsWith('Benar') ? '#155724' : '#721c24'
              }}>
                {feedback}
              </p>
            </div>
          </>
        )}

        {showScore && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Permainan Selesai!
            </h2>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '2rem',
              borderRadius: '15px',
              marginBottom: '2rem'
            }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F06292', marginBottom: '1rem' }}>
                Skor Anda: {score} dari 100
              </p>
              <p style={{ fontSize: '1.8rem', color: '#4CAF50' }}>
                {getScoreMessage()}
              </p>
            </div>
            
            <div style={buttonContainerStyle}>
              <button 
                onClick={restartGame} 
                style={restartButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                Mulai Ulang Permainan
              </button>
              
              <button 
                onClick={goBackToCategory} 
                style={backButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                Kembali ke Kategori
              </button>
            </div>
          </div>
        )}

        <footer style={footerStyle}>
          Selamat belajar! 🎓
        </footer>
      </div>
    </div>
  );
}

