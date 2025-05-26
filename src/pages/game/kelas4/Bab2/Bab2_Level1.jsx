import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGameProgress, getGameProgress } from "../../../../services/gameProgressService";

const questions = [
  {
    story: "Di sebuah ladang, ada 4 petani. Masing-masing petani mengambil bagian dari ladang yang sama. Jika pembilangnya satu dan penyebutnya 4, berapa bagian ladang yang diambil oleh satu petani?",
    questionText: "Berapa pecahan yang menunjukkan bagian satu petani?",
    choices: ["1/2", "1/4", "1/3", "1/5"],
    answer: "1/4",
  },
  {
    story: "Luna mempunyai 5 kue yang dibagi sama rata kepada teman-temannya. Jika Luna memberikan satu potong kue, pecahan yang menunjukkan bagian kue yang Luna berikan adalah?",
    questionText: "Bagian kue yang diberikan Luna adalah?",
    choices: ["1/5", "1/4", "1/6", "2/5"],
    answer: "1/5",
  },
  {
    story: "Pak Budi memotong 6 batang kayu menjadi bagian yang sama, lalu memberikan satu bagian kepada tetangganya. Berapakah pecahan yang mewakili bagian kayu yang diberikan kepada tetangga?",
    questionText: "Pecahan bagian kayu yang diberikan adalah?",
    choices: ["1/6", "1/5", "1/4", "2/6"],
    answer: "1/6",
  },
  {
    story: "Di kelas ada 8 pensil yang dibagi sama kepada 8 anak. Satu anak mendapat satu pensil. Pecahan yang menunjukkan bagian pensil satu anak adalah?",
    questionText: "Bagian pensil yang didapat satu anak adalah?",
    choices: ["1/8", "1/4", "1/7", "2/8"],
    answer: "1/8",
  },
  {
    story: "Siti memotong sebuah roti menjadi 3 bagian yang sama besar. Siti kemudian mengambil satu bagian roti untuk dimakan. Pecahan yang menunjukkan bagian roti yang diambil Siti adalah?",
    questionText: "Bagian roti yang diambil Siti adalah?",
    choices: ["1/3", "2/3", "1/2", "3/3"],
    answer: "1/3",
  },
  {
    story: "Ada 7 buah bola yang dibagikan sama rata kepada 7 pemain. Setiap pemain mendapat satu bola. Pecahan bola yang diterima satu pemain adalah?",
    questionText: "Pecahan yang tepat untuk satu bola pemain adalah?",
    choices: ["1/7", "2/7", "1/6", "3/7"],
    answer: "1/7",
  },
  {
    story: "Pak Andi memiliki 9 jeruk, lalu ia membagikan satu jeruk kepada setiap murid. Pecahan yang menyatakan satu jeruk dari jeruk yang dimiliki Pak Andi adalah?",
    questionText: "Bagian jeruk yang dibagikan adalah?",
    choices: ["1/9", "1/8", "1/7", "2/9"],
    answer: "1/9",
  },
  {
    story: "Sebuah pizza dibagi menjadi 10 potongan sama besar. Lina makan satu potong pizza. Pecahan yang menunjukkan pizza yang dimakan Lina adalah?",
    questionText: "Pizza yang dimakan Lina adalah bagian?",
    choices: ["1/10", "1/9", "2/10", "3/10"],
    answer: "1/10",
  },
  {
    story: "Dalam sebuah perlombaan, hadiah utama dibagi menjadi 12 bagian sama besar. Hadi mendapatkan satu bagian hadiah. Pecahan bagian hadiah Hadi adalah?",
    questionText: "Berapa pecahan bagian hadiah Hadi?",
    choices: ["1/12", "1/11", "2/12", "1/10"],
    answer: "1/12",
  },
  {
    story: "Sebuah kue tart dipotong menjadi 15 bagian yang sama. Rina mengambil satu potong kue tersebut. Pecahan yang tepat untuk bagian kue yang diambil Rina adalah?",
    questionText: "Bagian kue Rina adalah?",
    choices: ["1/15", "2/15", "1/14", "3/15"],
    answer: "1/15",
  },
];

