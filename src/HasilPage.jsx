// src/HasilPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./skor.css";

export default function HasilPage() {
  const { score } = useParams(); // Parameter skor dari URL
  const navigate = useNavigate();
  const [levelInfo, setLevelInfo] = useState({
    babIndex: 0,
    levelIndex: 0,
    levelKey: ""
  });
  
  useEffect(() => {
    // Mengambil informasi level yang baru saja dimainkan
    const currentLevelKey = localStorage.getItem("currentLevelKey") || "";
    
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
    
    // Simpan skor ke localStorage berdasarkan avatar dan juga simpan jenis operasi
    if (currentLevelKey && score) {
      const savedAvatar = localStorage.getItem("selectedAvatar");
      if (savedAvatar) {
        const avatar = JSON.parse(savedAvatar);
        const avatarKey = `avatar_${avatar.name}_levelScores`;
        
        // Ambil jenis operasi dari localStorage yang disimpan oleh GamePage
        const operation = localStorage.getItem("currentOperation") || 'addition';
        
        // Gunakan timestamp untuk membuat key yang benar-benar unik setiap kali bermain
        const timestamp = Date.now();
        
        // Buat key yang unik berdasarkan level, operasi, dan timestamp
        const uniqueKey = `${currentLevelKey}_${operation}_${timestamp}`;
        
        // Ambil data skor yang sudah ada untuk avatar ini
        let levelScores = JSON.parse(localStorage.getItem(avatarKey)) || {};
        
        // Tambahkan entri baru dengan timestamp unik
        levelScores[uniqueKey] = parseInt(score);
        
        // Simpan kembali ke localStorage
        localStorage.setItem(avatarKey, JSON.stringify(levelScores));
        
        // Simpan jenis operasi dengan key yang unik juga
        const operationsKey = `avatar_${avatar.name}_operations`;
        const operationData = JSON.parse(localStorage.getItem(operationsKey)) || {};
        operationData[uniqueKey] = operation;
        localStorage.setItem(operationsKey, JSON.stringify(operationData));
        
        // Simpan timestamp sebagai bagian dari key dan juga sebagai value terpisah
        localStorage.setItem(`${uniqueKey}_timestamp`, timestamp.toString());
        
        // Hitung dan simpan progress chapter untuk avatar
        // Parse info chapter dari currentLevelKey
        const [babKey, _] = currentLevelKey.split("_");
        const chapterIndex = parseInt(babKey.replace("bab", ""));
        
        // Ambil progress chapter avatar dari localStorage
        const avatarProgressKey = `avatar_${avatar.name}_chapterProgress`;
        let avatarProgress = JSON.parse(localStorage.getItem(avatarProgressKey)) || Array(3).fill(0);
        
        // Hitung level yang telah diselesaikan di chapter ini
        const chapLevels = new Set();
        Object.keys(levelScores).forEach(key => {
          // Extract level part from keys like "bab0_level0_addition_timestamp"
          const keyParts = key.split('_');
          if (keyParts.length >= 2 && keyParts[0] === `bab${chapterIndex}`) {
            chapLevels.add(keyParts[1]); // Add the level part
          }
        });
        
        const chapProgress = Math.min((chapLevels.size / 3) * 100, 100); // 3 level per chapter
        
        // Update progress chapter
        avatarProgress[chapterIndex] = chapProgress;
        localStorage.setItem(avatarProgressKey, JSON.stringify(avatarProgress));
      }
      
      // Simpan juga ke format lama untuk backward compatibility (dengan key unik berbasis timestamp)
      const operation = localStorage.getItem("currentOperation") || 'addition';
      const timestamp = Date.now();
      const uniqueKey = `${currentLevelKey}_${operation}_${timestamp}`;
      let levelScores = JSON.parse(localStorage.getItem("levelScores")) || {};
      levelScores[uniqueKey] = parseInt(score);
      localStorage.setItem("levelScores", JSON.stringify(levelScores));
      
      // Update chapter progress
      const chapterProgress = JSON.parse(localStorage.getItem("chapterProgress")) || [];
      if (!chapterProgress.includes(uniqueKey)) {
        chapterProgress.push(uniqueKey);
        localStorage.setItem("chapterProgress", JSON.stringify(chapterProgress));
      }
    }
    
    // Efek confetti untuk skor di atas 50
    if (parseInt(score) > 50) {
      // Bisa implementasikan efek confetti menggunakan library seperti canvas-confetti
      // Atau gunakan animasi CSS sederhana
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      document.body.appendChild(confettiContainer);
      
      // Pembersihan saat komponen unmount
      return () => {
        document.body.removeChild(confettiContainer);
      };
    }
  }, [score]);

  const handleKembali = () => {
    navigate("/main-siswa");
  };

  const handleNextLevel = () => {
    // Navigasi ke level berikutnya jika tersedia
    if (levelInfo.levelIndex < 2) {
      // Masih dalam bab yang sama, level berikutnya
      navigate(`/materi/${levelInfo.babIndex}/${levelInfo.levelIndex + 1}`);
    } else if (levelInfo.babIndex < 2) {
      // Bab berikutnya, level pertama
      navigate(`/materi/${levelInfo.babIndex + 1}/0`);
    } else {
      // Sudah selesai semua level
      navigate("/main-siswa");
    }
  };

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

  return (
    <motion.div 
      className="hasil-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: "100vh", width: "100%" }}
    >
      <motion.h1
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        🎉 Level Selesai!
      </motion.h1>
      
      <p>Bab {levelInfo.babIndex + 1}, Level {levelInfo.levelIndex + 1}</p>
      
      <motion.div 
        className="score-display"
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <p className="score-number">{score}</p>
        <p className="score-label">Skor Anda</p>
      </motion.div>
      
      <p className="score-message">{getScoreMessage()}</p>
      
      <div className="hasil-buttons">
        {/* <button onClick={handleKembali}>Kembali ke Menu</button> */}
        <button onClick={handleNextLevel} className="next-level-button">
          Level Selanjutnya ➔
        </button>
      </div>
    </motion.div>
  );
}
