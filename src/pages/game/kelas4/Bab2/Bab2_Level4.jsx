import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../../context/AuthContext";
import { saveGameProgress } from "../../../../services/gameProgressService";

const pairsInitial = [
  { decimal: "0,25", percent: "25%" },
  { decimal: "0,1", percent: "10%" },
  { decimal: "0,75", percent: "75%" },
  { decimal: "0,03", percent: "3%" },
  { decimal: "0,5", percent: "50%" },
  { decimal: "0,09", percent: "9%" },
  { decimal: "0,40", percent: "40%" },
  { decimal: "0,01", percent: "1%" },
  { decimal: "0,60", percent: "60%" },
  { decimal: "0,90", percent: "90%" }
];

// Shuffle helper function
const shuffleArray = (array) => {
  const arr = array.slice();
  for(let i = arr.length -1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
};

const MatchingGameDecimalPercent = () => {
  const [pairs, setPairs] = useState(pairsInitial);
  const [draggables, setDraggables] = useState([]);
  const [dropzones, setDropzones] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  // track dragged element id using ref to avoid stale closures for drag events
  const draggedIdRef = useRef(null);
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
      level: 4,
      jenis_permainan: "Pecahan Desimal dan Persen",
      skor: score,
      skor_maksimal: pairsInitial.length,
      status_selesai: gameOver,
      detail_jawaban: {
        jawaban: [
          {
            total_benar: score,
            total_soal: pairsInitial.length
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

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    // shuffle decimals and percents separately
    let decimals = shuffleArray(pairsInitial.map(p => p.decimal));
    let percents = shuffleArray(pairsInitial.map(p => p.percent));
    setDraggables(decimals);
    setDropzones(percents.map(p => ({ percent: p, status: 'empty' })));
  };

  // Drag Handlers
  const onDragStart = (e, id) => {
    draggedIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e, dropPercent) => {
    e.preventDefault();
    let draggedDecimal = draggedIdRef.current;
    if(!draggedDecimal) return;

    // Check if correct match
    const match = pairsInitial.find(p => p.decimal === draggedDecimal && p.percent === dropPercent);
    if(match) {
      // Mark dropzone as correct and remove draggable
      setDropzones(prev => prev.map(dz => dz.percent === dropPercent ? {...dz, status: 'correct'} : dz));
      setDraggables(prev => prev.filter(d => d !== draggedDecimal));
      setScore(prev => {
        const newScore = prev + 1;
        if(newScore === pairsInitial.length) {
          setGameOver(true);
        }
        return newScore;
      });
    } else {
      // Mark incorrect briefly: we can do a temporary highlight with a timeout
      setDropzones(prev => prev.map(dz => {
        if(dz.percent === dropPercent) return {...dz, status: 'incorrect'};
        return dz;
      }));
      setTimeout(() => {
        setDropzones(prev => prev.map(dz => {
          if(dz.percent === dropPercent) return {...dz, status: 'empty'};
          return dz;
        }));
      }, 1000);
    }
    draggedIdRef.current = null;
  };

  const onDragEnd = () => {
    draggedIdRef.current = null;
  };

  return (
    <div style={{
      fontFamily: "'Baloo 2', cursive",
      background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 30,
      color: '#222'
    }}>
      <h1 style={{
        color: '#FF6F61',
        textShadow: '1px 1px 2px #d86052',
        marginBottom: 10,
        userSelect: 'none'
      }}>
        Game Cocokkan Pecahan Desimal & Persen
      </h1>
      <div style={{
        color: '#1c3c72',
        marginBottom: 30,
        fontWeight: 600,
        userSelect: 'none',
        fontSize: 18,
        textAlign: 'center',
        maxWidth: 600
      }}>
        Seret pecahan desimal ke persen yang tepat!
      </div>
      <div style={{
        maxWidth: 600,
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 12px 25px rgba(0,0,0,0.18)',
        padding: 30,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        userSelect: 'none'
      }}>
        <div style={{width: '45%', display: 'flex', flexDirection: 'column', gap: 15}}>
          <h2 style={{marginBottom: 15, color: '#205072', fontWeight: 700}}>Pecahan Desimal</h2>
          {draggables.length === 0 && !gameOver && <div style={{fontSize:16, color:'#888'}}>Tidak ada pecahan tersisa.</div>}
          {draggables.map(dec => (
            <div
              key={dec}
              draggable={!gameOver}
              onDragStart={e => onDragStart(e, dec)}
              onDragEnd={onDragEnd}
              tabIndex={0}
              role="option"
              aria-grabbed="false"
              style={{
                backgroundColor: '#FFBC42',
                borderRadius: 12,
                padding: '15px 20px',
                fontSize: 20,
                textAlign: 'center',
                boxShadow: '0 6px 12px rgba(255, 188, 66, 0.6)',
                cursor: gameOver ? 'default' : 'grab',
                userSelect: 'none'
              }}
              onKeyDown={(e) => {
                if (gameOver) return;
                if(e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  draggedIdRef.current = dec;
                }
              }}
            >
              {dec}
            </div>
          ))}
        </div>
        <div style={{width: '45%', display: 'flex', flexDirection: 'column', gap: 15}}>
          <h2 style={{marginBottom: 15, color: '#205072', fontWeight: 700}}>Persen</h2>
          {dropzones.map(dz => (
            <div
              key={dz.percent}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, dz.percent)}
              tabIndex={0}
              role="listitem"
              aria-dropeffect="move"
              onKeyDown={e => {
                if((e.key === 'Enter' || e.key === ' ') && draggedIdRef.current) {
                  onDrop(e, dz.percent);
                }
              }}
              style={{
                backgroundColor:
                  dz.status === 'correct' ? '#55efc4' :
                  dz.status === 'incorrect' ? '#ff7675' :
                  '#dfe6e9',
                boxShadow:
                  dz.status === 'correct' ? '0 0 14px #00b894' :
                  dz.status === 'incorrect' ? '0 0 14px #d63031' :
                  'inset 0 0 8px #b2bec3',
                color:
                  dz.status === 'correct' ? '#056952' :
                  dz.status === 'incorrect' ? '#6e1500' :
                  '#222',
                fontWeight: dz.status === 'correct' || dz.status === 'incorrect' ? 700 : 400,
                minHeight: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                fontSize: 20,
                userSelect: 'none',
                cursor: 'default',
                transition: 'background-color 0.3s ease'
              }}
            >
              {dz.percent} {dz.status === 'correct' ? '✔️' : dz.status === 'incorrect' ? '✘' : ''}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        marginTop: 25,
        fontSize: 24,
        fontWeight: 700,
        color: '#FF6F61',
        userSelect: 'none'
      }}>
        Cocokkan yang benar: {score} dari {pairsInitial.length}
      </div>
      {gameOver && (
        <button
          onClick={() => resetGame()}
          style={{
            marginTop: 20,
            backgroundColor: '#FF6F61',
            padding: '12px 30px',
            border: 'none',
            borderRadius: 25,
            color: 'white',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(255,111,97,0.7)',
            userSelect: 'none'
          }}
        >
          Main Lagi
        </button>
      )}

      <button
        onClick={() => navigate('/category4_bab2')}
        style={{
          marginTop: 15,
          backgroundColor: '#3498db',
          padding: '12px 30px',
          border: 'none',
          borderRadius: 25,
          color: 'white',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(52,152,219,0.7)',
          userSelect: 'none'
        }}
      >
        Kembali ke Kategori
      </button>
    </div>
  );
};

export default MatchingGameDecimalPercent;

