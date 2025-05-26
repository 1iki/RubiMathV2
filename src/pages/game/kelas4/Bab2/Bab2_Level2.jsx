import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../../context/AuthContext";
import { saveGameProgress } from "../../../../services/gameProgressService";

const styles = {
  body: {
    background: 'linear-gradient(135deg, #fceabb, #f8b500)',
    fontFamily: "'Poppins', sans-serif",
    margin: 0,
    padding: 0,
    color: '#222',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  gameContainer: {
    background: '#fff',
    borderRadius: 20,
    padding: '25px 30px 40px 30px',
    maxWidth: 480,
    width: '90vw',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  heading: {
    marginBottom: 15,
    color: '#f79a00',
    textShadow: '1px 1px 4px #dd7700',
    userSelect: 'none',
  },
  instructions: {
    fontSize: '1.05rem',
    marginBottom: 20,
    color: '#444',
  },
  questionNumber: {
    fontSize: '1rem',
    marginBottom: 10,
    fontWeight: 600,
    color: '#f79a00',
  },
  questionText: {
    fontSize: '1.3rem',
    marginBottom: 25,
    fontWeight: 600,
  },
  answers: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  answerBtn: {
    background: '#f8b500',
    border: 'none',
    borderRadius: 12,
    padding: '15px 20px',
    fontSize: '1.15rem',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 6px #c28c00',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    minWidth: 110,
    margin: '5px',
  },
  answerBtnHover: {
    background: '#dda200',
  },
  answerBtnActive: {
    transform: 'translateY(3px)',
    boxShadow: '0 3px #c28c00',
  },
  correct: {
    backgroundColor: '#4caf50',
    boxShadow: '0 6px #357a38',
    cursor: 'default',
    opacity: 1,
  },
  wrong: {
    backgroundColor: '#e53935',
    boxShadow: '0 6px #a32b2b',
    cursor: 'default',
    opacity: 1,
  },
  feedback: {
    marginTop: 20,
    fontSize: '1.2rem',
    fontWeight: 700,
    height: 32,
    color: '#222',
    userSelect: 'none',
    minHeight: 24,
  },
  nextBtn: {
    marginTop: 25,
    backgroundColor: '#f79a00',
    border: 'none',
    padding: '12px 30px',
    borderRadius: 30,
    fontSize: '1.15rem',
    cursor: 'pointer',
    color: 'white',
    boxShadow: '0 6px #c27100',
    userSelect: 'none',
    display: 'inline-block',
    transition: 'background-color 0.3s',
  },
  nextBtnHover: {
    backgroundColor: '#dd7f00',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    height: 15,
    marginBottom: 20,
    boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.1)',
  },
  progressBar: {
    height: '100%',
    background: '#f79a00',
    width: '0%',
    transition: 'width 0.4s ease',
  },
  score: {
    marginTop: 15,
    fontWeight: 600,
    fontSize: '1.1rem',
    color: '#444',
    userSelect: 'none',
  },
  fraction: {
    display: 'inline-block',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontWeight: 700,
    lineHeight: 1,
    userSelect: 'none',
  },
  fractionTop: {
    borderBottom: '2px solid #222',
    fontSize: '1.2rem',
    color: '#2c3e50',
    padding: '0 6px',
  },
  fractionBottom: {
    fontSize: '1.2rem',
    color: '#2c3e50',
    padding: '0 6px',
  },
  startBtn: {
    fontSize: '1.5rem',
    backgroundColor: '#f79a00',
    border: 'none',
    color: 'white',
    padding: '20px 40px',
    borderRadius: 35,
    cursor: 'pointer',
    boxShadow: '0 8px #c27100',
    transition: 'background-color 0.3s ease',
    marginTop: 30,
    userSelect: 'none',
  },
  categoryBtn: {
    fontSize: '1.2rem',
    backgroundColor: '#4E6BFF',
    border: 'none',
    color: 'white',
    padding: '15px 30px',
    borderRadius: 35,
    cursor: 'pointer',
    boxShadow: '0 6px #3a50c2',
    transition: 'background-color 0.3s ease',
    marginTop: 15,
    userSelect: 'none',
  },
};

function FractionDisplay({ num, den }) {
  if (den === 1) return <span aria-label={`${num}`}>{num}</span>;
  return (
    <span
      style={styles.fraction}
      role="img"
      aria-label={`${num} per ${den}`}
    >
      <span style={styles.fractionTop}>{num}</span>
      <span style={styles.fractionBottom}>{den}</span>
    </span>
  );
}

// Helper shuffle function
function shuffle(array) {
  let arr = array.slice();
  let currentIndex = arr.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }
  return arr;
}

