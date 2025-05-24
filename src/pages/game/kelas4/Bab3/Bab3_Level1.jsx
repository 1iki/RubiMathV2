import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Data soal
const questions = [
  {
    question: "Apa gambar berikutnya dalam pola ini?",
    pattern: ["⭐", "🐱", "⭐", "🐱", "⭐"],
    options: ["🐶", "🐱", "⭐", "🌈"],
    correctAnswer: "🐱",
    type: "berulang"
  },
  {
    question: "Pola ini bertumbuh. Apa gambar berikutnya?",
    pattern: ["🌱", "🌿", "🌳"],
    options: ["🌻", "🌳", "🌲", "🏵️"],
    correctAnswer: "🌲",
    type: "bertumbuh"
  },
  {
    question: "Pola ini berganti warna. Apa yang berikutnya?",
    pattern: ["🔴", "🔵", "🔴", "🔵"],
    options: ["🟢", "🔵", "🔴", "🟡"],
    correctAnswer: "🔴",
    type: "berganti"
  },
  {
    question: "Lanjutkan pola berulang ini:",
    pattern: ["🍎", "🍌", "🍎", "🍌"],
    options: ["🍎", "🍓", "🍌", "🍇"],
    correctAnswer: "🍎",
    type: "berulang"
  },
  {
    question: "Pola bertumbuh. Apa yang berikutnya?",
    pattern: ["🐛", "🥚", "🦋"],
    options: ["🐦", "🦋", "🐛", "🦄"],
    correctAnswer: "🐦",
    type: "bertumbuh"
  },
  {
    question: "Pola berganti bentuk. Lanjutkan:",
    pattern: ["▲", "●", "▲", "●"],
    options: ["■", "▲", "●", "★"],
    correctAnswer: "▲",
    type: "berganti"
  },
  {
    question: "Apa yang melengkapi pola berulang ini?",
    pattern: ["1", "A", "2", "B", "3"],
    options: ["A", "B", "C", "4"],
    correctAnswer: "C",
    type: "berulang"
  },
  {
    question: "Pola bertumbuh. Apa berikutnya?",
    pattern: ["🌕", "🌖", "🌗", "🌘"],
    options: ["🌑", "🌓", "🌔", "🌕"],
    correctAnswer: "🌑",
    type: "bertumbuh"
  },
  {
    question: "Lanjutkan pola berganti ini:",
    pattern: ["⚽", "🏀", "⚽", "🏀"],
    options: ["⚾", "🏀", "⚽", "🎾"],
    correctAnswer: "⚽",
    type: "berganti"
  },
  {
    question: "Apa yang melengkapi pola berulang ini?",
    pattern: ["😊", "😢", "😊", "😢"],
    options: ["😡", "😊", "😢", "😍"],
    correctAnswer: "😊",
    type: "berulang"
  }
];

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", isCorrect: null });
  const [showNextButton, setShowNextButton] = useState(false);
  const [optionsDisabled, setOptionsDisabled] = useState(false);
  const navigate = useNavigate();

  const handleSelectAnswer = (selectedOption) => {
    const question = questions[currentQuestion];
    setOptionsDisabled(true);

    if (selectedOption === question.correctAnswer) {
      setFeedback({ text: "Benar! 🎉", isCorrect: true });
      setScore(score + 10);
    } else {
      setFeedback({ 
        text: `Salah! Jawaban benar: ${question.correctAnswer}`, 
        isCorrect: false 
      });
    }

    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setFeedback({ text: "", isCorrect: null });
      setShowNextButton(false);
      setOptionsDisabled(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setFeedback({ text: "", isCorrect: null });
    setShowNextButton(false);
    setOptionsDisabled(false);
  };

  const getResultMessage = () => {
    if (score === 100) {
      return 'Luar biasa! Kamu ahli pola! 🏆\nSemua jawaban benar!';
    } else if (score >= 80) {
      return 'Hebat! 🌟\nHampir sempurna!';
    } else if (score >= 60) {
      return 'Bagus! 😊\nTetap semangat belajar!';
    } else {
      return 'Terus berlatih! 👍\nKamu pasti bisa lebih baik!';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50" style={{
      backgroundImage: 'radial-gradient(circle, #9BE36D 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <header className="w-full text-center py-4 bg-green-600 text-white shadow-md mb-8">
        <h1 className="text-2xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' }}>
          Petualangan Pola Gambar
        </h1>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-11/12 max-w-3xl mb-8 text-center">
        <div className="text-xl mb-4 text-green-700 font-bold">
          Poin: <span className="text-2xl">{score}</span>/100
        </div>
        
        <div className="w-full bg-gray-200 rounded-lg mb-4 overflow-hidden">
          <div 
            className="h-5 bg-green-600 transition-all duration-500" 
            style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
          />
        </div>

        {!quizCompleted ? (
          <div>
            <div className="mb-8">
              <div className="text-lg mb-4 font-semibold text-gray-800 px-4 py-2 bg-green-100 rounded-lg inline-block">
                {questions[currentQuestion].question}
              </div>
              
              <div className="flex justify-center items-center flex-wrap gap-3 mb-6 min-h-24 py-2">
                {questions[currentQuestion].pattern.map((item, index) => (
                  <div 
                    key={index} 
                    className="w-14 h-14 md:w-16 md:h-16 flex justify-center items-center text-3xl bg-white rounded-lg shadow-md transition-transform hover:scale-110 border-2 border-green-200"
                  >
                    {item}
                  </div>
                ))}
                <div className="w-14 h-14 md:w-16 md:h-16 flex justify-center items-center text-2xl bg-yellow-100 rounded-lg shadow-md border-2 border-yellow-300 animate-pulse">
                  ?
                </div>
              </div>
              
              <div className={`text-lg font-bold mb-4 h-8 ${
                feedback.isCorrect === true ? 'text-green-600' : 
                feedback.isCorrect === false ? 'text-red-600' : ''
              }`}>
                {feedback.text}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {questions[currentQuestion].options.map((option, index) => (
                <button 
                  key={index}
                  className={`w-14 h-14 md:w-16 md:h-16 flex justify-center items-center text-3xl bg-white rounded-lg shadow-md transition-all
                    ${!optionsDisabled ? 'hover:bg-green-100 hover:-translate-y-1 border-2 border-green-300' : 
                    'opacity-70 cursor-not-allowed border-2 border-gray-200'}`}
                  onClick={() => !optionsDisabled && handleSelectAnswer(option)}
                  disabled={optionsDisabled}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {showNextButton && (
              <button 
                className="px-6 py-3 bg-yellow-500 text-gray-800 rounded-full shadow-md text-lg font-bold 
                  transition-all hover:bg-yellow-600 hover:-translate-y-1"
                onClick={handleNextQuestion}
              >
                Lanjut
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl text-green-600 mb-4">Selesai!</div>
            <div className="text-5xl font-bold text-yellow-500 mb-6">{score}</div>
            <div className="mb-6 whitespace-pre-line text-gray-700">{getResultMessage()}</div>
            <button 
              className="px-6 py-3 bg-yellow-500 text-gray-800 rounded-full shadow-md text-lg font-bold 
                transition-all hover:bg-yellow-600 hover:-translate-y-1 mb-4"
              onClick={handleRestartGame}
            >
              Main Lagi
            </button>
            <div>
              <button 
                className="px-6 py-3 bg-blue-500 text-grey rounded-full shadow-md text-lg font-bold 
                  transition-all hover:bg-blue-600 hover:-translate-y-1"
                onClick={() => navigate('/category4_bab3')}
              >
                Kembali ke kategori
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}