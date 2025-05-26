import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../../context/AuthContext";
import { saveGameProgress } from "../../../../services/gameProgressService";
import "../games4.css";

export default function FaktorKelipatanDragDropGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSaveProgress = async () => {
    if (!user) return;
    
    const gameData = {
      kelas: 4,
      bab: 1,
      level: 4,
      jenis_permainan: "Game Faktor dan Kelipatan",
      skor: score,
      skor_maksimal: questions.length * pointsPerQuestion,
      status_selesai: gameOver,
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
    if (score > 0 || gameOver) {
      handleSaveProgress();
    }
  }, [score, gameOver]);

  // Questions data
  const questions = [
    {
      number: 12,
      type: 'faktor',
      cand: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12],
      correct: [1, 2, 3, 4, 6, 12],
    },
    {
      number: 5,
      type: 'kelipatan',
      cand: [2, 5, 8, 10, 12, 15, 20],
      correct: [5, 10, 15, 20],
    },
    {
      number: 18,
      type: 'faktor',
      cand: [1, 2, 3, 4, 6, 9, 12, 18, 24],
      correct: [1, 2, 3, 6, 9, 12, 18],
    },
    {
      number: 3,
      type: 'kelipatan',
      cand: [1, 3, 5, 6, 9, 11, 12, 15, 18, 21, 24, 27, 30],
      correct: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
    },
    {
      number: 20,
      type: 'faktor',
      cand: [1, 2, 4, 5, 7, 10, 15, 20, 40],
      correct: [1, 2, 4, 5, 10, 20],
    },
    {
      number: 4,
      type: 'kelipatan',
      cand: [2, 4, 8, 9, 12, 14, 16, 20, 24],
      correct: [4, 8, 12, 16, 20, 24],
    },
    {
      number: 7,
      type: 'faktor',
      cand: [1, 5, 7, 14, 21, 28],
      correct: [1, 7],
    },
    {
      number: 10,
      type: 'kelipatan',
      cand: [5, 10, 20, 25, 30, 35, 40, 50],
      correct: [10, 20, 30, 40, 50],
    },
    {
      number: 15,
      type: 'faktor',
      cand: [1, 3, 5, 6, 9, 10, 15, 20],
      correct: [1, 3, 5, 15],
    },
    {
      number: 2,
      type: 'kelipatan',
      cand: [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 16, 18, 20],
      correct: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    },
  ];

  const totalQuestions = questions.length;
  const pointsPerQuestion = 10;

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  // candidatesState: object: candidate number => 'candidates' | 'correct' | 'incorrect'
  const [candidateState, setCandidateState] = useState({});
  const [feedback, setFeedback] = useState({ text: '', type: '' }); // type 'correct' or 'incorrect'
  const [submitted, setSubmitted] = useState(false);

  const [draggedValue, setDraggedValue] = useState(null);

  // refs for dropzones for keyboard drop support
  const dropzoneCorrectRef = useRef(null);
  const dropzoneIncorrectRef = useRef(null);

  // Shuffle utility
  function shuffleArray(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Initialize question - shuffle candidates and reset states
  useEffect(() => {
    // Pastikan currentQuestionIndex valid dan questions[currentQuestionIndex] tersedia
    if (currentQuestionIndex < totalQuestions && questions[currentQuestionIndex]) {
      let currentQ = questions[currentQuestionIndex];
      let shuffled = shuffleArray(currentQ.cand);
      setCandidates(shuffled);
      // Initialize candidateState to 'candidates'
      const initCandidateState = {};
      shuffled.forEach((num) => {
        initCandidateState[num] = 'candidates';
      });
      setCandidateState(initCandidateState);
      setFeedback({ text: '', type: '' });
      setSubmitted(false);
      setDraggedValue(null);
    }
  }, [currentQuestionIndex]);

  // Handle drag event
  function handleDragStart(e, value) {
    setDraggedValue(value);
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragEnd() {
    setDraggedValue(null);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // Drop handler helper
  function handleDrop(zone) {
    if (draggedValue === null) return;
    // update candidate state
    setCandidateState((prev) => {
      if (prev[draggedValue] === zone) return prev;

      const updated = { ...prev };
      updated[draggedValue] = zone;
      return updated;
    });
    setDraggedValue(null);
  }

  // Check if all candidates placed in either 'correct' or 'incorrect'
  const allPlaced = Object.values(candidateState).length === candidates.length &&
    Object.values(candidateState).every(v => v === 'correct' || v === 'incorrect');

  // Check answer correctness
  function evaluateAnswer() {
    if (!allPlaced) return;

    const q = questions[currentQuestionIndex];
    const correctSet = new Set(q.correct);

    // All candidates must be placed correctly:
    // every candidate in 'correct' must be in correctSet
    // and every candidate in 'incorrect' must NOT in correctSet
    let isCorrect = true;
    for (const [numStr, zone] of Object.entries(candidateState)) {
      const num = +numStr;
      if (zone === 'correct' && !correctSet.has(num)) {
        isCorrect = false; break;
      }
      if (zone === 'incorrect' && correctSet.has(num)) {
        isCorrect = false; break;
      }
    }
    if (isCorrect) {
      setScore(prev => prev + pointsPerQuestion);
      setFeedback({ text: '👍 Jawaban benar! Kamu mendapatkan 10 poin.', type: 'correct' });
    } else {
      setFeedback({ text: '❌ Jawaban kurang tepat. Jangan menyerah, coba pada soal berikutnya ya!', type: 'incorrect' });
    }
    setSubmitted(true);
  }

  function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
    } else {
      // Jika ini soal terakhir, langsung arahkan ke halaman hasil
      setCurrentQuestionIndex(totalQuestions);
    }
  }

  function restartGame() {
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback({ text: '', type: '' });
    setSubmitted(false);
  }

  // Keyboard drag & drop simulation
  const [keyboardDragged, setKeyboardDragged] = useState(null);

  function onCandidateKeyDown(e, num) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!keyboardDragged) {
        setKeyboardDragged(num);
        setFeedback({ text: 'Gunakan Tab untuk pilih kotak faktor atau bukan faktor, lalu tekan Enter untuk menjatuhkan.', type: '' });
        dropzoneCorrectRef.current.focus();
      } else if (keyboardDragged === num) {
        // cancel drag
        setKeyboardDragged(null);
        setFeedback({ text: '', type: '' });
      }
    }
  }

  function handleDropzoneKeyDown(e, zone) {
    if (!keyboardDragged) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setCandidateState((prev) => {
        if (prev[keyboardDragged] === zone) return prev;
        const updated = { ...prev };
        updated[keyboardDragged] = zone;
        return updated;
      });
      setKeyboardDragged(null);
      setFeedback({ text: '', type: '' });
    }
  }

  // Get arrays for display based on candidateState
  const candidatesInCandidates = candidates.filter(n => candidateState[n] === 'candidates');
  const candidatesInCorrect = candidates.filter(n => candidateState[n] === 'correct');
  const candidatesInIncorrect = candidates.filter(n => candidateState[n] === 'incorrect');

  // Final Results?
  const isGameFinished = currentQuestionIndex >= totalQuestions;

  // Komponen untuk ditampilkan saat loading atau error
  if (currentQuestionIndex >= totalQuestions) {
    // Game selesai - tampilkan hasil
  } else if (!questions[currentQuestionIndex]) {
    // Handle kasus ketika questions[currentQuestionIndex] tidak ada
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px 20px',
        fontFamily: 'Nunito, sans-serif',
        color: '#1e506f'
      }}>
        <h2>Terjadi kesalahan saat memuat soal</h2>
        <p>Silakan coba refresh halaman ini atau kembali ke halaman kategori.</p>
        <button
          onClick={() => window.location.href = "/category4_bab1"}
          style={{
            background: 'linear-gradient(to bottom, #29a0e0, #1e87c2)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(31, 94, 120, 0.2)',
            marginTop: '20px'
          }}
        >
          Kembali ke Kategori
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
        }
        html {
          font-size: 18px;
        }
        body {
          margin: 0;
          background: linear-gradient(135deg, #f0f8ff 0%, #e6f0ff 100%);
          font-family: 'Nunito', sans-serif;
          color: #2a3d45;
          user-select: none;
          min-height: 100vh;
          overflow-y: auto;
        }
        .container {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          max-width: 840px;
          width: 100%;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(31, 94, 120, 0.15), 
                     0 5px 15px rgba(42, 125, 160, 0.1),
                     0 0 80px rgba(90, 164, 194, 0.07);
          padding: 40px 42px 60px;
          box-sizing: border-box;
          text-align: center;
          margin: 40px auto;
          overflow: visible;
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(200, 230, 255, 0.5) 0%, transparent 30%),
            radial-gradient(circle at 90% 90%, rgba(220, 240, 250, 0.7) 0%, transparent 30%);
        }
        .container:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #4ca5d0, #2c88bf, #1e6d9e);
          z-index: 10;
        }
        h1 {
          position: relative;
          font-weight: 800;
          font-size: 2.6rem;
          margin-bottom: 30px;
          color: #1a4971;
          text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.8);
          padding-bottom: 15px;
          letter-spacing: -0.02em;
        }
        h1:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #4ca5d0, transparent);
        }
        .progress {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #3d5a60;
          gap: 8px;
        }
        .progress-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 0 24px;
        }
        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d0e3f0;
          transition: all 0.3s ease;
        }
        .progress-dot.active {
          width: 14px;
          height: 14px;
          background: #3d99d6;
          box-shadow: 0 0 0 2px rgba(61, 153, 214, 0.3);
        }
        .progress-dot.completed {
          background: #22c55e;
        }
        .scoreboard {
          position: relative;
          font-weight: 800;
          font-size: 1.5rem;
          margin: 10px 0 30px 0;
          color: #1e6d9e;
          text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 10px 30px;
          border-radius: 50px;
          background: linear-gradient(to bottom, rgba(240, 249, 255, 0.9), rgba(214, 240, 253, 0.6));
          box-shadow: 0 3px 10px rgba(31, 94, 120, 0.1), 
                     0 1px 3px rgba(0, 0, 0, 0.05),
                     inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        .scoreboard .bee-icon {
          font-size: 1.2rem;
          display: inline-block;
          margin: 0 6px;
          transform: translateY(1px);
        }
        .question-text {
          position: relative;
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 42px;
          color: #1e506f;
          padding: 15px 25px;
          border-radius: 16px;
          background: rgba(220, 240, 255, 0.5);
          box-shadow: 0 3px 8px rgba(42, 125, 160, 0.1);
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .question-text strong {
          color: #1766a5;
          font-size: 110%;
          padding: 0 4px;
        }
        .candidates-container {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          margin-bottom: 50px;
          min-height: 80px;
          perspective: 1000px;
        }
        .candidate {
          background: linear-gradient(to bottom, #bbdefb, #90caf9);
          color: #09407e;
          font-weight: 700;
          font-size: 1.5rem;
          border-radius: 16px;
          padding: 12px 28px;
          user-select: none;
          cursor: grab;
          box-shadow: 0 4px 10px rgba(30, 129, 176, 0.2),
                     0 2px 4px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.6);
          transition:
            transform 0.2s ease,
            background-color 0.3s ease,
            box-shadow 0.3s ease;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-width: 70px;
          z-index: 5;
          animation: candidateAppear 0.4s backwards;
          position: relative;
          overflow: hidden;
          transform-style: preserve-3d;
        }
        .candidate:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent);
          border-radius: 16px 16px 0 0;
        }
        .candidate:nth-child(1) { animation-delay: 0.05s; }
        .candidate:nth-child(2) { animation-delay: 0.1s; }
        .candidate:nth-child(3) { animation-delay: 0.15s; }
        .candidate:nth-child(4) { animation-delay: 0.2s; }
        .candidate:nth-child(5) { animation-delay: 0.25s; }
        .candidate:nth-child(6) { animation-delay: 0.3s; }
        .candidate:nth-child(7) { animation-delay: 0.35s; }
        .candidate:nth-child(8) { animation-delay: 0.4s; }
        .candidate:nth-child(9) { animation-delay: 0.45s; }
        .candidate:nth-child(10) { animation-delay: 0.5s; }
        
        @keyframes candidateAppear {
          0% { opacity: 0; transform: scale(0.8) translateY(20px) rotateX(15deg); }
          70% { opacity: 1; transform: scale(1.05) translateY(-5px) rotateX(-5deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotateX(0); }
        }
        
        .candidate:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 15px rgba(30, 129, 176, 0.3),
                     0 4px 6px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.8);
          background: linear-gradient(to bottom, #c5e4ff, #a5d6fa);
        }
        .candidate:active {
          transform: translateY(0);
          box-shadow: 0 2px 5px rgba(30, 129, 176, 0.2),
                     0 1px 3px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.6);
          background: linear-gradient(to bottom, #90caf9, #64b5f6);
        }
        .candidate.dragging {
          animation: wiggle 0.8s infinite ease;
          opacity: 0.8;
          transform: scale(1.1);
          box-shadow: 0 15px 25px rgba(30, 129, 176, 0.25),
                     0 5px 10px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.8);
          background: linear-gradient(to bottom, #c5e4ff, #a5d6fa);
          z-index: 100;
        }
        @keyframes wiggle {
          0%, 100% { transform: scale(1.1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-1deg); }
          75% { transform: scale(1.1) rotate(1deg); }
        }
        .candidate:focus-visible {
          outline: 3px solid #1976d2;
          outline-offset: 3px;
          background: linear-gradient(to bottom, #c5e4ff, #a5d6fa);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(30, 129, 176, 0.25),
                     0 3px 5px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.8);
        }
        .dropzones {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 48px;
          user-select: none;
          perspective: 1000px;
        }
        .dropzone {
          flex: 1 1 280px;
          min-height: 180px;
          background: linear-gradient(165deg, rgba(240, 249, 255, 0.9), rgba(214, 240, 253, 0.7));
          border: 3px dashed #7dbde7;
          border-radius: 24px;
          padding: 25px 20px 20px;
          box-sizing: border-box;
          user-select: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #11698e;
          transition: all 0.3s ease;
          outline-offset: 3px;
          box-shadow: 0 6px 15px rgba(31, 94, 120, 0.08);
          transform-style: preserve-3d;
          animation: dropzoneAppear 0.6s backwards;
        }
        .dropzone:nth-child(1) { animation-delay: 0.2s; }
        .dropzone:nth-child(2) { animation-delay: 0.3s; }
        
        @keyframes dropzoneAppear {
          0% { opacity: 0; transform: translateY(20px) rotateX(5deg); }
          100% { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        
        .dropzone.highlight, .dropzone:focus-visible {
          background: linear-gradient(165deg, rgba(226, 246, 255, 0.95), rgba(194, 231, 252, 0.85));
          border-color: #3d99d6;
          border-width: 3px;
          border-style: dashed;
          box-shadow: 0 0 0 6px rgba(61, 153, 214, 0.1),
                     0 10px 25px rgba(31, 94, 120, 0.15);
          transform: translateY(-4px);
        }
        .dropzone:focus-visible {
          outline: 3px solid #1976d2;
        }
        .dropzone h3 {
          margin: 0 0 22px 0;
          font-weight: 800;
          color: #0c3d57;
          font-size: 1.5rem;
          letter-spacing: 0.02em;
          text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
          position: relative;
          display: inline-block;
        }
        .dropzone h3:after {
          content: "";
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(12, 61, 87, 0.3), transparent);
        }
        .dropzone .items {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          min-height: 90px;
          width: 100%;
          padding: 10px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 2px 6px rgba(31, 94, 120, 0.1);
        }
        .dropzone .items .candidate {
          cursor: default;
          margin: 0;
          background: linear-gradient(to bottom, #7ac0f1, #5ba4da);
          color: #05305c;
          box-shadow: 0 3px 8px rgba(30, 129, 176, 0.15),
                     inset 0 1px 1px rgba(255, 255, 255, 0.5);
          padding: 8px 22px;
          font-weight: 700;
          min-width: 50px;
          user-select: none;
          animation: dropItemAppear 0.35s backwards;
        }
        
        @keyframes dropItemAppear {
          0% { opacity: 0; transform: scale(0.7); }
          70% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .button-group {
          margin-top: 48px;
          display: flex;
          justify-content: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        button {
          background: linear-gradient(to bottom, #29a0e0, #1e87c2);
          color: white;
          border: none;
          padding: 14px 44px;
          font-size: 1.3rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(31, 94, 120, 0.3),
                     0 3px 5px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.3);
          transition: all 0.25s ease;
          user-select: none;
          position: relative;
          overflow: hidden;
        }
        button.home-button {
          background: linear-gradient(to bottom, #4CAF50, #388E3C);
        }
        button.home-button:hover:not([disabled]) {
          background: linear-gradient(to bottom, #388E3C, #2E7D32);
          box-shadow: 0 7px 18px rgba(46, 125, 50, 0.35),
                     0 4px 6px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }
        button.home-button:active:not([disabled]) {
          background: linear-gradient(to bottom, #2E7D32, #1B5E20);
        }
        button[disabled] {
          background: linear-gradient(to bottom, #90c4de, #80b7d3);
          cursor: not-allowed;
          box-shadow: 0 2px 5px rgba(31, 94, 120, 0.1);
          transform: none !important;
        }
        button:hover:not([disabled]) {
          background: linear-gradient(to bottom, #1e8ccc, #1774ae);
          box-shadow: 0 7px 18px rgba(31, 94, 120, 0.35),
                     0 4px 6px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.3);
          transform: translateY(-3px);
        }
        button:active:not([disabled]) {
          transform: translateY(0);
          box-shadow: 0 3px 8px rgba(31, 94, 120, 0.2),
                     0 2px 4px rgba(0, 0, 0, 0.1),
                     inset 0 1px 1px rgba(255, 255, 255, 0.3);
          background: linear-gradient(to bottom, #1774ae, #156699);
        }
        button:focus-visible {
          outline: 3px solid #1496bb;
          outline-offset: 3px;
        }
        .feedback {
          margin-top: 36px;
          font-size: 1.5rem;
          font-weight: 700;
          min-height: 44px;
          user-select: none;
          animation: feedbackAppear 0.5s ease-out;
          padding: 12px 20px;
          border-radius: 10px;
        }
        @keyframes feedbackAppear {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .feedback.correct {
          color: #22c55e;
          text-shadow: 0 0 15px rgba(22, 163, 74, 0.5);
          animation: pulseGreen 1.5s infinite ease-in-out, feedbackAppear 0.5s ease-out;
          background-color: rgba(34, 197, 94, 0.1);
        }
        .feedback.incorrect {
          color: white;
          text-shadow: 0 0 12px rgba(185, 28, 28, 0.5);
          animation: pulseRed 1.5s infinite ease-in-out, feedbackAppear 0.5s ease-out;
          background-color: #ef4444;
          border: 2px solid #b91c1c;
          box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
        }
        @keyframes pulseGreen {
          0%, 100% { text-shadow: 0 0 15px rgba(22, 163, 74, 0.5); }
          50% { text-shadow: 0 0 32px rgba(34, 197, 94, 0.7); }
        }
        @keyframes pulseRed {
          0%, 100% { text-shadow: 0 0 12px rgba(255, 255, 255, 0.5); }
          50% { text-shadow: 0 0 28px rgba(255, 255, 255, 0.7); }
        }
        
        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 20px;
          background: #ffd700;
          top: 0;
          opacity: 0;
        }
        
        .results-container {
          animation: resultsAppear 0.8s ease-out;
        }
        @keyframes resultsAppear {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .result-emoji {
          font-size: 5rem;
          margin: 0 0 20px;
          animation: emojiPop 1s ease-out;
        }
        @keyframes emojiPop {
          0% { opacity: 0; transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Responsive tweaks */
        @media (max-width: 760px) {
          html {
            font-size: 16px;
            height: 100%;
          }
          body {
            min-height: 100%;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .container {
            padding: 30px 20px 40px;
            margin: 20px auto;
            border-radius: 20px;
            overflow: visible;
          }
          h1 {
            font-size: 2.2rem;
          }
          .dropzones {
            flex-direction: column;
            gap: 30px;
            align-items: center;
          }
          .dropzone {
            width: 100%;
            max-width: 320px;
          }
          .button-group {
            gap: 16px;
          }
          button {
            padding: 12px 32px;
            font-size: 1.2rem;
          }
          .candidate {
            font-size: 1.3rem;
            padding: 10px 22px;
          }
        }
      `}</style>

      <div className="container" role="main" aria-live="polite" aria-label="Game Faktor dan Kelipatan, ramah untuk anak berkebutuhan khusus">
        <h1>Game Faktor dan Kelipatan</h1>
        {!isGameFinished &&
          <>
            <div className="progress" aria-live="polite" aria-atomic="true">
              Soal {currentQuestionIndex + 1} dari {totalQuestions}
            </div>
            <div className="progress-dots" aria-hidden="true">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <div
                  key={index}
                  className={`progress-dot ${index === currentQuestionIndex ? 'active' : ''} ${index < currentQuestionIndex ? 'completed' : ''}`}
                ></div>
              ))}
            </div>
            <p className="scoreboard" aria-live="polite" aria-atomic="true">
              <span className="bee-icon" aria-hidden="true">🐝</span>
              Skor: {score}
              <span className="bee-icon" aria-hidden="true">🐝</span>
            </p>
            <p className="question-text" tabIndex={0}>
              Pilih dan seret angka yang merupakan <strong>{questions[currentQuestionIndex].type === 'faktor' ? 'faktor' : 'kelipatan'}</strong> dari <strong>{questions[currentQuestionIndex].number}</strong>
            </p>

            <section
              aria-label="Daftar angka yang dapat diseret"
              className="candidates-container"
              tabIndex={0}
              aria-describedby="descCandidates"
            >
              <p id="descCandidates" className="sr-only">
                Daftar angka yang dapat diseret ke area Faktor atau Bukan Faktor
              </p>
              {candidatesInCandidates.map((num, idx) => (
                <div
                  key={num}
                  className={"candidate" + (draggedValue === num ? " dragging" : "")}
                  draggable={!submitted}
                  tabIndex={0}
                  role="option"
                  aria-grabbed={draggedValue === num}
                  onDragStart={e => handleDragStart(e, num)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={e => onCandidateKeyDown(e, num)}
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  {num}
                </div>
              ))}
            </section>

            <section className="dropzones" aria-label="Tempat meletakkan angka">
              <div
                className="dropzone"
                ref={dropzoneCorrectRef}
                aria-dropeffect="move"
                aria-label={questions[currentQuestionIndex].type === 'faktor' ? 'Kotak faktor' : 'Kotak kelipatan'}
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('highlight'); }}
                onDragLeave={(e) => e.currentTarget.classList.remove('highlight')}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('highlight'); handleDrop('correct'); }}
                onKeyDown={(e) => handleDropzoneKeyDown(e, 'correct')}
              >
                <h3>{questions[currentQuestionIndex].type === 'faktor' ? 'Faktor' : 'Kelipatan'}</h3>
                <div className="items" aria-live="polite" aria-relevant="additions">
                  {candidatesInCorrect.map((num, idx) => (
                    <div
                      key={num}
                      className="candidate"
                      tabIndex={-1}
                      aria-grabbed="false"
                      role="option"
                      style={{ animationDelay: `${0.05 * idx}s` }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="dropzone"
                ref={dropzoneIncorrectRef}
                aria-dropeffect="move"
                aria-label={questions[currentQuestionIndex].type === 'faktor' ? 'Kotak bukan faktor' : 'Kotak bukan kelipatan'}
                tabIndex={0}
                onDragOver={handleDragOver}
                onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('highlight'); }}
                onDragLeave={(e) => e.currentTarget.classList.remove('highlight')}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('highlight'); handleDrop('incorrect'); }}
                onKeyDown={(e) => handleDropzoneKeyDown(e, 'incorrect')}
              >
                <h3>{questions[currentQuestionIndex].type === 'faktor' ? 'Bukan Faktor' : 'Bukan Kelipatan'}</h3>
                <div className="items" aria-live="polite" aria-relevant="additions">
                  {candidatesInIncorrect.map((num, idx) => (
                    <div
                      key={num}
                      className="candidate"
                      tabIndex={-1}
                      aria-grabbed="false"
                      role="option"
                      style={{ animationDelay: `${0.05 * idx}s` }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="button-group">
              <button
                onClick={evaluateAnswer}
                disabled={!allPlaced || submitted}
                aria-disabled={!allPlaced || submitted}
                aria-label="Kirim jawaban"
                type="button"
              >
                Kirim
              </button>
              <button
                onClick={nextQuestion}
                style={{ display: submitted ? 'inline-block' : 'none' }}
                aria-label="Soal berikutnya"
                type="button"
              >
                Soal Berikutnya
              </button>
            </div>
          </>
        }
        {isGameFinished &&
          <div className="results-container">
            <div className="result-emoji" aria-hidden="true">
              {score === totalQuestions * pointsPerQuestion ? '🎉' :
                score >= totalQuestions * pointsPerQuestion * 0.7 ? '👍' : '😊'}
            </div>
            <div className="progress" aria-live="polite" aria-atomic="true">
              Kamu sudah menyelesaikan semua soal!
            </div>
            <p className="scoreboard" aria-live="polite" aria-atomic="true" style={{
              color: score === totalQuestions * pointsPerQuestion ? '#22c55e' :
                score >= totalQuestions * pointsPerQuestion * 0.7 ? '#0e7490' : '#ef4444',
              textShadow: score === totalQuestions * pointsPerQuestion ? '0 0 20px rgba(22, 163, 74, 0.4), 0 0 30px rgba(34, 197, 94, 0.3)' :
                score >= totalQuestions * pointsPerQuestion * 0.7 ? '0 0 18px rgba(21, 94, 117, 0.4)' : '0 0 15px rgba(185, 28, 28, 0.3)',
              fontSize: '1.7rem',
              padding: '15px 40px'
            }}>
              <span className="bee-icon" aria-hidden="true">🐝</span>
              Skor akhir kamu: {score} dari {totalQuestions * pointsPerQuestion} poin
              <span className="bee-icon" aria-hidden="true">🐝</span>
            </p>
            <p className="feedback" role="alert" aria-live="assertive" style={{ fontSize: '1.6rem' }}>
              {score === totalQuestions * pointsPerQuestion
                ? '🌟 Nilai sempurna! Hebat sekali! 🌟'
                : score >= totalQuestions * pointsPerQuestion * 0.7
                  ? '👍 Bagus! Tetap semangat belajar!'
                  : '😊 Terus berlatih ya!'}
            </p>
            <div className="button-group">
              <button onClick={restartGame} aria-label="Main lagi" type="button">Main Lagi</button>
              <button
                className="home-button"
                onClick={() => window.location.href = "/category4_bab1"}
                aria-label="Kembali ke halaman kategori"
                type="button"
              >
                Kembali ke Kategori
              </button>
            </div>
          </div>
        }
        {feedback.text && !isGameFinished && (
          <p className={`feedback ${feedback.type}`} role="alert" aria-live="assertive" style={{ marginTop: '36px' }}>
            {feedback.type === 'incorrect' ? <span style={{ marginRight: '10px' }}>❌</span> : ''}
            {feedback.text}
          </p>
        )}
      </div>
    </>
  );
}