// Fraction class helper for easy fraction comparison
class FractionObj {
  constructor(num, den) {
    this.num = num;
    this.den = den;
  }
  
  value() {
    return this.num / this.den;
  }
  
  // Improved fraction equality check
  equals(other) {
    // Calculate greatest common divisor to compare in simplified form
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    
    const thisGcd = gcd(this.num, this.den);
    const otherGcd = gcd(other.num, other.den);
    
    const thisSimplifiedNum = this.num / thisGcd;
    const thisSimplifiedDen = this.den / thisGcd;
    const otherSimplifiedNum = other.num / otherGcd;
    const otherSimplifiedDen = other.den / otherGcd;
    
    return thisSimplifiedNum === otherSimplifiedNum && thisSimplifiedDen === otherSimplifiedDen;
  }
  
  // Check if fractions are approximately equal (for floating point comparisons)
  approxEquals(other) {
    return Math.abs(this.value() - other.value()) < 0.0001;
  }
  
  toString() {
    return `${this.num}/${this.den}`;
  }
}

function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].num !== arr2[i].num || arr1[i].den !== arr2[i].den) return false;
  }
  return true;
}

const questions = [
  {
    type: 'order',
    prompt: 'Urutkan pecahan berikut dari yang terkecil ke terbesar:',
    fractions: [
      new FractionObj(3, 8),
      new FractionObj(1, 4),
      new FractionObj(1, 2),
    ],
  },
  {
    type: 'order',
    prompt: 'Urutkan pecahan berikut dari yang terkecil ke terbesar:',
    fractions: [
      new FractionObj(2, 3),
      new FractionObj(1, 5),
      new FractionObj(1, 2),
    ],
  },
  {
    type: 'compare',
    prompt: 'Pilih pecahan yang lebih besar:',
    fractions: [new FractionObj(2, 5), new FractionObj(3, 8)],
  },
  {
    type: 'compare',
    prompt: 'Pilih pecahan yang lebih besar:',
    fractions: [new FractionObj(2, 3), new FractionObj(3, 5)],
  },
  {
    type: 'equivalent',
    prompt: 'Pilih pecahan yang senilai dengan ',
    base: new FractionObj(2, 5),
    choices: [
      new FractionObj(4, 10), // correct - same as 2/5
      new FractionObj(3, 6),  // incorrect - 1/2
      new FractionObj(1, 3),  // incorrect
    ],
  },
  {
    type: 'equivalent',
    prompt: 'Pilih pecahan yang senilai dengan ',
    base: new FractionObj(1, 3),
    choices: [
      new FractionObj(2, 6), // correct - same as 1/3
      new FractionObj(2, 5), // incorrect
      new FractionObj(3, 8), // incorrect
    ],
  },
  {
    type: 'order',
    prompt: 'Urutkan pecahan berikut dari yang terkecil ke terbesar:',
    fractions: [
      new FractionObj(5, 6),
      new FractionObj(1, 3),
      new FractionObj(1, 2),
    ],
  },
  {
    type: 'compare',
    prompt: 'Pilih pecahan yang lebih besar:',
    fractions: [new FractionObj(4, 7), new FractionObj(3, 5)],
  },
  {
    type: 'equivalent',
    prompt: 'Pilih pecahan yang senilai dengan ',
    base: new FractionObj(3, 4),
    choices: [
      new FractionObj(6, 8), // correct - same as 3/4
      new FractionObj(4, 6), // incorrect - 2/3
      new FractionObj(5, 7), // incorrect
    ],
  },
  {
    type: 'equivalent',
    prompt: 'Pilih pecahan yang senilai dengan ',
    base: new FractionObj(2, 5),
    choices: [
      new FractionObj(4, 10), // correct - same as 2/5
      new FractionObj(4, 7),  // incorrect
      new FractionObj(3, 10), // incorrect
    ],
  },
];

