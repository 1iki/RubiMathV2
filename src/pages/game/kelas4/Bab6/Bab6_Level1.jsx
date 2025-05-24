import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Bab6_game.css";

const questions = [
  {
    id: 1,
    type: "table",
    question:
      "Berikut adalah tabel jumlah murid yang mengikuti ekstrakurikuler. Berapa jumlah murid yang mengikuti kegiatan Basket?",
    tableData: [
      ["Kegiatan", "Jumlah Murid"],
      ["Futsal", "15"],
      ["Basket", "12"],
      ["Pramuka", "18"],
      ["Paduan Suara", "10"],
    ],
    answers: ["15", "12", "18", "10"],
    correctIndex: 1,
  },
  {
    id: 2,
    type: "pictogram",
    question:
      "Setiap gambar bendera mewakili 5 murid. Berapa murid yang menyukai warna merah?",
    pictogram: [
      { label: "Merah", countIcon: 4 },
      { label: "Biru", countIcon: 2 },
      { label: "Hijau", countIcon: 3 },
    ],
    iconUrl: "https://cdn-icons-png.flaticon.com/512/197/197484.png",
    answers: ["15", "25", "20", "10"],
    correctIndex: 2,
  },
  {
    id: 3,
    type: "table",
    question:
      "Berapa total murid yang mengikuti pelajaran tambahan dari tabel di bawah?",
    tableData: [
      ["Hari", "Jumlah Murid"],
      ["Senin", "10"],
      ["Rabu", "8"],
      ["Jumat", "12"],
    ],
    answers: ["32", "30", "28", "25"],
    correctIndex: 1,
  },
  {
    id: 4,
    type: "pictogram",
    question:
      "Setiap gambar bola mewakili 3 murid yang suka olahraga. Berapa banyak murid yang suka sepak bola?",
    pictogram: [
      { label: "Sepak Bola", countIcon: 7 },
      { label: "Bola Basket", countIcon: 4 },
      { label: "Bola Voli", countIcon: 3 },
    ],
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2101/2101669.png",
    answers: ["21", "18", "14", "10"],
    correctIndex: 0,
  },
  {
    id: 5,
    type: "table",
    question:
      "Dari tabel berikut, berapa murid yang membawa bekal pada hari Kamis?",
    tableData: [
      ["Hari", "Jumlah Murid"],
      ["Senin", "11"],
      ["Selasa", "9"],
      ["Rabu", "10"],
      ["Kamis", "13"],
      ["Jumat", "12"],
    ],
    answers: ["9", "10", "13", "12"],
    correctIndex: 2,
  },
  {
    id: 6,
    type: "pictogram",
    question:
      "Setiap ikon buku mewakili 2 murid yang menyukai membaca. Berapa murid yang suka novel?",
    pictogram: [
      { label: "Novel", countIcon: 9 },
      { label: "Komik", countIcon: 6 },
      { label: "Ensiklopedia", countIcon: 3 },
    ],
    iconUrl: "https://cdn-icons-png.flaticon.com/512/29/29302.png",
    answers: ["18", "12", "20", "15"],
    correctIndex: 0,
  },
  {
    id: 7,
    type: "bar-chart",
    question:
      "Perhatikan diagram batang berikut. Berapa murid yang suka buah apel?",
    barChartData: [
      { label: "Apel", value: 18 },
      { label: "Jeruk", value: 13 },
      { label: "Mangga", value: 20 },
      { label: "Pisang", value: 15 },
    ],
    answers: ["18", "20", "15", "13"],
    correctIndex: 0,
  },
  {
    id: 8,
    type: "bar-chart",
    question: "Berapa murid yang suka matematika dari diagram batang berikut?",
    barChartData: [
      { label: "Matematika", value: 20 },
      { label: "Bahasa Indonesia", value: 15 },
      { label: "IPA", value: 18 },
      { label: "IPS", value: 12 },
    ],
    answers: ["20", "15", "18", "12"],
    correctIndex: 0,
  },
  {
    id: 9,
    type: "bar-chart",
    question:
      "Perhatikan diagram batang ini dan pilih jumlah murid yang suka menggambar.",
    barChartData: [
      { label: "Menggambar", value: 16 },
      { label: "Bersepeda", value: 14 },
      { label: "Membaca", value: 19 },
      { label: "Menulis", value: 12 },
    ],
    answers: ["16", "14", "19", "12"],
    correctIndex: 0,
  },
  {
    id: 10,
    type: "bar-chart",
    question:
      "Berapa murid yang suka olahraga renang menurut diagram batang di bawah?",
    barChartData: [
      { label: "Renang", value: 22 },
      { label: "Lari", value: 18 },
      { label: "Sepak Bola", value: 19 },
      { label: "Bulutangkis", value: 15 },
    ],
    answers: ["22", "18", "19", "15"],
    correctIndex: 0,
  },
];

