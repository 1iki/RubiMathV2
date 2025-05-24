import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../App.css";
import background from "../assets/forest.jpg";
import logo from "../assets/logo.png";
import iconSiswa from "../assets/icon_murid.PNG";
import iconGuru from "../assets/icon_guru.png";
import iconOrtu from "../assets/icon_wali.png";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleStartClick = () => {
    setShowRoleSelection(true);
  };

  const handleRoleSelect = (role) => {
    // Simpan role yang dipilih di localStorage
    localStorage.setItem("selectedRole", role);

    // Navigasi ke halaman login
    navigate("/login");
  };

  const handleAdminLoginClick = () => {
    setShowAdminLogin(false);
    localStorage.setItem("selectedRole", "admin");
    navigate("/login");
  };

  return (
    <div
      className="main-container"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="overlay">

          <img src={logo} alt="Logo" className="logo" />
          <button
            className="admin-login-button"
            onClick={() => setShowAdminLogin(true)}
          >
            Admin
          </button>


        <main className="content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="main-title"
            style={{ color: "white" }}
          >
            Siap Jadi Jagoan Matematika?
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="subtitle"
          >
            Ayo Temani Rubi Berhitung!
          </motion.h2>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="book-button"
            onClick={handleStartClick}
          >
            MULAI SEKARANG
          </motion.button>
        </main>
      </div>

      {/* Pop-up Pemilihan Role */}
      {showRoleSelection && (
        <div className="popup-overlay">
          <motion.div
            className="popup role-selection-popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Pilih Peran Kamu</h2>
            <div className="role-buttons">
              <button
                className="role-button role-siswa"
                onClick={() => handleRoleSelect("siswa")}
              >
                <div className="role-icon">
                  <img src={iconSiswa} alt="Siswa" />
                </div>
                <span>Siswa</span>
              </button>

              <button
                className="role-button role-guru"
                onClick={() => handleRoleSelect("guru")}
              >
                <div className="role-icon">
                  <img src={iconGuru} alt="Guru" />
                </div>
                <span>Guru</span>
              </button>

              <button
                className="role-button role-ortu"
                onClick={() => handleRoleSelect("ortu")}
              >
                <div className="role-icon">
                  <img src={iconOrtu} alt="Orang Tua" />
                </div>
                <span>Orang Tua</span>
              </button>
            </div>
            <button
              className="close-popup-button"
              onClick={() => setShowRoleSelection(false)}
            >
              Kembali
            </button>
          </motion.div>
        </div>
      )}

      {/* Pop-up Admin Login */}
      {showAdminLogin && (
        <div className="popup-overlay">
          <motion.div
            className="popup admin-confirm-popup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Masuk sebagai Admin</h2>
            <p>Anda akan diarahkan ke halaman login admin.</p>
            <div className="admin-confirm-buttons">
              <button
                className="confirm-button"
                onClick={handleAdminLoginClick}
              >
                Lanjutkan
              </button>
              <button
                className="close-popup-button"
                onClick={() => setShowAdminLogin(false)}
              >
                Batal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
