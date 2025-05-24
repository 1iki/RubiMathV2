import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../games4.css";

export default function KomposisiDanPengurangan() {
  const navigate = useNavigate();

  // Game variables
  const [score, setScore] = useState(0);
  const [currentGame, setCurrentGame] = useState("composition"); // Start with composition game
  const [gameProgress, setGameProgress] = useState(0); // Track overall progress
  const [totalQuestions, setTotalQuestions] = useState(10); // Default 10 questions total

  // Current question indexes
  const [currentComposition, setCurrentComposition] = useState(0);
  const [currentSubtraction, setCurrentSubtraction] = useState(0);

  // Track if current question is answered
  const [compositionAnswered, setCompositionAnswered] = useState(false);
  const [subtractionAnswered, setSubtractionAnswered] = useState(false);

  // Input state for answer
  const [inputAnswer, setInputAnswer] = useState("");

  // Character jump animation
  const [characterJumping, setCharacterJumping] = useState(false);

  // Confetti effect
  const [showConfetti, setShowConfetti] = useState(false);

  // Track completion of each section
  const [compositionCompleted, setCompositionCompleted] = useState(false);
  const [subtractionCompleted, setSubtractionCompleted] = useState(false);

  // Game completed state
  const [gameCompleted, setGameCompleted] = useState(false);

  // Result states
  const [compositionResult, setCompositionResult] = useState({
    message: "",
    isCorrect: null,
  });
  const [subtractionResult, setSubtractionResult] = useState({
    message: "",
    isCorrect: null,
  });

  // Game data
  const [compositionQuestions, setCompositionQuestions] = useState([]);
  const [subtractionQuestions, setSubtractionQuestions] = useState([]);

  // Generate questions on component mount
  useEffect(() => {
    generateQuestions();
  }, []);

  // Generate composition and subtraction questions
  const generateQuestions = () => {
    // Generate composition questions (breaking down numbers up to 10,000)
    const generatedCompositionQuestions = [];
    for (let i = 0; i < 5; i++) {
      // Generate a random number between 1,000 and 10,000
      const number = Math.floor(Math.random() * 9000) + 1000;

      // Break down the number into place values
      const thousands = Math.floor(number / 1000);
      const hundreds = Math.floor((number % 1000) / 100);
      const tens = Math.floor((number % 100) / 10);
      const ones = number % 10;

      // Create question and answer
      const question = `${number}`;
      const answer = `${thousands} ribu ${hundreds} ratus ${tens} puluh ${ones}`;
      const formattedAnswer = formatCompositionAnswer(thousands, hundreds, tens, ones);

      const options = generateCompositionOptions(thousands, hundreds, tens, ones);

      generatedCompositionQuestions.push({
        number,
        question,
        correctAnswer: formattedAnswer,
        options
      });
    }

    // Generate subtraction questions (subtracting numbers up to 1,000)
    const generatedSubtractionQuestions = [];
    for (let i = 0; i < 5; i++) {
      // Generate two random numbers for subtraction where the first is larger
      const num1 = Math.floor(Math.random() * 900) + 100; // Between 100 and 1000
      const num2 = Math.floor(Math.random() * num1); // Less than num1

      const answer = num1 - num2;

      // Generate wrong options
      const wrongAnswers = [];
      while (wrongAnswers.length < 3) {
        // Generate a plausible wrong answer (± 10 of the correct answer, but not the correct answer)
        const wrongAnswer = answer + (Math.floor(Math.random() * 20) - 10);
        if (wrongAnswer !== answer && wrongAnswer >= 0 && !wrongAnswers.includes(wrongAnswer)) {
          wrongAnswers.push(wrongAnswer);
        }
      }

      // Shuffle all options together
      const options = [answer, ...wrongAnswers];
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }

      generatedSubtractionQuestions.push({
        num1,
        num2,
        correctAnswer: answer,
        options
      });
    }

    setCompositionQuestions(generatedCompositionQuestions);
    setSubtractionQuestions(generatedSubtractionQuestions);
  };

  // Format composition answer to remove zeros
  const formatCompositionAnswer = (thousands, hundreds, tens, ones) => {
    let result = "";

    if (thousands > 0) {
      result += `${thousands} ribu `;
    }

    if (hundreds > 0) {
      result += `${hundreds} ratus `;
    }

    if (tens > 0) {
      result += `${tens} puluh `;
    }

    if (ones > 0 || (thousands === 0 && hundreds === 0 && tens === 0)) {
      result += `${ones}`;
    }

    return result.trim();
  };

  // Generate wrong options for composition questions
  const generateCompositionOptions = (thousands, hundreds, tens, ones) => {
    const correctAnswer = formatCompositionAnswer(thousands, hundreds, tens, ones);

    // Create wrong options by changing one or two place values
    const wrongOptions = [];

    // Option 1: Swap tens and ones
    wrongOptions.push(formatCompositionAnswer(thousands, hundreds, ones, tens));

    // Option 2: Swap thousands and hundreds
    wrongOptions.push(formatCompositionAnswer(hundreds, thousands, tens, ones));

    // Option 3: Add 1 to two of the place values
    wrongOptions.push(formatCompositionAnswer(thousands + 1, hundreds, tens, ones - 1));

    // Remove any duplicates and ensure options are unique
    const uniqueOptions = [...new Set([correctAnswer, ...wrongOptions])];

    // If we lost options due to duplicates, add more
    while (uniqueOptions.length < 4) {
      const rndThousands = Math.max(0, thousands + Math.floor(Math.random() * 3) - 1);
      const rndHundreds = Math.max(0, hundreds + Math.floor(Math.random() * 3) - 1);
      const rndTens = Math.max(0, tens + Math.floor(Math.random() * 3) - 1);
      const rndOnes = Math.max(0, ones + Math.floor(Math.random() * 3) - 1);

      const newOption = formatCompositionAnswer(rndThousands, rndHundreds, rndTens, rndOnes);

      if (!uniqueOptions.includes(newOption)) {
        uniqueOptions.push(newOption);
      }
    }

    // Shuffle the options
    const shuffledOptions = [...uniqueOptions];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return shuffledOptions.slice(0, 4);
  };

  // Progress to next game type
  const progressToNextGame = () => {
    // Reset all result messages
    setCompositionResult({ message: "", isCorrect: null });
    setSubtractionResult({ message: "", isCorrect: null });

    // Update game progress
    setGameProgress(gameProgress + 1);

    // Determine next game
    if (currentGame === "composition") {
      setCurrentGame("subtraction");
      setCompositionCompleted(true);
    } else if (currentGame === "subtraction") {
      setSubtractionCompleted(true);
      setGameCompleted(true);
    }
  };

  // Start specific game (only for restart)
  const startGame = (gameType) => {
    setCurrentGame(gameType);
  };

  // Back to main menu
  const backToMenu = () => {
    // Reset to first game
    setCurrentGame("composition");
    setGameProgress(0);
    setCompositionCompleted(false);
    setSubtractionCompleted(false);
    setGameCompleted(false);

    // Reset current questions
    setCurrentComposition(0);
    setCurrentSubtraction(0);

    // Reset score
    setScore(0);

    // Regenerate questions
    generateQuestions();
  };

  // Check composition answer
  const checkCompositionAnswer = (selectedAnswer) => {
    // Only allow answering once
    if (compositionAnswered) return;

    const question = compositionQuestions[currentComposition];

    if (selectedAnswer === question.correctAnswer) {
      setCompositionResult({
        message: "Benar! 🎉",
        isCorrect: true,
      });
      setScore((prevScore) => prevScore + 10); // 10 points per question
      characterJump();
      createConfetti();
    } else {
      setCompositionResult({
        message: `Salah! Jawaban yang benar: ${question.correctAnswer}`,
        isCorrect: false,
      });
    }

    // Mark as answered regardless of correctness
    setCompositionAnswered(true);
  };

  // Next composition question
  const nextCompositionQuestion = () => {
    // Only proceed if question has been answered
    if (!compositionAnswered) {
      setCompositionResult({
        message: "Anda harus menjawab pertanyaan terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    // Check if we've gone through all composition questions
    if (currentComposition < compositionQuestions.length - 1) {
      setCurrentComposition(currentComposition + 1);
      setCompositionResult({ message: "", isCorrect: null });
      setCompositionAnswered(false); // Reset answered state for next question
    } else {
      // Move to the next game type
      progressToNextGame();
    }
  };

  // Check subtraction answer
  const checkSubtractionAnswer = (selectedAnswer) => {
    // Only allow answering once
    if (subtractionAnswered) return;

    const question = subtractionQuestions[currentSubtraction];

    if (selectedAnswer === question.correctAnswer) {
      setSubtractionResult({
        message: "Benar! 🎉",
        isCorrect: true,
      });
      setScore((prevScore) => prevScore + 10); // 10 points per question
      characterJump();
      createConfetti();
    } else {
      setSubtractionResult({
        message: `Salah! Jawaban yang benar: ${question.correctAnswer}`,
        isCorrect: false,
      });
    }

    // Mark as answered regardless of correctness
    setSubtractionAnswered(true);
  };

  // Next subtraction question
  const nextSubtractionQuestion = () => {
    // Only proceed if question has been answered
    if (!subtractionAnswered) {
      setSubtractionResult({
        message: "Anda harus menjawab pertanyaan terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    // Check if we've gone through all subtraction questions
    if (currentSubtraction < subtractionQuestions.length - 1) {
      setCurrentSubtraction(currentSubtraction + 1);
      setSubtractionResult({ message: "", isCorrect: null });
      setSubtractionAnswered(false); // Reset answered state for next question
    } else {
      // Complete the game
      progressToNextGame();
    }
  };

  // Character jump animation
  const characterJump = () => {
    setCharacterJumping(true);
    setTimeout(() => {
      setCharacterJumping(false);
    }, 500);
  };

  // Create confetti effect
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 1500);
  };

  // Handle back to category
  const handleBackToCategory = () => {
    navigate("/category4_bab1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-pink-500">
            {currentGame === "composition" ? "Komposisi Bilangan Cacah" : "Pengurangan Bilangan Cacah"}
          </h1>
        </div>
        <p className="text-gray-700 text-lg mb-6">
          {currentGame === "composition"
            ? "Ayo mengenal komposisi bilangan cacah sampai 10.000!"
            : "Ayo berlatih pengurangan bilangan cacah sampai 1.000!"}
        </p>

        {/* Game progress indicator */}
        <div className="flex justify-between items-center mb-6 bg-gray-100 rounded-full p-2">
          <div
            className={`px-4 py-2 rounded-full text-center transition-all ${currentGame === "composition" || compositionCompleted ? "bg-pink-400 text-white" : "bg-gray-200"
              }`}
            style={{ flex: 1 }}
          >
            <i className="fas fa-puzzle-piece mr-2"></i> Komposisi
          </div>
          <div
            className={`px-4 py-2 rounded-full text-center transition-all ${currentGame === "subtraction" || subtractionCompleted ? "bg-pink-400 text-white" : "bg-gray-200"
              }`}
            style={{ flex: 1 }}
          >
            <i className="fas fa-minus mr-2"></i> Pengurangan
          </div>
        </div>

        {gameCompleted && (
          <div className="game-section animate-fadeIn text-center">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-trophy text-yellow-300"></i> Selamat!
            </h2>
            <p className="text-xl mb-4">
              Kamu telah menyelesaikan semua permainan!
            </p>
            <div className="mb-6 py-4 px-6 bg-green-100 rounded-lg shadow inline-block">
              <p className="text-2xl font-bold text-green-700">
                Skor Akhir: {score}
              </p>
            </div>
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:translate-y-1 transform transition-all font-bold"
              onClick={backToMenu}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-redo"></i> Main Lagi
              </span>
            </button>
            <div className="mt-6">
              <button
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-full shadow hover:shadow-md transition-all"
                onClick={handleBackToCategory}
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-home"></i> Kembali ke Kategori
                </span>
              </button>
            </div>
          </div>
        )}

        {!gameCompleted && currentGame === "composition" && compositionQuestions.length > 0 && (
          <div className="game-section animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-puzzle-piece"></i> Komposisi Bilangan Cacah
            </h2>
            <div className="text-3xl font-bold my-5 p-5 bg-gray-50 rounded-xl inline-block shadow">
              {compositionQuestions[currentComposition].question}
            </div>
            <p className="mb-4">Bagaimana komposisi bilangan di atas?</p>
            <div className="flex flex-col gap-2 mb-4">
              {compositionQuestions[currentComposition].options.map((option, index) => (
                <button
                  key={index}
                  className={`bg-gradient-to-r from-teal-500 to-teal-400 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg transition-all my-1 ${compositionAnswered && option === compositionQuestions[currentComposition].correctAnswer
                      ? "border-2 border-green-700"
                      : ""
                    }`}
                  onClick={() => checkCompositionAnswer(option)}
                  disabled={compositionAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
            {compositionResult.message && (
              <div
                className={`p-4 rounded-lg shadow my-4 ${compositionResult.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {compositionResult.message}
              </div>
            )}
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold"
              onClick={nextCompositionQuestion}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-arrow-right"></i> {currentComposition < compositionQuestions.length - 1 ? "Soal Selanjutnya" : "Lanjut ke Pengurangan"}
              </span>
            </button>
          </div>
        )}

        {!gameCompleted && currentGame === "subtraction" && subtractionQuestions.length > 0 && (
          <div className="game-section animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-minus"></i> Pengurangan Bilangan Cacah
            </h2>
            <div className="text-2xl my-5 p-5 bg-gray-50 rounded-xl inline-block shadow">
              {subtractionQuestions[currentSubtraction].num1} - {subtractionQuestions[currentSubtraction].num2} = ?
            </div>
            <p className="mb-4">Berapakah hasil pengurangan di atas?</p>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {subtractionQuestions[currentSubtraction].options.map((option, index) => (
                <button
                  key={index}
                  className={`bg-gradient-to-r from-teal-500 to-teal-400 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg transition-all ${subtractionAnswered && option === subtractionQuestions[currentSubtraction].correctAnswer
                      ? "border-2 border-green-700"
                      : ""
                    }`}
                  onClick={() => checkSubtractionAnswer(option)}
                  disabled={subtractionAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
            {subtractionResult.message && (
              <div
                className={`p-4 rounded-lg shadow my-4 ${subtractionResult.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {subtractionResult.message}
              </div>
            )}
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold"
              onClick={nextSubtractionQuestion}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-arrow-right"></i> {currentSubtraction < subtractionQuestions.length - 1 ? "Soal Selanjutnya" : "Selesai"}
              </span>
            </button>
          </div>
        )}

        {/* Score display */}
        <div className="my-5 font-bold text-xl inline-block px-5 py-2 bg-yellow-300 rounded-full text-gray-800 shadow">
          ⭐ Skor: {score}
        </div>

        {/* Character */}
        <img
          src="/src/assets/kelinci.png"
          alt="Character"
          className={`absolute w-24 bottom-5 right-5 transition-all duration-500 ${characterJumping ? "transform -translate-y-12" : ""
            }`}
        />

        {/* Confetti effect */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => {
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              const size = Math.random() * 10 + 5;
              const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
              const transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200
                }px) rotate(${Math.random() * 360}deg)`;
              const duration = Math.random() * 1 + 0.5;

              return (
                <div
                  key={i}
                  className="absolute w-3 h-3 opacity-100 transition-all"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    transform: transform,
                    transition: `all ${duration}s ease-out`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease;
        }
      `}</style>
    </div>
  );
}