function GamePenyajianData() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = questions[currentIndex];

  // Add keyboard event listener for the popup
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showPopup) {
        setShowPopup(false);
        setCurrentIndex(questions.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPopup, questions.length]);

  // Add useEffect to apply body class
  React.useEffect(() => {
    document.body.className = "bab6-game-body";
    return () => {
      document.body.className = "";
    };
  }, []);

  const maxValBar = currentQuestion.barChartData
    ? Math.max(...currentQuestion.barChartData.map((d) => d.value))
    : 0;

  function handleAnswerClick(idx) {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 10);
    }
  }
  function handleNext() {
    setSelectedAnswer(null);
    setAnswered(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowPopup(true);
    }
  }
  function handleRestart() {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setShowPopup(false);
  }

  function handleBackToCategory() {
    setShowPopup(false);
    navigate("/category4_bab6");
  }

  const renderTable = (tableData) => (
    <table className="data-table" role="table">
      <thead>
        <tr>
          {tableData[0].map((head, i) => (
            <th key={i}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.slice(1).map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPictogram = (pictogram, iconUrl) => (
    <>
      {pictogram.map(({ label, countIcon }, i) => (
        <div className="pictogram-row" key={i}>
          <div
            className="pictogram-icon"
            style={{ backgroundImage: `url(${iconUrl})` }}
            title={label}
            aria-label={label}
          />
          <span> x {countIcon}</span>
          <span style={{ fontWeight: 700, marginLeft: 12 }}>{label}</span>
        </div>
      ))}
      <p style={{ fontStyle: "italic", fontSize: "0.9rem", marginTop: 12 }}>
        Setiap simbol mewakili sejumlah murid, kalikan jumlah simbol dengan
        angka tersebut.
      </p>
    </>
  );
  const renderBarChart = (barChartData) => (
    <div className="bar-chart">
      {barChartData.map(({ label, value }, i) => {
        const widthPercent = (value / maxValBar) * 100;
        return (
          <div key={i} className="bar-container">
            <div className="bar-label">{label}</div>
            <div
              className="bar"
              style={{ width: `${widthPercent}%` }}
              aria-label={`${value} murid`}
              data-value={value}
            >
              {value} murid
            </div>
          </div>
        );
      })}
    </div>
  );
  if (currentIndex === questions.length) {
    return (
      <div
        className="game-container"
        role="main"
        aria-label="Hasil permainan bentuk penyajian data"
      >
        <h1>Permainan Selesai!</h1>
        <p className="score-board" aria-live="polite">
          Skor akhir kamu adalah {score} dari {questions.length * 10} poin!
        </p>{" "}
        <button className="restart-btn" onClick={handleRestart}>
          Main Lagi
        </button>
        <button className="back-btn" onClick={handleBackToCategory}>
          Kembali ke Kategori
        </button>
      </div>
    );
  }

  return (
    <div
      className="game-container"
      role="main"
      aria-label="Game Penyajian Data: Tabel dan Diagram"
    >
      <h1>Game Penyajian Data: Tabel dan Diagram</h1>
      <div className="score-board" aria-live="polite">
        Skor: {score}
      </div>
      <div className="question-number">
        Soal {currentIndex + 1} dari {questions.length}
      </div>
      <div className="question-text">{currentQuestion.question}</div>
      <div className="question-extra">
        {currentQuestion.type === "table" &&
          renderTable(currentQuestion.tableData)}
        {currentQuestion.type === "pictogram" &&
          renderPictogram(currentQuestion.pictogram, currentQuestion.iconUrl)}
        {currentQuestion.type === "bar-chart" &&
          renderBarChart(currentQuestion.barChartData)}
      </div>
      <ul className="answers" role="list">
        {currentQuestion.answers.map((answer, idx) => {
          let classes = "answer";
          if (answered) {
            if (idx === currentQuestion.correctIndex) classes += " correct";
            else if (
              selectedAnswer === idx &&
              idx !== currentQuestion.correctIndex
            )
              classes += " wrong";
          }
          if (selectedAnswer === idx) classes += " selected";

          return (
            <li
              key={idx}
              className={classes}
              role="button"
              tabIndex={0}
              aria-pressed={selectedAnswer === idx}
              onClick={() => handleAnswerClick(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAnswerClick(idx);
                }
              }}
            >
              {answer}
            </li>
          );
        })}
      </ul>
      <button className="next-btn" disabled={!answered} onClick={handleNext}>
        {currentIndex + 1 === questions.length ? "Lihat Hasil" : "Lanjutkan"}
      </button>
      <button
        className="restart-btn"
        style={{ display: "none" }}
        onClick={handleRestart}
      >
        Main Lagi
      </button>

      {showPopup && (
        <div
          className="result-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
        >
          <div className="result-popup">
            <h2 id="result-title">Hasil Akhir!</h2>
            <div className="result-score">
              <span className="score-number">{score}</span>
              <span className="score-total">/{questions.length * 10}</span>
            </div>
            <div className="result-message">
              {score === questions.length * 10
                ? "Hebat! Kamu mendapat nilai sempurna!"
                : score >= questions.length * 7
                ? "Bagus! Kamu menguasai materi ini dengan baik."
                : score >= questions.length * 5
                ? "Cukup baik! Teruslah berlatih."
                : "Jangan menyerah! Coba lagi untuk hasil yang lebih baik."}
            </div>
            <div className="result-buttons">
              <button className="result-btn restart" onClick={handleRestart}>
                Main Lagi
              </button>
              <button
                className="result-btn back"
                onClick={handleBackToCategory}
              >
                Kembali ke Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePenyajianData;
