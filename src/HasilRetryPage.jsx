// src/HasilRetryPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./skor.css";
import "./game.css";

export default function HasilRetryPage() {
  const { score } = useParams();
  const navigate = useNavigate();
  const [levelInfo, setLevelInfo] = useState({
    babIndex: 0,
    levelIndex: 0,
    levelKey: ""
  });
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0);
  
  useEffect(() => {
    // Mengambil informasi level yang baru saja dimainkan
    const currentLevelKey = localStorage.getItem("currentLevelKey") || "";
    const wrongAnswers = JSON.parse(localStorage.getItem("wrongAnswers")) || [];
    
    setWrongQuestionsCount(wrongAnswers.length);
    
    // Jika ada, parse untuk mendapatkan info bab dan level
    if (currentLevelKey) {
      // Format: "bab0_level0"
      const babMatch = currentLevelKey.match(/bab(\d+)/);
      const levelMatch = currentLevelKey.match(/level(\d+)/);
      
      if (babMatch && levelMatch) {
        setLevelInfo({
          babIndex: parseInt(babMatch[1]),
          levelIndex: parseInt(levelMatch[1]),
          levelKey: currentLevelKey
        });
      }
    }
  }, []);

  const getScoreMessage = () => {
    const scoreNum = parseInt(score);
    // Dapatkan total soal dari localStorage atau gunakan nilai standar (5)
    const totalSoal = parseInt(localStorage.getItem("totalSoal")) || 5;
    // Dapatkan total poin maksimal (masing-masing soal 20 poin)
    const maxScore = totalSoal * 20;
    // Hitung persentase skor
    const scorePercentage = (scoreNum / maxScore) * 100;
    
    if (scorePercentage <= 75) {
      return "Jangan Menyerah, Coba Lagi Ya!";
    } else if (scorePercentage > 75 && scorePercentage <= 85) {
      return "Wah Hebat, Sedikit Lagi Kamu Mencapai Skor Sempurna!";
    } else {
      return "Wah Hebatt, Pertahankan Ya!";
    }
  };

  const handleRetry = () => {
    // Set mode retry di localStorage
    localStorage.setItem("retryMode", "true");
    
    // Kembali ke halaman game dengan bab dan level yang sama
    navigate(`/game/${levelInfo.babIndex}/${levelInfo.levelIndex}`);
  };

  const handleSkip = () => {
    // Hapus data retry dan lanjut ke halaman hasil normal
    localStorage.removeItem("retryMode");
    localStorage.removeItem("wrongAnswers");
    localStorage.removeItem("soalStatus");
    
    navigate(`/hasil/${score}`);
  };

  return (
    <motion.div 
      className="hasil-page retry-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        Ayo Coba Lagi! ✏️
      </motion.h1>
      
      <p>Bab {levelInfo.babIndex + 1}, Level {levelInfo.levelIndex + 1}</p>
      
      <motion.div 
        className="score-display"
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <p className="score-number">{score}</p>
        <p className="score-label">Skor Saat Ini</p>
      </motion.div>
      
      <p className="score-message">{getScoreMessage()}</p>
      
      <div className="retry-info">
        <motion.div 
          className="wrong-answers-count"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <p className="wrong-count">{wrongQuestionsCount}</p>
          <p>Soal yang perlu diperbaiki</p>
        </motion.div>
        
        <motion.p 
          className="retry-message"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Beberapa jawaban masih kurang tepat. Mau mencoba lagi soal yang salah saja?
        </motion.p>
      </div>
      
      {/* Karakter pembantu dalam satu frame dengan posisi di kanan */}
      <motion.div 
        className="helper-frame retry-character"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
        style={{ alignItems: "flex-end", alignSelf: "flex-end", marginRight: "30px" }}
      >
        <div className="speech-bubble" style={{ alignSelf: "flex-end" }}>
          <p>Jangan menyerah! Yuk perbaiki jawabanmu! 😺</p>
        </div>
        <img 
          src="/src/assets/kucing.png" 
          alt="Karakter Kucing" 
          className="helper-character-img"
          style={{ alignSelf: "flex-end" }}
        />
      </motion.div>
      
      <div className="hasil-buttons">
        <button onClick={handleRetry} className="retry-button">
          Perbaiki Jawaban
        </button>
        <button onClick={handleSkip} className="skip-button">
          Lanjutkan Saja
        </button>
      </div>
    </motion.div>
  );
}