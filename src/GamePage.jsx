// src/GamePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./game.css";
import { useAuth } from "./context/AuthContext";
import supabase from "./config/supabase";

export default function GamePage() {
  const { chapterIndex, levelIndex } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [jawaban, setJawaban] = useState("");
  const [skor, setSkor] = useState(0);
  const [soalIndex, setSoalIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showError, setShowError] = useState(false);
  const [shake, setShake] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [soalStatus, setSoalStatus] = useState([]);
  
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
  
  const bankSoal = {
    0: { 
      0: [ 
        { pertanyaan: "Berapa hasil dari 2 + 2?", jawaban: "4", poin: 20 },
        { pertanyaan: "Berapa hasil dari 5 + 3?", jawaban: "8", poin: 20 },
        { pertanyaan: "Berapa hasil dari 4 + 6?", jawaban: "10", poin: 20 },
        { pertanyaan: "Berapa hasil dari 7 + 2?", jawaban: "9", poin: 20 },
        { pertanyaan: "Berapa hasil dari 3 + 8?", jawaban: "11", poin: 20 },
      ]
    }
  };

  const getSoal = () => {
    try {
      if (isRetryMode) {
        const soalSalahIndex = wrongAnswers[soalIndex];
        return bankSoal[parseInt(chapterIndex)][parseInt(levelIndex)][soalSalahIndex];
      } else {
        return bankSoal[parseInt(chapterIndex)][parseInt(levelIndex)][soalIndex];
      }
    } catch (error) {
      return { pertanyaan: "Soal tidak tersedia", jawaban: "", poin: 0 };
    }
  };

  const getTotalSoal = () => {
    try {
      if (isRetryMode) {
        return wrongAnswers.length;
      } else {
        return bankSoal[parseInt(chapterIndex)][parseInt(levelIndex)].length;
      }
    } catch (error) {
      return 1;
    }
  };

  useEffect(() => {
    const storedProgress = JSON.parse(localStorage.getItem("chapterProgress")) || [];
    const storedScores = JSON.parse(localStorage.getItem("levelScores")) || {};
    if (storedProgress && storedProgress[chapterIndex]) {
      setProgress(storedProgress[chapterIndex]);
    }
    const totalSoal = bankSoal[parseInt(chapterIndex)][parseInt(levelIndex)].length;
    setSoalStatus(Array(totalSoal).fill(null));
  }, [chapterIndex, levelIndex]);

  const updateProgress = (isBenar) => {
    if (isBenar) {
      const poinSoal = getSoal().poin || 0;
      const totalSoal = getTotalSoal();
      const progressIncrement = (poinSoal / (totalSoal * 20)) * 100;
      const newProgress = Math.min(progress + progressIncrement, 100);
      setProgress(newProgress);
      
      // Simpan progres di localStorage
      const storedProgress = JSON.parse(localStorage.getItem("chapterProgress")) || Array(3).fill(0);
      storedProgress[chapterIndex] = newProgress;
      localStorage.setItem("chapterProgress", JSON.stringify(storedProgress));
      
      const currentScore = skor + poinSoal;
      setSkor(currentScore);
      
      // Simpan skor dan progress berdasarkan avatar yang dipilih
      const savedAvatar = localStorage.getItem("selectedAvatar");
      if (savedAvatar) {
        const avatar = JSON.parse(savedAvatar);
        const avatarKey = `avatar_${avatar.name}_levelScores`;
        const storedScores = JSON.parse(localStorage.getItem(avatarKey)) || {};
        const levelKey = `bab${chapterIndex}_level${levelIndex}`;
        
        // Simpan skor
        storedScores[levelKey] = currentScore;
        localStorage.setItem(avatarKey, JSON.stringify(storedScores));
        
        // Simpan progress per chapter untuk avatar
        const avatarProgressKey = `avatar_${avatar.name}_chapterProgress`;
        const avatarProgress = JSON.parse(localStorage.getItem(avatarProgressKey)) || Array(3).fill(0);
        avatarProgress[chapterIndex] = newProgress;
        localStorage.setItem(avatarProgressKey, JSON.stringify(avatarProgress));
        
        // Dapatkan jenis operasi dari URL path
        const pathParts = window.location.pathname.split('/');
        const operation = pathParts.length > 2 ? pathParts[2] : 'addition'; // default to addition
        
        // Simpan jenis operasi
        const operationData = JSON.parse(localStorage.getItem(`${avatarKey}_operations`)) || {};
        operationData[levelKey] = operation;
        localStorage.setItem(`${avatarKey}_operations`, JSON.stringify(operationData));
        
        // Simpan timestamp
        localStorage.setItem(`${levelKey}_timestamp`, Date.now().toString());
        
        // Simpan operasi saat ini untuk digunakan di HasilPage
        localStorage.setItem("currentOperation", operation);
        
        // Simpan informasi karakter yang sedang aktif
        localStorage.setItem("activeCharacter", savedAvatar);
      }
      
      // Progress lama disimpan untuk backward compatibility
      const storedScores = JSON.parse(localStorage.getItem("levelScores")) || {};
      const levelKey = `bab${chapterIndex}_level${levelIndex}`;
      storedScores[levelKey] = currentScore;
      localStorage.setItem("levelScores", JSON.stringify(storedScores));
      
      return true;
    }
    return false;
  };

  const handleJawaban = () => {
    if (!jawaban.trim()) {
      setShake(true);
      setShowError(true);
      setTimeout(() => {
        setShake(false);
      }, 500);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
      return;
    }
    
    const soalSekarang = getSoal();
    const isBenar = jawaban.trim().toLowerCase() === soalSekarang.jawaban.toLowerCase();
    
    if (!isRetryMode) {
      const updatedSoalStatus = [...soalStatus];
      updatedSoalStatus[soalIndex] = isBenar;
      setSoalStatus(updatedSoalStatus);
      if (!isBenar) {
        setWrongAnswers([...wrongAnswers, soalIndex]);
      }
    } else {
      if (isBenar) {
        const updatedWrongAnswers = [...wrongAnswers];
        const currentWrongSoalIndex = wrongAnswers[soalIndex];
        const updatedSoalStatus = [...soalStatus];
        updatedSoalStatus[currentWrongSoalIndex] = true;
        setSoalStatus(updatedSoalStatus);
      }
    }
    
    updateProgress(isBenar);
    setJawaban("");
    
    if (soalIndex < getTotalSoal() - 1) {
      setSoalIndex(soalIndex + 1);
    } else {
      if (wrongAnswers.length > 0 && !isRetryMode) {
        promptRetryWrongQuestions();
      } else {
        finishGame();
      }
    }
  };

  const promptRetryWrongQuestions = () => {
    const levelKey = `bab${chapterIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);
    localStorage.setItem("soalStatus", JSON.stringify(soalStatus));
    localStorage.setItem("wrongAnswers", JSON.stringify(wrongAnswers));
    localStorage.setItem("currentScore", skor.toString());
    
    // Simpan total jumlah soal untuk digunakan di HasilPage
    const totalSoal = getTotalSoal();
    localStorage.setItem("totalSoal", totalSoal.toString());
    
    navigate(`/hasil-retry/${skor}`);
  };
  
  const finishGame = () => {
    const levelKey = `bab${chapterIndex}_level${levelIndex}`;
    localStorage.setItem("currentLevelKey", levelKey);
    
    // Simpan total jumlah soal untuk digunakan di HasilPage
    const totalSoal = getTotalSoal();
    localStorage.setItem("totalSoal", totalSoal.toString());
    
    navigate(`/hasil/${skor}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJawaban();
    }
  };
  
  useEffect(() => {
    const retryMode = localStorage.getItem("retryMode") === "true";
    if (retryMode) {
      const storedWrongAnswers = JSON.parse(localStorage.getItem("wrongAnswers")) || [];
      const storedSoalStatus = JSON.parse(localStorage.getItem("soalStatus")) || [];
      const storedScore = parseInt(localStorage.getItem("currentScore") || "0");
      setIsRetryMode(true);
      setWrongAnswers(storedWrongAnswers);
      setSoalStatus(storedSoalStatus);
      setSkor(storedScore);
      setSoalIndex(0);
      localStorage.removeItem("retryMode");
    }
  }, []);

  // Fungsi untuk menyimpan progress game
  const saveGameProgress = async () => {
    try {
      const { data: siswaData, error: siswaError } = await supabase
        .from("siswa")
        .select("id_siswa")
        .eq("auth_user_id", user.id)
        .single();

      if (siswaError) {
        console.error("Error getting siswa data:", siswaError);
        return;
      }

      const gameData = {
        id_siswa: siswaData.id_siswa,
        kelas: parseInt(chapterIndex) + 1,
        bab: parseInt(levelIndex) + 1,
        level: 1,
        jenis_permainan: "Game Umum",
        skor: skor,
        skor_maksimal: 100,
        status_selesai: soalIndex >= getTotalSoal(),
        detail_jawaban: {
          jawaban: [
            {
              total_benar: soalStatus.filter(status => status).length,
              total_soal: getTotalSoal()
            }
          ]
        }
      };

      const { error: progressError } = await supabase.rpc(
        "update_game_progress",
        gameData
      );

      if (progressError) {
        console.error("Error saving game progress:", progressError);
        return;
      }

      console.log("Game progress saved successfully!");
    } catch (error) {
      console.error("Error in saveGameProgress:", error);
    }
  };

  // Simpan progress saat skor berubah atau game selesai
  useEffect(() => {
    if (skor > 0 || soalIndex >= getTotalSoal()) {
      saveGameProgress();
    }
  }, [skor, soalIndex]);

  return (
    <div className="game-page">
      <h1>
        {isRetryMode ? "Perbaiki Jawabanmu" : "Game Matematika"}
      </h1>

      <div className="game-progress-container">
        <div className="game-progress-label">
          Progress: {Math.round(progress)}%
        </div>
        <div className="game-progress-bar">
          <div
            className="game-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="soal-info">
        {isRetryMode ? (
          <p className="retry-mode">Mode: Perbaikan Jawaban</p>
        ) : null}
        <p>Bab {parseInt(chapterIndex) + 1}, Level {parseInt(levelIndex) + 1}</p>
        <p>
          Soal {soalIndex + 1} dari {getTotalSoal()}
          {isRetryMode ? " (yang perlu diperbaiki)" : ""}
        </p>
        <p>Skor: {skor}</p>
      </div>

      <motion.div 
        className="soal-container"
        animate={{ scale: shake ? [1, 1.02, 0.98, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p 
          className="pertanyaan"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${isRetryMode}-${soalIndex}`}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {getSoal().pertanyaan}
        </motion.p>

        <div className="input-container">
          <motion.input
            type="text"
            value={jawaban}
            onChange={(e) => setJawaban(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRetryMode ? "Perbaiki jawabanmu..." : "Masukkan jawaban..."}
            autoFocus
            className={shake ? "shake-input" : ""}
            animate={{ 
              border: showError ? "2px solid #ff3d3d" : "2px solid #999" 
            }}
          />
          
          <motion.button 
            onClick={handleJawaban}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={isRetryMode ? "retry-button" : ""}
          >
            {isRetryMode ? "Perbaiki" : "Jawab"}
          </motion.button>
        </div>

        <AnimatePresence>
          {showError && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="error-icon">❗</div>
              <p>Oops! Jawaban tidak boleh kosong</p>
              <div className="error-character">
                <img 
                  src="/src/assets/icon_murid.PNG" 
                  alt="Karakter" 
                  className="error-character-img"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div 
        className="helper-frame"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="speech-bubble">
          <p>
            {isRetryMode 
              ? "Yuk, perbaiki jawaban yang salah! 🧩" 
              : "Ayo jawab pertanyaannya! 🎮"}
          </p>
        </div>
        <img 
          src={isRetryMode ? "/src/assets/harimau.png" : "/src/assets/anjing.png"} 
          alt="Karakter Pembantu" 
          className="helper-character-img"
        />
      </motion.div>
    </div>
  );
}