function FractionGame() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correctButtons, setCorrectButtons] = useState(new Set());
  const [wrongButtons, setWrongButtons] = useState(new Set());
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
      level: 2,
      jenis_permainan: "Game Pecahan",
      skor: score,
      skor_maksimal: questions.length * pointsPerQuestion,
      status_selesai: currentIndex >= questions.length,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: score / pointsPerQuestion,
            total_soal: questions.length
          }
        ]
      }
    };

    await saveGameProgress(gameData);
  };

  useEffect(() => {
    if (score > 0 || currentIndex >= questions.length) {
      handleSaveProgress();
    }
  }, [score, currentIndex]);

  const pointsPerQuestion = 10;

  function startGame() {
    setStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setAnswered(false);
    setFeedback('');
    setCorrectButtons(new Set());
    setWrongButtons(new Set());
    setGameOver(false);
  }

  const currentQuestion = questions[currentIndex] || null;

  // Helpers for order question
  function handleSelectOrder(frac) {
    if (answered) return;
    setSelectedAnswers(prev => {
      if (prev.some(f => f.num === frac.num && f.den === frac.den)) return prev;
      const newSelection = [...prev, frac];
      if (newSelection.length === currentQuestion.fractions.length) {
        // Check answer
        let sortedCorrect = [...currentQuestion.fractions].sort(
          (a, b) => a.value() - b.value()
        );
        
        // Create sets to track correct/incorrect answers
        const newCorrect = new Set();
        const newWrong = new Set();
        
        let allCorrect = true;
        for (let i = 0; i < newSelection.length; i++) {
          if (newSelection[i].equals(sortedCorrect[i])) {
            newCorrect.add(`${newSelection[i].num}-${newSelection[i].den}`);
          } else {
            newWrong.add(`${newSelection[i].num}-${newSelection[i].den}`);
            allCorrect = false;
          }
        }
        
        if (allCorrect) {
          setScore(prevScore => prevScore + pointsPerQuestion);
          setFeedback('Yay! Jawaban benar 🎉');
        } else {
          setFeedback('Coba lagi ya! Jawaban kurang tepat.');
        }
        
        setCorrectButtons(newCorrect);
        setWrongButtons(newWrong);
        setAnswered(true);
      }
      return newSelection;
    });
  }

  // Helpers for compare question
  function handleCompareAnswer(selectedFrac) {
    if (answered) return;
    let bigger =
      currentQuestion.fractions[0].value() >
      currentQuestion.fractions[1].value()
        ? currentQuestion.fractions[0]
        : currentQuestion.fractions[1];
    
    const selectedKey = `${selectedFrac.num}-${selectedFrac.den}`;
    const correctKey = `${bigger.num}-${bigger.den}`;
    
    if (selectedFrac.equals(bigger)) {
      setScore(prevScore => prevScore + pointsPerQuestion);
      setFeedback('Betul! Pecahan ini lebih besar 👍');
      setCorrectButtons(new Set([selectedKey]));
    } else {
      setFeedback('Ups, yang benar pecahan yang satunya ya.');
      setWrongButtons(new Set([selectedKey]));
      setCorrectButtons(new Set([correctKey]));
    }
    setAnswered(true);
  }

  // Helpers for equivalent question
  function handleEquivalentAnswer(selectedFrac) {
    if (answered) return;
    const selectedKey = `${selectedFrac.num}-${selectedFrac.den}`;
    
    // First, simplify both fractions to their lowest terms
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    
    // Simplify the base fraction
    const baseGcd = gcd(currentQuestion.base.num, currentQuestion.base.den);
    const baseSimplified = {
      num: currentQuestion.base.num / baseGcd,
      den: currentQuestion.base.den / baseGcd
    };
    
    // Simplify the selected fraction
    const selectedGcd = gcd(selectedFrac.num, selectedFrac.den);
    const selectedSimplified = {
      num: selectedFrac.num / selectedGcd,
      den: selectedFrac.den / selectedGcd
    };
    
    // Check if the simplified fractions are equal
    const isCorrect = 
      baseSimplified.num === selectedSimplified.num && 
      baseSimplified.den === selectedSimplified.den;
    
    // Set the feedback and buttons based on whether the answer is correct
    if (isCorrect) {
      setScore(prevScore => prevScore + pointsPerQuestion);
      setFeedback('Hebat! Itu pecahan senilai 😊');
      setCorrectButtons(new Set([selectedKey]));
    } else {
      setFeedback('Bukan itu, ini bukan pecahan senilai.');
      setWrongButtons(new Set([selectedKey]));
      
      // Find and highlight the correct answers
      const correctChoices = currentQuestion.choices.filter(choice => {
        const choiceGcd = gcd(choice.num, choice.den);
        const choiceSimplified = {
          num: choice.num / choiceGcd,
          den: choice.den / choiceGcd
        };
        
        return baseSimplified.num === choiceSimplified.num && 
               baseSimplified.den === choiceSimplified.den;
      });
      
      const correctSet = new Set();
      correctChoices.forEach(choice => {
        correctSet.add(`${choice.num}-${choice.den}`);
      });
      
      setCorrectButtons(correctSet);
    }
    
    setAnswered(true);
  }

  function handleNext() {
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswers([]);
    setAnswered(false);
    setFeedback('');
    setCorrectButtons(new Set());
    setWrongButtons(new Set());
  }

  function handleBackToCategory() {
    navigate('/category4_bab2');
  }

  if (!started) {
    return (
      <main style={styles.body}>
        <div style={styles.gameContainer} aria-label="Game pecahan seru untuk anak kelas 4 SD">
          <h1 style={styles.heading}>Game Pecahan Seru!</h1>
          <div style={styles.instructions} aria-live="polite">
            Yuk belajar pecahan dengan cara yang seru dan interaktif!<br />
            Kamu akan menjawab 10 soal tentang mengurutkan, membandingkan, dan pecahan senilai.
          </div>
          <button
            style={styles.startBtn}
            onClick={startGame}
            aria-label="Mulai permainan"
            type="button"
          >
            Mulai Game
          </button>
        </div>
      </main>
    );
  }

  // Show final results if done
  if (currentIndex >= questions.length) {
    let message = '';
    const maxScore = questions.length * pointsPerQuestion;
    const percentage = (score / maxScore) * 100;
    
    if (!gameOver) {
      setGameOver(true);
    }
    
    if (percentage === 100) {
      message = 'Hebat sekali! Kamu sangat pintar dalam pecahan!';
    } else if (percentage >= 70) {
      message = 'Bagus! Terus berlatih dan kamu pasti semakin hebat!';
    } else {
      message = 'Jangan menyerah! Pelajari lagi dan coba lagi ya!';
    }
    return (
      <main style={styles.body}>
        <div style={styles.gameContainer} aria-label="Game pecahan seru untuk anak kelas 4 SD">
          <h1 style={styles.heading}>Game Pecahan Seru!</h1>
          <p style={{ fontWeight: 'bold', fontSize: 24 }}>
            🎉 Kamu sudah selesai! 🎉
          </p>
          <p style={{ fontSize: 20, marginTop: 15 }}>
            Skor kamu: <strong>{score}</strong> dari <strong>{maxScore}</strong>
          </p>
          <p style={{ marginTop: 20, fontSize: 18, color: '#f79a00' }}>{message}</p>
          <button
            style={styles.startBtn}
            onClick={startGame}
            aria-label="Mainkan lagi"
            type="button"
          >
            Mainkan Lagi
          </button>
          <button
            style={styles.categoryBtn}
            onClick={handleBackToCategory}
            aria-label="Kembali ke kategori"
            type="button"
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a50c2')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#4E6BFF')}
          >
            Kembali ke Kategori
          </button>
        </div>
      </main>
    );
  }

  const progressPercent = (currentIndex / questions.length) * 100;

  return (
    <main style={styles.body}>
      <div style={styles.gameContainer} aria-label="Game pecahan seru untuk anak kelas 4 SD">
        <h1 style={styles.heading}>Game Pecahan Seru!</h1>

        <div
          aria-hidden="true"
          style={styles.progressBarContainer}
        >
          <div
            style={{ ...styles.progressBar, width: `${progressPercent}%` }}
          />
        </div>
        <div style={styles.questionNumber}>
          Soal {currentIndex + 1} dari {questions.length}
        </div>
        <div style={styles.score}>
          Skor: {score} dari {questions.length * pointsPerQuestion}
        </div>
        <div style={styles.questionText}>
          {currentQuestion.prompt}
          {currentQuestion.type === 'equivalent' && (
            <FractionDisplay
              num={currentQuestion.base.num}
              den={currentQuestion.base.den}
            />
          )}
        </div>

        <div style={styles.answers} role="listbox" aria-label="Pilihan jawaban">
          {currentQuestion.type === 'order' &&
            shuffle(currentQuestion.fractions).map(frac => {
              const isSelected = selectedAnswers.some(
                f => f.num === frac.num && f.den === frac.den
              );
              const fracKey = `${frac.num}-${frac.den}`;
              const isCorrect = correctButtons.has(fracKey);
              const isWrong = wrongButtons.has(fracKey);
              
              return (
                <button
                  key={fracKey}
                  style={{
                    ...styles.answerBtn,
                    backgroundColor: !answered ? '#f8b500' : (isCorrect ? '#4caf50' : (isWrong ? '#e53935' : '#f8b500')),
                    boxShadow: !answered ? '0 6px #c28c00' : (isCorrect ? '0 6px #357a38' : (isWrong ? '0 6px #a32b2b' : '0 6px #c28c00')),
                    opacity: (isSelected && !answered) ? 0.5 : (answered && !isCorrect && !isWrong) ? 0.5 : 1
                  }}
                  type="button"
                  disabled={answered || isSelected}
                  aria-label={`Pecahan ${frac.num} per ${frac.den}`}
                  onClick={() => handleSelectOrder(frac)}
                >
                  <FractionDisplay num={frac.num} den={frac.den} />
                </button>
              );
            })}
          {currentQuestion.type === 'compare' &&
            currentQuestion.fractions.map(frac => {
              const fracKey = `${frac.num}-${frac.den}`;
              const isCorrect = correctButtons.has(fracKey);
              const isWrong = wrongButtons.has(fracKey);
              
              return (
                <button
                  key={fracKey}
                  style={{
                    ...styles.answerBtn,
                    backgroundColor: !answered ? '#f8b500' : (isCorrect ? '#4caf50' : (isWrong ? '#e53935' : '#f8b500')),
                    boxShadow: !answered ? '0 6px #c28c00' : (isCorrect ? '0 6px #357a38' : (isWrong ? '0 6px #a32b2b' : '0 6px #c28c00')),
                    opacity: answered && !isCorrect && !isWrong ? 0.5 : 1
                  }}
                  type="button"
                  disabled={answered}
                  aria-label={`Pecahan ${frac.num} per ${frac.den}`}
                  onClick={() => handleCompareAnswer(frac)}
                >
                  <FractionDisplay num={frac.num} den={frac.den} />
                </button>
              );
            })}
          {currentQuestion.type === 'equivalent' &&
            shuffle(currentQuestion.choices).map(frac => {
              const fracKey = `${frac.num}-${frac.den}`;
              const isCorrect = correctButtons.has(fracKey);
              const isWrong = wrongButtons.has(fracKey);
              
              return (
                <button
                  key={fracKey}
                  style={{
                    ...styles.answerBtn,
                    backgroundColor: !answered ? '#f8b500' : (isCorrect ? '#4caf50' : (isWrong ? '#e53935' : '#f8b500')),
                    boxShadow: !answered ? '0 6px #c28c00' : (isCorrect ? '0 6px #357a38' : (isWrong ? '0 6px #a32b2b' : '0 6px #c28c00')),
                    opacity: answered && !isCorrect && !isWrong ? 0.5 : 1
                  }}
                  type="button"
                  disabled={answered}
                  aria-label={`Pecahan ${frac.num} per ${frac.den}`}
                  onClick={() => handleEquivalentAnswer(frac)}
                >
                  <FractionDisplay num={frac.num} den={frac.den} />
                </button>
              );
            })}
        </div>

        <div style={styles.feedback} aria-live="assertive">
          {feedback}
        </div>

        {answered && currentIndex < questions.length - 1 && (
          <button
            type="button"
            style={styles.nextBtn}
            aria-label="Tombol soal berikutnya"
            onClick={handleNext}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#dd7f00')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f79a00')}
          >
            Soal Berikutnya
          </button>
        )}
        {answered && currentIndex === questions.length - 1 && (
          <button
            type="button"
            style={styles.nextBtn}
            aria-label="Tombol lihat hasil akhir"
            onClick={handleNext}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#dd7f00')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f79a00')}
          >
            Lihat Hasil Akhir
          </button>
        )}
      </div>
    </main>
  );
}

export default FractionGame;
