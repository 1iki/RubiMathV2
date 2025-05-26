import{b as J,r as s,j as a}from"./vendor-BjgPdEnQ.js";import{u as V}from"./game-DMqPqpoE.js";import{m as H}from"./guru-D7H-5Pkh.js";/* empty css               */function te(){const{user:k}=V(),S=J(),[i,K]=s.useState(0),[y,W]=s.useState(!1);s.useEffect(()=>{k||S("/login")},[k,S]);const T=async()=>{if(!k)return;const e={kelas:4,bab:1,level:4,jenis_permainan:"Game Faktor dan Kelipatan",skor:i,skor_maksimal:d.length*l,status_selesai:y,detail_jawaban:{jawaban:[{total_benar:i/l,total_soal:d.length}]}};await H(e)};s.useEffect(()=>{(i>0||y)&&T()},[i,y]);const d=[{number:12,type:"faktor",cand:[1,2,3,4,5,6,7,8,9,12],correct:[1,2,3,4,6,12]},{number:5,type:"kelipatan",cand:[2,5,8,10,12,15,20],correct:[5,10,15,20]},{number:18,type:"faktor",cand:[1,2,3,4,6,9,12,18,24],correct:[1,2,3,6,9,12,18]},{number:3,type:"kelipatan",cand:[1,3,5,6,9,11,12,15,18,21,24,27,30],correct:[3,6,9,12,15,18,21,24,27,30]},{number:20,type:"faktor",cand:[1,2,4,5,7,10,15,20,40],correct:[1,2,4,5,10,20]},{number:4,type:"kelipatan",cand:[2,4,8,9,12,14,16,20,24],correct:[4,8,12,16,20,24]},{number:7,type:"faktor",cand:[1,5,7,14,21,28],correct:[1,7]},{number:10,type:"kelipatan",cand:[5,10,20,25,30,35,40,50],correct:[10,20,30,40,50]},{number:15,type:"faktor",cand:[1,3,5,6,9,10,15,20],correct:[1,3,5,15]},{number:2,type:"kelipatan",cand:[2,3,4,5,6,7,8,10,12,14,15,16,18,20],correct:[2,4,6,8,10,12,14,16,18,20]}],o=d.length,l=10,[n,w]=s.useState(0),[u,G]=s.useState([]),[x,v]=s.useState({}),[f,c]=s.useState({text:"",type:""}),[m,j]=s.useState(!1),[b,h]=s.useState(null),A=s.useRef(null),R=s.useRef(null);function L(e){let t=e.slice();for(let r=t.length-1;r>0;r--){const p=Math.floor(Math.random()*(r+1));[t[r],t[p]]=[t[p],t[r]]}return t}s.useEffect(()=>{if(n<o&&d[n]){let e=d[n],t=L(e.cand);G(t);const r={};t.forEach(p=>{r[p]="candidates"}),v(r),c({text:"",type:""}),j(!1),h(null)}},[n]);function _(e,t){h(t),e.dataTransfer.effectAllowed="move"}function O(){h(null)}function C(e){e.preventDefault()}function E(e){b!==null&&(v(t=>{if(t[b]===e)return t;const r={...t};return r[b]=e,r}),h(null))}const z=Object.values(x).length===u.length&&Object.values(x).every(e=>e==="correct"||e==="incorrect");function P(){if(!z)return;const e=d[n],t=new Set(e.correct);let r=!0;for(const[p,Y]of Object.entries(x)){const F=+p;if(Y==="correct"&&!t.has(F)){r=!1;break}if(Y==="incorrect"&&t.has(F)){r=!1;break}}r?(K(p=>p+l),c({text:"👍 Jawaban benar! Kamu mendapatkan 10 poin.",type:"correct"})):c({text:"❌ Jawaban kurang tepat. Jangan menyerah, coba pada soal berikutnya ya!",type:"incorrect"}),j(!0)}function B(){n<o-1?w(e=>e+1):w(o)}function Q(){w(0),K(0),c({text:"",type:""}),j(!1)}const[g,D]=s.useState(null);function X(e,t){(e.key===" "||e.key==="Enter")&&(e.preventDefault(),g?g===t&&(D(null),c({text:"",type:""})):(D(t),c({text:"Gunakan Tab untuk pilih kotak faktor atau bukan faktor, lalu tekan Enter untuk menjatuhkan.",type:""}),A.current.focus()))}function I(e,t){g&&(e.key===" "||e.key==="Enter")&&(e.preventDefault(),v(r=>{if(r[g]===t)return r;const p={...r};return p[g]=t,p}),D(null),c({text:"",type:""}))}const $=u.filter(e=>x[e]==="candidates"),q=u.filter(e=>x[e]==="correct"),M=u.filter(e=>x[e]==="incorrect"),N=n>=o;if(!(n>=o)){if(!d[n])return a.jsxs("div",{style:{textAlign:"center",padding:"50px 20px",fontFamily:"Nunito, sans-serif",color:"#1e506f"},children:[a.jsx("h2",{children:"Terjadi kesalahan saat memuat soal"}),a.jsx("p",{children:"Silakan coba refresh halaman ini atau kembali ke halaman kategori."}),a.jsx("button",{onClick:()=>window.location.href="/category4_bab1",style:{background:"linear-gradient(to bottom, #29a0e0, #1e87c2)",color:"white",border:"none",padding:"12px 30px",borderRadius:"50px",fontSize:"1rem",fontWeight:"bold",cursor:"pointer",boxShadow:"0 3px 10px rgba(31, 94, 120, 0.2)",marginTop:"20px"},children:"Kembali ke Kategori"})]})}return a.jsxs(a.Fragment,{children:[a.jsx("style",{children:`
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
      `}),a.jsxs("div",{className:"container",role:"main","aria-live":"polite","aria-label":"Game Faktor dan Kelipatan, ramah untuk anak berkebutuhan khusus",children:[a.jsx("h1",{children:"Game Faktor dan Kelipatan"}),!N&&a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:"progress","aria-live":"polite","aria-atomic":"true",children:["Soal ",n+1," dari ",o]}),a.jsx("div",{className:"progress-dots","aria-hidden":"true",children:Array.from({length:o}).map((e,t)=>a.jsx("div",{className:`progress-dot ${t===n?"active":""} ${t<n?"completed":""}`},t))}),a.jsxs("p",{className:"scoreboard","aria-live":"polite","aria-atomic":"true",children:[a.jsx("span",{className:"bee-icon","aria-hidden":"true",children:"🐝"}),"Skor: ",i,a.jsx("span",{className:"bee-icon","aria-hidden":"true",children:"🐝"})]}),a.jsxs("p",{className:"question-text",tabIndex:0,children:["Pilih dan seret angka yang merupakan ",a.jsx("strong",{children:d[n].type==="faktor"?"faktor":"kelipatan"})," dari ",a.jsx("strong",{children:d[n].number})]}),a.jsxs("section",{"aria-label":"Daftar angka yang dapat diseret",className:"candidates-container",tabIndex:0,"aria-describedby":"descCandidates",children:[a.jsx("p",{id:"descCandidates",className:"sr-only",children:"Daftar angka yang dapat diseret ke area Faktor atau Bukan Faktor"}),$.map((e,t)=>a.jsx("div",{className:"candidate"+(b===e?" dragging":""),draggable:!m,tabIndex:0,role:"option","aria-grabbed":b===e,onDragStart:r=>_(r,e),onDragEnd:O,onKeyDown:r=>X(r,e),style:{animationDelay:`${.05*t}s`},children:e},e))]}),a.jsxs("section",{className:"dropzones","aria-label":"Tempat meletakkan angka",children:[a.jsxs("div",{className:"dropzone",ref:A,"aria-dropeffect":"move","aria-label":d[n].type==="faktor"?"Kotak faktor":"Kotak kelipatan",tabIndex:0,onDragOver:C,onDragEnter:e=>{e.preventDefault(),e.currentTarget.classList.add("highlight")},onDragLeave:e=>e.currentTarget.classList.remove("highlight"),onDrop:e=>{e.preventDefault(),e.currentTarget.classList.remove("highlight"),E("correct")},onKeyDown:e=>I(e,"correct"),children:[a.jsx("h3",{children:d[n].type==="faktor"?"Faktor":"Kelipatan"}),a.jsx("div",{className:"items","aria-live":"polite","aria-relevant":"additions",children:q.map((e,t)=>a.jsx("div",{className:"candidate",tabIndex:-1,"aria-grabbed":"false",role:"option",style:{animationDelay:`${.05*t}s`},children:e},e))})]}),a.jsxs("div",{className:"dropzone",ref:R,"aria-dropeffect":"move","aria-label":d[n].type==="faktor"?"Kotak bukan faktor":"Kotak bukan kelipatan",tabIndex:0,onDragOver:C,onDragEnter:e=>{e.preventDefault(),e.currentTarget.classList.add("highlight")},onDragLeave:e=>e.currentTarget.classList.remove("highlight"),onDrop:e=>{e.preventDefault(),e.currentTarget.classList.remove("highlight"),E("incorrect")},onKeyDown:e=>I(e,"incorrect"),children:[a.jsx("h3",{children:d[n].type==="faktor"?"Bukan Faktor":"Bukan Kelipatan"}),a.jsx("div",{className:"items","aria-live":"polite","aria-relevant":"additions",children:M.map((e,t)=>a.jsx("div",{className:"candidate",tabIndex:-1,"aria-grabbed":"false",role:"option",style:{animationDelay:`${.05*t}s`},children:e},e))})]})]}),a.jsxs("div",{className:"button-group",children:[a.jsx("button",{onClick:P,disabled:!z||m,"aria-disabled":!z||m,"aria-label":"Kirim jawaban",type:"button",children:"Kirim"}),a.jsx("button",{onClick:B,style:{display:m?"inline-block":"none"},"aria-label":"Soal berikutnya",type:"button",children:"Soal Berikutnya"})]})]}),N&&a.jsxs("div",{className:"results-container",children:[a.jsx("div",{className:"result-emoji","aria-hidden":"true",children:i===o*l?"🎉":i>=o*l*.7?"👍":"😊"}),a.jsx("div",{className:"progress","aria-live":"polite","aria-atomic":"true",children:"Kamu sudah menyelesaikan semua soal!"}),a.jsxs("p",{className:"scoreboard","aria-live":"polite","aria-atomic":"true",style:{color:i===o*l?"#22c55e":i>=o*l*.7?"#0e7490":"#ef4444",textShadow:i===o*l?"0 0 20px rgba(22, 163, 74, 0.4), 0 0 30px rgba(34, 197, 94, 0.3)":i>=o*l*.7?"0 0 18px rgba(21, 94, 117, 0.4)":"0 0 15px rgba(185, 28, 28, 0.3)",fontSize:"1.7rem",padding:"15px 40px"},children:[a.jsx("span",{className:"bee-icon","aria-hidden":"true",children:"🐝"}),"Skor akhir kamu: ",i," dari ",o*l," poin",a.jsx("span",{className:"bee-icon","aria-hidden":"true",children:"🐝"})]}),a.jsx("p",{className:"feedback",role:"alert","aria-live":"assertive",style:{fontSize:"1.6rem"},children:i===o*l?"🌟 Nilai sempurna! Hebat sekali! 🌟":i>=o*l*.7?"👍 Bagus! Tetap semangat belajar!":"😊 Terus berlatih ya!"}),a.jsxs("div",{className:"button-group",children:[a.jsx("button",{onClick:Q,"aria-label":"Main lagi",type:"button",children:"Main Lagi"}),a.jsx("button",{className:"home-button",onClick:()=>window.location.href="/category4_bab1","aria-label":"Kembali ke halaman kategori",type:"button",children:"Kembali ke Kategori"})]})]}),f.text&&!N&&a.jsxs("p",{className:`feedback ${f.type}`,role:"alert","aria-live":"assertive",style:{marginTop:"36px"},children:[f.type==="incorrect"?a.jsx("span",{style:{marginRight:"10px"},children:"❌"}):"",f.text]})]})]})}export{te as default};
