import { useState, useEffect } from "react";
import { Triangle, Square, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Bab5_game.css";
import supabase from "../../../../config/supabase";
import { useAuth } from "../../../../context/AuthContext";
import { saveGameProgress, getGameProgress } from "../../../../services/gameProgressService";

// Game utama
export default function MathGame() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Redirect jika tidak ada user
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Jika masih loading, tampilkan loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading...</div>
      </div>
    );
  }

  // Jika tidak ada user, jangan render game
  if (!user) {
    return null;
  }

  // State untuk melacak permainan
  const [gameState, setGameState] = useState({
    screen: "game", // langsung mulai game ('game', 'result')
    score: 0,
    questionIndex: 0,
    totalAnswered: 0,
    correctAnswers: 0,
    completed: false,
    feedback: "",
    showHint: false,
  });

  const handleSaveProgress = async () => {
    const gameData = {
      kelas: 4,
      bab: 5,
      level: 1,
      jenis_permainan: "Bangun Datar",
      skor: Math.round(gameState.score),
      skor_maksimal: 100,
      status_selesai: gameState.completed,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: gameState.correctAnswers,
            total_soal: questions.length
          }
        ]
      }
    };

    await saveGameProgress(gameData);
  };

  // Simpan progress saat score berubah atau game selesai
  useEffect(() => {
    if (gameState.score > 0 || gameState.completed) {
      handleSaveProgress();
    }
  }, [gameState.score, gameState.completed]);

  // Langsung memulai game saat komponen dimuat
  useEffect(() => {
    // Tidak perlu melakukan apapun karena state awal sudah 'game'
  }, []);

  // Data tentang bangun datar
  const shapes = {
    persegi: {
      name: "Persegi",
      sides: 4,
      angles: 4,
      properties: [
        "Semua sisi sama panjang",
        "Semua sudut sama besar (90°)",
        "Sisi yang berhadapan sejajar",
      ],
      formulas: {
        keliling: "4 × sisi",
        luas: "sisi × sisi",
      },
      icon: <Square className="text-blue-500" />,
    },
    persegiPanjang: {
      name: "Persegi Panjang",
      sides: 4,
      angles: 4,
      properties: [
        "Sisi yang berhadapan sama panjang",
        "Semua sudut sama besar (90°)",
        "Sisi yang berhadapan sejajar",
      ],
      formulas: {
        keliling: "2 × (panjang + lebar)",
        luas: "panjang × lebar",
      },
      icon: <Square className="text-green-500" />,
    },
    segitiga: {
      name: "Segitiga",
      sides: 3,
      angles: 3,
      properties: ["Jumlah sudut selalu 180°", "Memiliki 3 sisi dan 3 sudut"],
      formulas: {
        keliling: "sisi a + sisi b + sisi c",
        luas: "½ × alas × tinggi",
      },
      icon: <Triangle className="text-red-500" />,
    },
    lingkaran: {
      name: "Lingkaran",
      sides: 1,
      angles: 0,
      properties: [
        "Jarak dari pusat ke tepi selalu sama",
        "Memiliki 1 sisi melingkar",
      ],
      formulas: {
        keliling: "2 × π × jari-jari",
        luas: "π × jari-jari × jari-jari",
      },
      icon: <Circle className="text-purple-500" />,
    },
  };

  // Bank soal (15 soal)
  const questions = [
    {
      question:
        "Soal 1: Bangun datar yang memiliki 4 sisi yang sama panjang adalah?",
      options: ["Persegi", "Persegi Panjang", "Segitiga", "Lingkaran"],
      answer: "Persegi",
      hint: "Bangun ini memiliki 4 sisi yang sama panjang dan 4 sudut siku-siku.",
    },
    {
      question: "Soal 2: Bangun datar yang tidak memiliki sudut adalah?",
      options: ["Persegi", "Persegi Panjang", "Segitiga", "Lingkaran"],
      answer: "Lingkaran",
      hint: "Bangun ini berbentuk bulat dan tidak memiliki sudut.",
    },
    {
      question: "Soal 3: Berapa jumlah sisi yang dimiliki segitiga?",
      options: ["1", "2", "3", "4"],
      answer: "3",
      hint: "Nama 'segitiga' berasal dari 'segi tiga' yang berarti memiliki tiga sisi.",
    },
    {
      question: "Soal 4: Berapa jumlah sudut pada persegi panjang?",
      options: ["3", "4", "5", "6"],
      answer: "4",
      hint: "Persegi panjang memiliki 4 sisi dan setiap pertemuan sisi membentuk sudut.",
    },
    {
      question:
        "Soal 5: Bangun datar yang memiliki dua pasang sisi sejajar tetapi tidak sama panjang adalah?",
      options: ["Persegi", "Segitiga", "Trapesium", "Jajar Genjang"],
      answer: "Jajar Genjang",
      hint: "Bangun ini memiliki dua pasang sisi sejajar dan sudut-sudut berhadapan sama besar.",
    },
    {
      question: "Soal 6: Berapa jumlah sudut dalam segitiga?",
      options: ["90°", "180°", "270°", "360°"],
      answer: "180°",
      hint: "Jumlah sudut dalam segitiga selalu tetap, tidak peduli bentuk segitiganya.",
    },
    {
      question: "Soal 7: Semua sudut pada persegi besarnya adalah?",
      options: ["30°", "60°", "90°", "120°"],
      answer: "90°",
      hint: "Sudut 90° disebut sudut siku-siku.",
    },
    {
      question: "Soal 8: Berapa keliling persegi dengan sisi 5 cm?",
      options: ["10 cm", "15 cm", "20 cm", "25 cm"],
      answer: "20 cm",
      hint: "Keliling persegi = 4 × sisi",
    },
    {
      question:
        "Soal 9: Berapa keliling persegi panjang dengan panjang 8 cm dan lebar 4 cm?",
      options: ["16 cm", "20 cm", "24 cm", "32 cm"],
      answer: "24 cm",
      hint: "Keliling persegi panjang = 2 × (panjang + lebar)",
    },
    {
      question:
        "Soal 10: Berapa keliling segitiga dengan sisi 5 cm, 6 cm, dan 7 cm?",
      options: ["12 cm", "15 cm", "18 cm", "20 cm"],
      answer: "18 cm",
      hint: "Keliling segitiga = jumlah semua sisi",
    },
    {
      question: "Soal 11: Berapa luas persegi dengan sisi 6 cm?",
      options: ["12 cm²", "18 cm²", "24 cm²", "36 cm²"],
      answer: "36 cm²",
      hint: "Luas persegi = sisi × sisi",
    },
    {
      question:
        "Soal 12: Berapa luas persegi panjang dengan panjang 9 cm dan lebar 5 cm?",
      options: ["14 cm²", "28 cm²", "45 cm²", "54 cm²"],
      answer: "45 cm²",
      hint: "Luas persegi panjang = panjang × lebar",
    },
    {
      question:
        "Soal 13: Berapa luas segitiga dengan alas 8 cm dan tinggi 6 cm?",
      options: ["14 cm²", "24 cm²", "48 cm²", "64 cm²"],
      answer: "24 cm²",
      hint: "Luas segitiga = ½ × alas × tinggi",
    },
    {
      question:
        "Soal 14: Berapa luas lingkaran dengan jari-jari 3 cm? (π = 3.14)",
      options: ["9.42 cm²", "18.84 cm²", "28.26 cm²", "56.52 cm²"],
      answer: "28.26 cm²",
      hint: "Luas lingkaran = π × jari-jari × jari-jari",
    },
    {
      question:
        "Soal 15: Andi akan membuat bingkai foto berbentuk persegi panjang. Jika panjangnya 25 cm dan lebarnya 15 cm, berapa panjang kayu yang diperlukan untuk membuat bingkai?",
      options: ["40 cm", "65 cm", "80 cm", "100 cm"],
      answer: "80 cm",
      hint: "Kayu diperlukan untuk membuat keliling bingkai: 2 × (panjang + lebar)",
    },
  ];

  // Fungsi untuk memeriksa jawaban
  const checkAnswer = (selectedAnswer) => {
    const currentQuestion = questions[gameState.questionIndex];

    if (selectedAnswer === currentQuestion.answer) {
      // Menghitung skor dengan skala 0-100 untuk 15 soal
      // Setiap soal benar bernilai 100/15 poin
      const pointsPerQuestion = (100/questions.length).toFixed(2);
      setGameState({
        ...gameState,
        score: Number((gameState.score + Number(pointsPerQuestion)).toFixed(2)),
        totalAnswered: gameState.totalAnswered + 1,
        correctAnswers: gameState.correctAnswers + 1,
        feedback: "Benar! 🎉",
        showHint: false,
      });

      // Delay sebelum melanjutkan ke pertanyaan berikutnya
      setTimeout(() => {
        if (gameState.questionIndex < questions.length - 1) {
          // Masih ada pertanyaan selanjutnya
          setGameState((prev) => ({
            ...prev,
            questionIndex: prev.questionIndex + 1,
            feedback: "",
            showHint: false,
          }));
        } else {
          // Game selesai
          setGameState((prev) => ({
            ...prev,
            screen: "result",
            completed: true,
          }));
        }
      }, 1000);
    } else {
      // Jawaban salah
      setGameState({
        ...gameState,
        totalAnswered: gameState.totalAnswered + 1,
        feedback: "Jawaban salah! 😢",
        showHint: true,
      });
    }
  };

  // Fungsi untuk melanjutkan ke pertanyaan berikutnya
  const nextQuestion = () => {
    if (gameState.questionIndex < questions.length - 1) {
      setGameState((prev) => ({
        ...prev,
        questionIndex: prev.questionIndex + 1,
        feedback: "",
        showHint: false,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        screen: "result",
        completed: true,
      }));
    }
  };

  // Fungsi untuk menampilkan hint
  const showHint = () => {
    setGameState({
      ...gameState,
      showHint: true,
    });
  };

  // Menghitung persentase jawaban benar
  const calculatePercentage = () => {
    if (gameState.totalAnswered === 0) return 0;
    return Number(gameState.score.toFixed(2)); // Skor sudah dalam persentase 0-100, tampilkan 2 desimal
  };

  // Fungsi untuk mendapatkan grade berdasarkan persentase
  const getGrade = (percentage) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "E";
  };

  // Render berdasarkan screen aktif
  const renderScreen = () => {
    switch (gameState.screen) {
      case "game":
        const currentQuestion = questions[gameState.questionIndex];

        return (
          <div className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm">
                {gameState.questionIndex + 1}/{questions.length}
              </span>

              <div className="flex items-center">
                <span className="font-semibold">Skor: {gameState.score}</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">
                {currentQuestion.question}
              </h2>

              {gameState.feedback && (
                <div
                  className={`p-2 rounded-md mb-2 ${
                    gameState.feedback.includes("Benar")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {gameState.feedback}
                </div>
              )}

              {gameState.showHint && (
                <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md mb-3">
                  <span className="font-bold">Petunjuk:</span>{" "}
                  {currentQuestion.hint}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(option)}
                  className="py-3 px-4 bg-blue-50 text-blue-800 font-medium rounded-lg hover:bg-blue-100 transition duration-200 text-left"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              {!gameState.showHint && (
                <button
                  onClick={showHint}
                  className="py-2 px-4 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition duration-200"
                >
                  Tampilkan Petunjuk
                </button>
              )}

              {gameState.feedback && gameState.feedback.includes("salah") && (
                <button
                  onClick={nextQuestion}
                  className="py-2 px-4 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition duration-200"
                >
                  Lanjut ke Soal Berikutnya
                </button>
              )}
            </div>
          </div>
        );

      case "result":
        const percentage = calculatePercentage();
        const grade = getGrade(percentage);

        return (
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-4">Selesai! 🎉</h1>

            <div className="mb-6 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Nilai:</span>
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className={`h-4 rounded-full ${
                    percentage >= 80
                      ? "bg-green-500"
                      : percentage >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span>Grade:</span>
                <span
                  className={`text-xl font-bold py-1 px-3 rounded-full ${
                    grade === "A"
                      ? "bg-green-100 text-green-800"
                      : grade === "B"
                      ? "bg-blue-100 text-blue-800"
                      : grade === "C"
                      ? "bg-yellow-100 text-yellow-800"
                      : grade === "D"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {grade}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Skor Total</p>
                  <p className="text-xl font-bold">{gameState.score}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Jawaban Benar</p>
                  <p className="text-xl font-bold">
                    {gameState.correctAnswers} / {gameState.totalAnswered}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 w-full">
              <h2 className="font-bold text-lg mb-2">
                Yang sudah kamu pelajari:
              </h2>
              <ul className="text-left">
                <li className="mb-1">• Mengenal berbagai bangun datar</li>
                <li className="mb-1">• Sifat-sifat bangun datar</li>
                <li className="mb-1">• Menghitung keliling bangun datar</li>
                <li className="mb-1">• Menghitung luas bangun datar</li>
                <li>• Menyelesaikan masalah sehari-hari</li>
              </ul>
            </div>

            <div className="flex w-full justify-start mb-4">
              <button
                onClick={() => window.history.back()}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                ← Kembali
              </button>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="py-3 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Main Lagi
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bab5-game-container flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-md">{renderScreen()}</div>
    </div>
  );
}
