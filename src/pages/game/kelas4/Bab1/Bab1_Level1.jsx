import { useState, useEffect } from "react";
import { Home } from "lucide-react";
import "../games4.css"; // Import the CSS file

export default function PetualanganBilanganCacah() {
  // Game variables
  const [score, setScore] = useState(0);
  const [currentGame, setCurrentGame] = useState("read"); // Start with reading game
  const [gameProgress, setGameProgress] = useState(0); // Track overall progress

  // Current question indexes
  const [currentRead, setCurrentRead] = useState(0);
  const [currentWrite, setCurrentWrite] = useState(0);
  const [currentCompare, setCurrentCompare] = useState(0);
  const [currentOrder, setCurrentOrder] = useState(0);

  // Track if current question is answered
  const [readAnswered, setReadAnswered] = useState(false);
  const [writeAnswered, setWriteAnswered] = useState(false);
  const [compareAnswered, setCompareAnswered] = useState(false);
  const [orderAnswered, setOrderAnswered] = useState(false);

  // Drag and drop state
  const [draggedItems, setDraggedItems] = useState([]);
  const [dropZoneItems, setDropZoneItems] = useState([]);

  // Game data
  const numbers = {
    read: [
      {
        number: "6.786",
        options: [
          "Enam ribu tujuh ratus delapan puluh enam",
          "Enam ribu tujuh ratus delapan enam",
          "Enam ribu tujuh delapan puluh enam",
        ],
        answer: 0,
      },
      {
        number: "9.302",
        options: [
          "Sembilan ribu tiga ratus dua",
          "Sembilan ribu tiga puluh dua",
          "Sembilan ratus tiga puluh dua",
        ],
        answer: 0,
      },
    ],
    write: [
      { words: "Delapan ribu empat ratus lima puluh", answer: "8450" },
      { words: "Dua ribu tiga ratus tujuh belas", answer: "2317" },
    ],
    compare: [
      { num1: "1.234", num2: "1.235", answer: "right" },
      { num1: "5.678", num2: "5.678", answer: "equal" },
      { num1: "9.999", num2: "1.000", answer: "left" },
    ],
    order: [
      {
        numbers: ["2.345", "1.999", "2.450", "2.100"],
        answer: ["1.999", "2.100", "2.345", "2.450"],
      },
      {
        numbers: ["5.555", "5.055", "5.505", "5.550"],
        answer: ["5.055", "5.505", "5.550", "5.555"],
      },
      {
        numbers: ["3.001", "3.010", "3.100", "3.000"],
        answer: ["3.000", "3.001", "3.010", "3.100"],
      },
    ],
  };

  // Result states
  const [readResult, setReadResult] = useState({
    message: "",
    isCorrect: null,
  });
  const [writeResult, setWriteResult] = useState({
    message: "",
    isCorrect: null,
  });
  const [compareResult, setCompareResult] = useState({
    message: "",
    isCorrect: null,
  });
  const [orderResult, setOrderResult] = useState({
    message: "",
    isCorrect: null,
  });

  // Input state for write game
  const [inputNumber, setInputNumber] = useState("");

  // Character jump animation
  const [characterJumping, setCharacterJumping] = useState(false);

  // Confetti effect
  const [showConfetti, setShowConfetti] = useState(false);

  // Track completion of each section
  const [readCompleted, setReadCompleted] = useState(false);
  const [writeCompleted, setWriteCompleted] = useState(false);
  const [compareCompleted, setCompareCompleted] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Game completed state
  const [gameCompleted, setGameCompleted] = useState(false);

  // Progress to next game type
  const progressToNextGame = () => {
    // Reset all result messages
    setReadResult({ message: "", isCorrect: null });
    setWriteResult({ message: "", isCorrect: null });
    setCompareResult({ message: "", isCorrect: null });
    setOrderResult({ message: "", isCorrect: null });

    // Update game progress
    setGameProgress(gameProgress + 1);

    // Determine next game
    if (currentGame === "read") {
      setCurrentGame("write");
      setReadCompleted(true);
    } else if (currentGame === "write") {
      setCurrentGame("compare");
      setWriteCompleted(true);
    } else if (currentGame === "compare") {
      setCurrentGame("order");
      setCompareCompleted(true);
    } else if (currentGame === "order") {
      setOrderCompleted(true);
      setGameCompleted(true);
    }
  };

  // Start specific game (only for restart)
  const startGame = (gameType) => {
    setCurrentGame(gameType);
  };

  // Back to main menu
  const backToMenu = () => {
    // For now, reset to first game
    setCurrentGame("read");
    setGameProgress(0);
    setReadCompleted(false);
    setWriteCompleted(false);
    setCompareCompleted(false);
    setOrderCompleted(false);
    setGameCompleted(false);

    // Reset current questions
    setCurrentRead(0);
    setCurrentWrite(0);
    setCurrentCompare(0);
    setCurrentOrder(0);

    // Reset score
    setScore(0);
  };

  // Check read answer
  const checkReadAnswer = (selectedIndex) => {
    // Only allow answering once
    if (readAnswered) return;

    const question = numbers.read[currentRead];

    if (selectedIndex === question.answer) {
      setReadResult({
        message: "Benar! 🎉",
        isCorrect: true,
      });
      setScore((prevScore) => prevScore + 10); // 10 points per question
      characterJump();
      createConfetti();
    } else {
      setReadResult({
        message: `Salah! Jawaban yang benar: ${question.options[question.answer]
          }`,
        isCorrect: false,
      });
    }

    // Mark as answered regardless of correctness
    setReadAnswered(true);
  };

  // Next read question
  const nextReadQuestion = () => {
    // Only proceed if question has been answered
    if (!readAnswered) {
      setReadResult({
        message: "Anda harus menjawab pertanyaan terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    // Check if we've gone through all reading questions
    if (currentRead < numbers.read.length - 1) {
      setCurrentRead(currentRead + 1);
      setReadResult({ message: "", isCorrect: null });
      setReadAnswered(false); // Reset answered state for next question
    } else {
      // Move to the next game type
      progressToNextGame();
    }
  };

  // Check write answer
  const checkWriteAnswer = () => {
    // Only allow answering once
    if (writeAnswered) return;

    // Validate input is not empty
    if (!inputNumber.trim()) {
      setWriteResult({
        message: "Harap masukkan jawaban terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    const question = numbers.write[currentWrite];

    if (inputNumber === question.answer) {
      setWriteResult({
        message: "Benar! 🎉",
        isCorrect: true,
      });
      setScore((prevScore) => prevScore + 10); // 10 points per question
      characterJump();
      createConfetti();
    } else {
      setWriteResult({
        message: `Salah! Jawaban yang benar: ${question.answer}`,
        isCorrect: false,
      });
    }

    // Mark as answered regardless of correctness
    setWriteAnswered(true);
  };

  // Next write question
  const nextWriteQuestion = () => {
    // Only proceed if question has been answered
    if (!writeAnswered) {
      setWriteResult({
        message: "Anda harus menjawab pertanyaan terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    // Check if we've gone through all writing questions
    if (currentWrite < numbers.write.length - 1) {
      setCurrentWrite(currentWrite + 1);
      setInputNumber("");
      setWriteResult({ message: "", isCorrect: null });
      setWriteAnswered(false); // Reset answered state for next question
    } else {
      // Move to the next game type
      progressToNextGame();
    }
  };

  // Check compare answer
  const checkCompareAnswer = (choice) => {
    // Only allow answering once
    if (compareAnswered) return;

    const question = numbers.compare[currentCompare];

    if (choice === question.answer) {
      setCompareResult({
        message: "Benar! 🎉",
        isCorrect: true,
      });
      setScore((prevScore) => prevScore + 10); // 10 points per question
      characterJump();
      createConfetti();
    } else {
      let correctAnswer = "";
      if (question.answer === "left") {
        correctAnswer = `${question.num1} lebih besar dari ${question.num2}`;
      } else if (question.answer === "right") {
        correctAnswer = `${question.num2} lebih besar dari ${question.num1}`;
      } else {
        correctAnswer = "Kedua bilangan sama besar";
      }

      setCompareResult({
        message: `Salah! ${correctAnswer}`,
        isCorrect: false,
      });
    }

    // Mark as answered regardless of correctness
    setCompareAnswered(true);
  };

  // Next compare question
  const nextCompareQuestion = () => {
    // Only proceed if question has been answered
    if (!compareAnswered) {
      setCompareResult({
        message: "Anda harus menjawab pertanyaan terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    // Check if we've gone through all compare questions
    if (currentCompare < numbers.compare.length - 1) {
      setCurrentCompare(currentCompare + 1);
      setCompareResult({ message: "", isCorrect: null });
      setCompareAnswered(false); // Reset answered state for next question
    } else {
      // Move to the next game type
      progressToNextGame();
    }
  };

  // Load order question
  useEffect(() => {
    if (currentGame === "order") {
      const question = numbers.order[currentOrder];
      // Shuffle the numbers for display
      const shuffled = [...question.numbers].sort(() => Math.random() - 0.5);
      setDraggedItems(shuffled);
      setDropZoneItems([]);
    }
  }, [currentGame, currentOrder]);

  // Handle drag item to drop zone
  const handleDrop = (item) => {
    setDraggedItems(draggedItems.filter((num) => num !== item));
    setDropZoneItems([...dropZoneItems, item]);
  };

  // Handle drag item back to drag items
  const handleDragBack = (item) => {
    setDropZoneItems(dropZoneItems.filter((num) => num !== item));
    setDraggedItems([...draggedItems, item]);
  };

  // Check order answer
  const checkOrderAnswer = () => {
    // Only allow answering once
    if (orderAnswered) return;

    const question = numbers.order[currentOrder];

    // Check if all numbers are in the drop zone
    if (dropZoneItems.length !== question.numbers.length) {
      setOrderResult({
        message: "Masukkan semua bilangan ke kotak!",
        isCorrect: false,
      });
      return;
    }

    // Check if the order is correct
    let isCorrect = true;
    for (let i = 0; i < dropZoneItems.length; i++) {
      if (dropZoneItems[i] !== question.answer[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setOrderResult({
        message: "Benar! 🎉",
        isCorrect: true,
      });
      setScore((prevScore) => prevScore + 10); // 10 points per question
      characterJump();
      createConfetti();
    } else {
      setOrderResult({
        message: `Salah! Urutan yang benar: ${question.answer.join(" → ")}`,
        isCorrect: false,
      });
    }

    // Mark as answered regardless of correctness
    setOrderAnswered(true);
  };

  // Next order question
  const nextOrderQuestion = () => {
    // Only proceed if question has been answered
    if (!orderAnswered) {
      setOrderResult({
        message: "Anda harus menjawab pertanyaan terlebih dahulu!",
        isCorrect: false,
      });
      return;
    }

    // Check if we've gone through all order questions
    if (currentOrder < numbers.order.length - 1) {
      setCurrentOrder(currentOrder + 1);
      setOrderResult({ message: "", isCorrect: null });
      setOrderAnswered(false); // Reset answered state for next question
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

  // Reset input for write game
  useEffect(() => {
    if (currentGame === "write") {
      setInputNumber("");
    }
  }, [currentGame, currentWrite]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-pink-500">
            Petualangan Bilangan Cacah
          </h1>
          <div className="text-3xl">🔢</div>
        </div>
        <p className="text-gray-700 text-lg mb-6">
          Ayo belajar bilangan dengan cara menyenangkan!
        </p>

        {/* Game progress indicator */}
        <div className="flex justify-between items-center mb-6 bg-gray-100 rounded-full p-2">
          <div
            className={`px-4 py-2 rounded-full text-center transition-all ${currentGame === "read" || readCompleted ? "bg-pink-400 text-white" : "bg-gray-200"
              }`}
          // style={{ flex: }}
          >
            <i className="fas fa-book-open mr-2"></i> Membaca
          </div>
          <div
            className={`px-4 py-2 rounded-full text-center transition-all ${currentGame === "write" || writeCompleted ? "bg-pink-400 text-white" : "bg-gray-200"
              }`}
          // style={{ }}
          >
            <i className="fas fa-pencil-alt mr-2"></i> Menulis
          </div>
          <div
            className={`px-4 py-2 rounded-full text-center transition-all ${currentGame === "compare" || compareCompleted ? "bg-pink-400 text-white" : "bg-gray-200"
              }`}
          // style={{ flex: 1 }}
          >
            <i className="fas fa-balance-scale mr-2"></i> Membanding
          </div>
          <div
            className={`px-4 py-2 rounded-full text-center transition-all ${currentGame === "order" || orderCompleted ? "bg-pink-400 text-white" : "bg-gray-200"
              }`}
          // style={{ flex: 1 }}
          >
            <i className="fas fa-sort-amount-up mr-2"></i> Urut
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
                onClick={() => window.location.href = "/category4_bab1"}
              >
                <span className="flex items-center justify-center gap-2">
                  <Home size={18} /> Kembali ke Kategori
                </span>
              </button>
            </div>
          </div>
        )}

        {!gameCompleted && currentGame === "read" && (
          <div className="game-section animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-book-open"></i> Membaca Bilangan
            </h2>
            <div className="text-3xl font-bold my-5 p-5 bg-gray-50 rounded-xl inline-block shadow">
              {numbers.read[currentRead].number}
            </div>
            <p className="mb-4">Bagaimana cara membaca bilangan di atas?</p>
            <div className="flex flex-col gap-2 mb-4">
              {numbers.read[currentRead].options.map((option, index) => (
                <button
                  key={index}
                  className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg transition-all my-1"
                  onClick={() => checkReadAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            {readResult.message && (
              <div
                className={`p-4 rounded-lg shadow my-4 ${readResult.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {readResult.message}
              </div>
            )}
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold"
              onClick={nextReadQuestion}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-arrow-right"></i> {currentRead < numbers.read.length - 1 ? "Soal Selanjutnya" : "Lanjut ke Menulis Bilangan"}
              </span>
            </button>
          </div>
        )}

        {!gameCompleted && currentGame === "write" && (
          <div className="game-section animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-pencil-alt"></i> Menulis Bilangan
            </h2>
            <div className="text-3xl font-bold my-5 p-5 bg-gray-50 rounded-xl inline-block shadow">
              {numbers.write[currentWrite].words}
            </div>
            <p className="mb-4">Tuliskan bilangan di atas dalam angka:</p>
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="p-2 text-xl w-64 border-4 border-gray-300 rounded-lg text-center mb-4"
              placeholder="Contoh: 1234"
            />
            <div>
              <button
                className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold"
                onClick={checkWriteAnswer}
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-check"></i> Periksa Jawaban
                </span>
              </button>
            </div>
            {writeResult.message && (
              <div
                className={`p-4 rounded-lg shadow my-4 ${writeResult.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {writeResult.message}
              </div>
            )}
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold mt-4"
              onClick={nextWriteQuestion}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-arrow-right"></i> {currentWrite < numbers.write.length - 1 ? "Soal Selanjutnya" : "Lanjut ke Membandingkan Bilangan"}
              </span>
            </button>
          </div>
        )}

        {!gameCompleted && currentGame === "compare" && (
          <div className="game-section animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-balance-scale"></i> Membandingkan Bilangan
            </h2>
            <div className="text-2xl my-5 flex justify-center items-center gap-5">
              <span className="bg-pink-400 p-4 rounded-lg shadow text-white font-bold">
                {numbers.compare[currentCompare].num1}
              </span>
              <span className="font-bold">vs</span>
              <span className="bg-teal-400 p-4 rounded-lg shadow text-white font-bold">
                {numbers.compare[currentCompare].num2}
              </span>
            </div>
            <p className="mb-4">Manakah yang lebih besar?</p>
            <div className="flex justify-center gap-3 my-5">
              <button
                className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg transition-all"
                onClick={() => checkCompareAnswer("left")}
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-angle-double-left"></i> Pertama
                </span>
              </button>
              <button
                className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg transition-all"
                onClick={() => checkCompareAnswer("equal")}
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-equals"></i> Sama
                </span>
              </button>
              <button
                className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-5 py-3 rounded-lg shadow hover:shadow-lg transition-all"
                onClick={() => checkCompareAnswer("right")}
              >
                <span className="flex items-center justify-center gap-2">
                  Kedua <i className="fas fa-angle-double-right"></i>
                </span>
              </button>
            </div>
            {compareResult.message && (
              <div
                className={`p-4 rounded-lg shadow my-4 ${compareResult.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {compareResult.message}
              </div>
            )}
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold"
              onClick={nextCompareQuestion}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-arrow-right"></i> {currentCompare < numbers.compare.length - 1 ? "Soal Selanjutnya" : "Lanjut ke Mengurutkan Bilangan"}
              </span>
            </button>
          </div>
        )}

        {!gameCompleted && currentGame === "order" && (
          <div className="game-section animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">
              <i className="fas fa-sort-amount-up"></i> Mengurutkan Bilangan
            </h2>
            <p className="mb-4">
              Susunlah bilangan berikut dari yang terkecil ke terbesar:
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {draggedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-lg shadow hover:scale-105 cursor-pointer transition-all"
                  onClick={() => handleDrop(item)}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="min-h-40 border-3 border-dashed border-teal-400 rounded-lg p-5 mb-4 bg-teal-50 flex flex-wrap gap-2 items-center justify-center">
              {dropZoneItems.length === 0 ? (
                <p className="text-teal-600">
                  Pilih bilangan di atas untuk mengurutkan
                </p>
              ) : (
                dropZoneItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-6 py-3 rounded-lg shadow hover:scale-105 cursor-pointer transition-all"
                    onClick={() => handleDragBack(item)}
                  >
                    {item}
                  </div>
                ))
              )}
            </div>

            <button
              className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold"
              onClick={checkOrderAnswer}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-check"></i> Periksa Jawaban
              </span>
            </button>

            {orderResult.message && (
              <div
                className={`p-4 rounded-lg shadow my-4 ${orderResult.isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {orderResult.message}
              </div>
            )}

            <button
              className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all font-bold mt-4"
              onClick={nextOrderQuestion}
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-arrow-right"></i> {currentOrder < numbers.order.length - 1 ? "Soal Selanjutnya" : "Selesai"}
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
          src="/api/placeholder/100/120"
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