// CSS as a string for style injection
const styles = `
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }
  body {
    margin: 0;
    background: #a6e887;
    font-family: 'Comic Neue', cursive, Arial, sans-serif;
    color: #2d3436;
    user-select: none;
    min-height: 100vh;
    position: relative;
    font-size: 18px; /* Base font size increased */
  }
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }
  header {
    background-color: #00a2ff;
    padding: 20px 15px;
    text-align: center;
    color: white;
    font-weight: 700;
    font-size: 2.6em;
    letter-spacing: 1px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
    z-index: 2;
  }
  main {
    max-width: 1200px;
    width: 80%;
    margin: 30px auto;
    background: white;
    border-radius: 15px;
    padding: 40px 50px 45px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
  }
  .scoreboard {
    font-weight: 700;
    font-size: 1.5em;
    margin-bottom: 25px;
    text-align: right;
    color: #00a2ff;
  }
  .story {
    font-size: 1.6em;
    margin-bottom: 30px;
    line-height: 1.6;
    font-weight: 500;
    color: #2d3436;
  }
  .question {
    font-weight: 700;
    font-size: 1.7em;
    margin-bottom: 30px;
    color: #2d3436;
    text-align: center;
  }
  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    justify-content: center;
    margin-bottom: 30px;
  }
  button.choice-btn {
    background: #00c9c0;
    border: none;
    border-radius: 10px;
    padding: 25px 0;
    font-size: 1.8em;
    font-weight: 700;
    color: white;
    cursor: pointer;
    box-shadow: 0 6px 12px rgba(0,201,192,0.4);
    transition: all 0.2s ease;
    user-select: none;
  }
  button.choice-btn:hover:not(:disabled),
  button.choice-btn:focus-visible:not(:disabled) {
    background: #00b3aa;
    outline: none;
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0,179,170,0.6);
  }
  button.choice-btn:disabled {
    cursor: default;
    opacity: 0.9;
  }
  .correct {
    background-color:rgb(0, 125, 52) !important;
    box-shadow: 0 6px 16px rgba(39,174,96,0.5) !important;
  }
  .wrong {
    background-color: #e74c3c !important;
    box-shadow: 0 6px 16px rgba(214,48,49,0.5) !important;
  }
  .feedback {
    text-align: center;
    font-weight: 700;
    font-size: 1.6em;
    margin-bottom: 28px;
    min-height: 40px;
    color: #2d3436;
  }
  .next-btn {
    display: block;
    margin: 0 auto;
    background: #00a2ff;
    color: white;
    font-weight: 700;
    font-size: 1.6em;
    border: none;
    padding: 20px 40px;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(9,132,227,0.4);
    transition: all 0.2s ease;
    user-select: none;
  }
  .next-btn:hover,
  .next-btn:focus-visible {
    background: #0088dd;
    outline: none;
    transform: translateY(-3px);
    box-shadow: 0 8px 22px rgba(9,132,227,0.6);
  }
  .hidden {
    display: none;
  }
  .final-score {
    text-align: center;
    font-size: 2em;
    font-weight: 700;
    margin: 20px 0;
    color: #00a2ff;
    white-space: pre-line;
    line-height: 1.4;
  }
  /* Background bubbles */
  .background-bubbles {
    position: fixed;
    top: 0; left: 0; 
    width: 100vw; 
    height: 100vh; 
    pointer-events: none; 
    z-index: 0;
    overflow: hidden;
  }
  .bubble {
    position: absolute;
    bottom: -100px;
    background: rgba(9,132,227,0.1);
    border-radius: 50%;
    opacity: 0.5;
    animation-name: rise;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes rise {
    from {
      bottom: -100px;
      opacity: 0.5;
    }
    to {
      bottom: 110vh;
      opacity: 0;
    }
  }
  /* Badge styles */
  .badge-container {
    margin: 40px auto;
    text-align: center;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .badge {
    display: flex;
    background: linear-gradient(135deg, #f6e27f, #d4af37);
    border-radius: 50%;
    width: 120px;
    height: 120px;
    box-shadow:
      0 0 15px #fff8b8,
      0 0 20px #d4af37;
    position: relative;
    animation: glow 3s ease-in-out infinite alternate;
    font-size: 4rem;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 900;
    text-shadow: 0 0 15px #d4af37;
    margin: 0 auto;
  }
  @keyframes glow {
    0% { box-shadow:
      0 0 15px #fff8b8,
      0 0 20px #d4af37; }
    100% { box-shadow:
      0 0 20px #fff8b8,
      0 0 30px #d4af37;}
  }
  .badge-text {
    margin-top: 15px;
    font-weight: 700;
    font-size: 1.4rem;
    color: #996515;
    text-shadow: 0 0 5px #fff8b8;
    text-align: center;
  }
  
  .game-complete-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  @media screen and (max-width: 1400px) {
    main {
      width: 85%;
    }
  }
  
  @media screen and (max-width: 992px) {
    main {
      width: 90%;
    }
    .choices {
      grid-template-columns: 1fr;
    }
    button.choice-btn {
      padding: 20px 0;
      font-size: 1.6em;
    }
  }
  
  @media screen and (max-width: 768px) {
    body {
      font-size: 16px;
    }
    main {
      width: 95%;
      padding: 30px 35px;
    }
    header {
      font-size: 2.2em;
      padding: 15px 10px;
    }
  }
`;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default function FractionAdventure() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const nextButtonRef = useRef(null);
  const navigate = useNavigate();

  // Initialize shuffled choices on question change
  useEffect(() => {
    if(currentQuestionIndex < questions.length){
      const choicesCopy = [...questions[currentQuestionIndex].choices];
      shuffleArray(choicesCopy);
      setShuffledChoices(choicesCopy);
      setSelectedChoice(null);
      setFeedback('');
      setShowNext(false);
    }
  }, [currentQuestionIndex]);

  // Adding the bubble creation function for the animated background
  useEffect(() => {
    const bubbleContainer = document.getElementById('background-bubbles');
    if (!bubbleContainer) return;
    
    // Clear existing bubbles
    bubbleContainer.innerHTML = '';
    
    // Create new bubbles
    const bubbleCount = 15;
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      
      // Random size between 20px and 100px
      const size = Math.random() * 80 + 20;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      
      // Random horizontal position
      bubble.style.left = `${Math.random() * 100}vw`;
      
      // Random animation duration between 15-30 seconds
      const duration = Math.random() * 15 + 15;
      bubble.style.animationDuration = `${duration}s`;
      
      // Random animation delay
      bubble.style.animationDelay = `${Math.random() * 15}s`;
      
      bubbleContainer.appendChild(bubble);
    }
    
    return () => {
      // Cleanup on unmount
      if (bubbleContainer) {
        bubbleContainer.innerHTML = '';
      }
    };
  }, []);

  const handleChoiceSelect = (choice) => {
    if(showNext) return; // do nothing if already answered

    const correctAnswer = questions[currentQuestionIndex].answer;
    setSelectedChoice(choice);
    if(choice === correctAnswer){
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedback('Betul sekali! Kamu dapat 10 poin!');
    } else {
      setFeedback(`Wah, belum tepat. Jawaban yang benar adalah ${correctAnswer}. Ayo coba soal berikutnya!`);
    }
    setShowNext(true);

    // Focus next button after feedback
    setTimeout(() => {
      if(nextButtonRef.current) nextButtonRef.current.focus();
    }, 100);
  };

  const handleSaveProgress = async () => {
    const gameData = {
      kelas: 4,
      bab: 2,
      level: 1,
      jenis_permainan: "Bilangan Bulat",
      skor: score,
      skor_maksimal: 100,
      status_selesai: gameOver,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: correctAnswers,
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

  const handleNext = () => {
    if(currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameOver(true);
      handleSaveProgress();
    }
  };

  const handleBackToCategory = () => {
    navigate("/category4_bab2");
  };

  return (
    <div className="app-container">
      <style>{styles}</style>
      <header role="banner">Petualangan Pecahan Seru + Interaktif</header>
      <main role="main" aria-live="polite" aria-atomic="true">
        <div className="scoreboard" aria-label="Skor saat ini">
          Skor: {score} / 100
        </div>
        {!gameOver ? (
        <>
        <div className="story">{questions[currentQuestionIndex].story}</div>
        <div className="question">{questions[currentQuestionIndex].questionText}</div>
        <div className="choices" role="list" aria-label="Pilihan jawaban">
          {shuffledChoices.map((choice, index) => {
            const isCorrect = choice === questions[currentQuestionIndex].answer;
            const isSelected = choice === selectedChoice;
            let className = 'choice-btn';
            if (showNext) {
              if (isCorrect) className += ' correct';
              else if (isSelected && !isCorrect) className += ' wrong';
            }
            
            // Create a grid layout with 2 buttons per row that resembles the screenshot
            return (
              <button
                key={choice}
                className={className}
                onClick={() => handleChoiceSelect(choice)}
                disabled={showNext}
                role="listitem"
                tabIndex={0}
                onKeyDown={e => {
                  if(e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if(!showNext) handleChoiceSelect(choice);
                  }
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>
        <div className="feedback" aria-live="assertive" aria-atomic="true">{feedback}</div>
        {showNext && (
          <button
            className="next-btn"
            onClick={handleNext}
            ref={nextButtonRef}
            aria-label="Soal Berikutnya"
            onKeyDown={e => {
              if(e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNext();
              }
            }}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya ▶' : 'Selesai ✓'}
          </button>
        )}
        </>
        ) : (
          <>
            <div className="final-score" tabIndex={0}>
              {`Selamat! Kamu sudah menyelesaikan petualangan pecahan ini!\n\nSkor Akhir Kamu: ${score} / 100\n\nTerima kasih sudah bermain! Kamu luar biasa!`}
            </div>
            <div className="badge-container">
              <div className="badge">
                🏅
              </div>
              <div className="badge-text">
                Selamat! Kamu Mendapatkan Lencana Keberhasilan!
              </div>
            </div>
            <button
              className="next-btn"
              onClick={handleBackToCategory}
              style={{marginTop: "20px"}}
              aria-label="Kembali ke Kategori"
            >
              Kembali ke Kategori
            </button>
          </>
        )}
      </main>
      <div id="background-bubbles" className="background-bubbles" aria-hidden="true"></div>
    </div>
  );
}

