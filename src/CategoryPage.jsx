import React, { useState } from "react";
import { motion } from "framer-motion";
import "./kategori.css";

export default function CategoryPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleClose = () => {
    setSelectedRole(null);
  };

  return (
    <div className="kategori-container">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="kategori-title"
      >
        Pilih Kategori Anda
      </motion.h1>
      <div className="kategori-grid">
        {["Siswa", "Guru", "Orang Tua"].map((role, index) => (
          <motion.div
            key={role}
            className="kategori-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index }}
            onClick={() => handleRoleClick(role)}
          >
            <h2 className="kategori-text">{role}</h2>
          </motion.div>
        ))}
      </div>

      {selectedRole && (
        <div className="login-popup">
          <div className="login-form">
            <h2>Login Sebagai {selectedRole}</h2>
            <input type="text" placeholder="Username" />
            <input type="password" placeholder="Password" />
            <button>Login</button>
            <button className="close-button" onClick={handleClose}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
