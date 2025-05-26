import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";
import supabase from "../config/supabase";
import { dummySiswa, dummyGuru, staticCredentials } from "../config/mockData";
import {
  loginSiswa,
  loginGuru,
  loginAdmin,
  updateSiswaAvatar,
} from "../services/database";
import { motion } from "framer-motion";

// Import all animal avatars
import anjingAvatar from "../assets/anjing.png";
import babiAvatar from "../assets/babi.png";
import bebekAvatar from "../assets/bebek.png";
import guritaAvatar from "../assets/gurita.png";
import harimauAvatar from "../assets/harimau.png";
import kelinciAvatar from "../assets/kelinci.png";
import kucingAvatar from "../assets/kucing.png";
import sapiAvatar from "../assets/sapi.png";
import serigalaAvatar from "../assets/serigala.png";
import singaAvatar from "../assets/singa.png";

// Define avatar options using the imported images
const avatarOptions = [
  { name: "Anjing", src: anjingAvatar },
  { name: "Babi", src: babiAvatar },
  { name: "Bebek", src: bebekAvatar },
  { name: "Gurita", src: guritaAvatar },
  { name: "Harimau", src: harimauAvatar },
  { name: "Kelinci", src: kelinciAvatar },
  { name: "Kucing", src: kucingAvatar },
  { name: "Sapi", src: sapiAvatar },
  { name: "Serigala", src: serigalaAvatar },
  { name: "Singa", src: singaAvatar },
];

// Notification component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`} onClick={onClose}>
      {message}
    </div>
  );
};

// Loading Spinner component
const LoadingSpinner = ({ message = "Memproses login..." }) => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <div className="loading-text">{message}</div>
  </div>
);

// Avatar Skeleton component
const AvatarSkeleton = () => (
  <div className="avatar-skeleton-grid">
    {Array(10)
      .fill()
      .map((_, i) => (
        <div key={i} className="avatar-skeleton" />
      ))}
  </div>
);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [role, setRole] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [avatarsLoading, setAvatarsLoading] = useState(false);
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  // Validate form fields in real-time
  const validateField = (field, value) => {
    const errors = { ...fieldErrors };

    if (field === "username" && !value.trim()) {
      errors.username = "Nama tidak boleh kosong";
    } else if (field === "username") {
      delete errors.username;
    }

    if (field === "password" && !value.trim()) {
      errors.password =
        role === "siswa"
          ? "NIS tidak boleh kosong"
          : role === "guru"
          ? "NUPTK tidak boleh kosong"
          : "Password tidak boleh kosong";
    } else if (field === "password") {
      delete errors.password;
    }

    setFieldErrors(errors);
  };

  useEffect(() => {
    const selectedRole = localStorage.getItem("selectedRole");
    if (selectedRole) {
      setRole(selectedRole);
    } else {
      navigate("/");
    }
    checkConnection();
  }, [navigate]);

  useEffect(() => {
    const checkOfflineMode = () => {
      if (navigator.onLine) {
        if (isOfflineMode && retryCount < 3) {
          checkConnection();
        }
      } else {
        setIsOfflineMode(true);
        setConnectionChecking(false);
      }
    };

    window.addEventListener("online", checkOfflineMode);
    window.addEventListener("offline", () => {
      setIsOfflineMode(true);
      setConnectionChecking(false);
    });

    checkOfflineMode();

    return () => {
      window.removeEventListener("online", checkOfflineMode);
      window.removeEventListener("offline", () => {
        setIsOfflineMode(true);
        setConnectionChecking(false);
      });
    };
  }, [isOfflineMode, retryCount]);

  const checkConnection = async () => {
    try {
      setConnectionChecking(true);

      // First check navigator.onLine
      if (!navigator.onLine) {
        console.log("Browser reports offline");
        setIsOfflineMode(true);
        return false;
      }

      if (!supabase) {
        console.error("Supabase client not initialized");
        setIsOfflineMode(true);
        return false;
      }

      // Simple test query to check connection
      try {
        const { error } = await supabase.from("siswa").select("id_siswa").limit(1);

        if (error) {
          console.error("Database connection error:", error);
          setIsOfflineMode(true);
          return false;
        }

        setIsOfflineMode(false);
        return true;
      } catch (dbError) {
        console.error("Database test failed:", dbError);
        setIsOfflineMode(true);
        return false;
      }
    } catch (error) {
      console.error("Connection check error:", error);
      setIsOfflineMode(true);
      return false;
    } finally {
      setConnectionChecking(false);
    }
  };

  const retryConnection = () => {
    setRetryCount((prevCount) => prevCount + 1);
    checkConnection();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate all fields
    const errors = {};
    if (!username.trim()) errors.username = "Nama tidak boleh kosong";
    if (!password.trim())
      errors.password =
        role === "siswa"
          ? "NIS tidak boleh kosong"
          : role === "guru"
          ? "NUPTK tidak boleh kosong"
          : "Password tidak boleh kosong";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    if (!role) {
      setError("Error: Role tidak terdeteksi");
      setLoading(false);
      return;
    }

    try {
      // Coba login online terlebih dahulu
      if (role === "siswa") {
        try {
          console.log("Mencoba login siswa dengan nama:", username, "dan NIS:", password);
          const userData = await loginSiswa(username, password);

          if (!userData) {
            showNotification("Login gagal! Periksa kembali nama dan NIS Anda.", "error");
            setLoading(false);
            return;
          }

          // Pastikan id_siswa tersimpan
          if (!userData.id_siswa) {
            showNotification("Data siswa tidak lengkap. Hubungi administrator.", "error");
            setLoading(false);
            return;
          }

          // Simpan data lengkap ke localStorage
          const userDataToStore = {
            ...userData,
            isLoggedIn: true,
            role: "siswa",
            lastLoginTime: new Date().toISOString()
          };

          localStorage.setItem("userData", JSON.stringify(userDataToStore));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "siswa");
          localStorage.setItem("id_siswa", userData.id_siswa.toString());

          showNotification("Login berhasil! Silakan pilih avatar Anda.", "success");
          setAvatarsLoading(true);

          setTimeout(() => {
            setAvatarsLoading(false);
            setLoginSuccess(true);
          }, 1000);
        } catch (error) {
          console.error("Error during siswa login:", error);
          showNotification("Login Gagal. Mencoba mode offline...", "warning");
          handleOfflineLogin();
        }
      } else if (role === "guru") {
        try {
          console.log("Mencoba login guru dengan nama:", username, "dan NUPTK:", password);
          const userData = await loginGuru(username, password);

          if (!userData) {
            showNotification("Login gagal! Periksa kembali nama dan NUPTK Anda.", "error");
            setLoading(false);
            return;
          }

          console.log("Login guru berhasil dengan user:", userData);
          localStorage.setItem("userData", JSON.stringify(userData));

          if (userData.offline) {
            setIsOfflineMode(true);
            localStorage.setItem("isOfflineMode", "true");
          }

          showNotification("Login guru berhasil!", "success");
          setTimeout(() => completeLogin(null, "guru"), 1500);
        } catch (error) {
          console.error("Error during guru login:", error);
          showNotification("Login Gagal. Periksa Kembali Akun Anda....", "error");
          handleOfflineLogin();
        }
      } else if (role === "admin") {
        try {
          console.log("Attempting admin login with username:", username);
          const adminData = await loginAdmin(username, password);

          if (!adminData) {
            setError("Username atau password admin salah!");
            showNotification("Login gagal! Periksa kembali username dan password.", "error");
            setLoading(false);
            return;
          }

          console.log("Admin login successful with user:", adminData);
          const adminInfo = {
            nama: adminData.nama,
            tipe_admin: adminData.tipe_admin,
            id_admin: adminData.id_admin,
            username: username,
          };
          localStorage.setItem("userData", JSON.stringify(adminInfo));

          if (adminData.offline) {
            setIsOfflineMode(true);
            localStorage.setItem("isOfflineMode", "true");
          }

          showNotification("Login admin berhasil!", "success");
          setTimeout(() => completeLogin(null, "admin"), 1500);
        } catch (error) {
          console.error("Error during admin login:", error);
          showNotification("Login Gagal. Periksa Kembali Akun Anda....", "error");
          handleOfflineLogin();
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi atau gunakan mode offline.");
      showNotification("Terjadi kesalahan saat login.", "error");
      setLoading(false);
      handleOfflineLogin();
    }
  };

  // Helper function untuk login offline
  const handleOfflineLogin = () => {
    if (role === "siswa") {
      const offlineSiswa = dummySiswa.find(
        (s) => s.nama === username && s.nis === password
      );

      if (!offlineSiswa) {
        setError("Nama atau NIS tidak ditemukan dalam data offline");
        setLoading(false);
        return;
      }

      // Tambahkan id_siswa untuk data offline
      const siswaWithId = {
        ...offlineSiswa,
        id_siswa: Date.now(), // Generate temporary ID for offline mode
        offline: true,
        isLoggedIn: true,
        role: "siswa",
        lastLoginTime: new Date().toISOString()
      };

      localStorage.setItem("userData", JSON.stringify(siswaWithId));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "siswa");
      localStorage.setItem("id_siswa", siswaWithId.id_siswa.toString());
      localStorage.setItem("isOfflineMode", "true");
      
      setIsOfflineMode(true);
      setLoginSuccess(true);
    } else if (role === "guru") {
      // Guru login dengan nama dan nuptk
      // username = nama guru, password = nuptk
      const offlineGuru = dummyGuru.find(
        (g) => g.nama === username && g.nuptk === password
      );

      if (!offlineGuru) {
        setLoading(false);
        return;
      }

      // Tandai bahwa ini adalah data offline
      const guruWithFlag = { ...offlineGuru, offline: true };
      localStorage.setItem("userData", JSON.stringify(guruWithFlag));
      localStorage.setItem("isOfflineMode", "true");
      setIsOfflineMode(true);
      completeLogin(null, "guru");
    } else if (role === "admin") {
      // Check against static admin credentials
      const adminCred = staticCredentials.admin.find(
        (admin) => admin.username === username && admin.password === password
      );

      if (adminCred) {
        const adminData = {
          nama: adminCred.nama,
          tipe_admin: adminCred.type,
          username: adminCred.username,
          offline: true,
        };
        localStorage.setItem("userData", JSON.stringify(adminData));
        localStorage.setItem("isOfflineMode", "true");
        setIsOfflineMode(true);
        completeLogin(null, "admin");
      } else {
        setError("Username atau password admin salah!");
        setLoading(false);
      }
    }
  };

  const handleAvatarSelection = async (avatar) => {
    setSelectedAvatar(avatar);
    showNotification(`Avatar ${avatar.name} dipilih!`, "success");

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (userData && userData.id_siswa) {
        let shouldUpdateLocally = true;

        // Only try online update if we're not in offline mode
        if (!isOfflineMode) {
          try {
            const updatedUser = await updateSiswaAvatar(userData.id_siswa, avatar.name);

            if (updatedUser && !updatedUser.error) {
              if (updatedUser.offline) {
                setIsOfflineMode(true);
                localStorage.setItem("isOfflineMode", "true");
              }
              userData.avatar = updatedUser.avatar || avatar.name;
              shouldUpdateLocally = false;
            }
          } catch (error) {
            console.error("Error updating avatar online:", error);
          }
        }

        // Update locally if online update failed or we're in offline mode
        if (shouldUpdateLocally) {
          userData.avatar = avatar.name;
        }

        localStorage.setItem("userData", JSON.stringify(userData));
      }

      setTimeout(() => completeLogin(avatar, "siswa"), 1000);
    } catch (err) {
      console.error("Error during avatar selection:", err);
      completeLogin(avatar, "siswa");
    }
  };

  const completeLogin = (avatar, userRole) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("isOfflineMode", isOfflineMode.toString());

    if (avatar) {
      localStorage.setItem("selectedAvatar", JSON.stringify(avatar));
    }

    switch (userRole) {
      case "siswa": {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const kelas = userData.id_kelas;
        if (kelas === 1) {
          navigate("/kelas1");
        } else if (kelas === 2) {
          navigate("/kelas2");
        } else if (kelas === 3) {
          navigate("/kelas3");
        } else if (kelas === 4) {
          navigate("/kelas4");
        } else if (kelas === 5) {
          navigate("/kelas5");
        } else if (kelas === 6) {
          navigate("/kelas6");
        } else {
          navigate("/main-siswa");
        }
        break;
      }
      case "guru": {
        navigate("/guru/dashboard");
        break;
      }
      case "ortu": {
        navigate("/dashboard-ortu");
        break;
      }
      case "admin": {
        navigate("/admin/dashboard");
        break;
      }
      default:
        navigate("/");
    }
  };

  const handleBackToRoleSelection = () => {
    localStorage.removeItem("selectedRole");
    navigate("/");
  };

  const getRoleInfo = () => {
    switch (role) {
      case "siswa":
        return {
          title: "Login Siswa",
          icon: null,
        };
      case "guru":
        return {
          title: "Login Guru",
          icon: null,
        };
      case "ortu":
        return {
          title: "Login Orang Tua",
          icon: null,
        };
      case "admin":
        return {
          title: "Login Admin",
          icon: null,
        };
      default:
        return {
          title: "Login",
          icon: null,
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="login-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {isOfflineMode && (
        <div className="offline-indicator">
          Mode Offline - Data login digunakan dari local storage
          <button
            className="retry-button"
            onClick={retryConnection}
            disabled={connectionChecking}
          >
            {connectionChecking ? "Memeriksa..." : "Coba Sambung Ulang"}
          </button>
        </div>
      )}
      <button
        className={`back-button role-${role}`}
        onClick={handleBackToRoleSelection}
      >
        Kembali
      </button>
      <div className={`login-box role-${role}`}>
        <div className="login-header">
          <h2>{roleInfo.title}</h2>
        </div>

        {loading && <LoadingSpinner />}

        {!loginSuccess && !loading ? (
          <div className="login-form1">
            {roleInfo.icon && (
              <div className="role-icon-container">
                <img
                  src={roleInfo.icon}
                  alt={`Icon ${roleInfo.title}`}
                  className="role-icon-large"
                />
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div
                className={`input-group ${
                  fieldErrors.username ? "error" : username.trim() ? "success" : ""
                }`}
              >
                <label htmlFor="username">
                  {role === "siswa"
                    ? "Nama"
                    : role === "guru"
                    ? "Nama"
                    : role === "admin"
                    ? "Email"
                    : "Username"}
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    validateField("username", e.target.value);
                  }}
                  onBlur={(e) => validateField("username", e.target.value)}
                  required
                  autoComplete={
                    role === "siswa"
                      ? "given-name"
                      : role === "guru"
                      ? "name"
                      : role === "admin"
                      ? "email"
                      : "username"
                  }
                  placeholder={
                    role === "siswa"
                      ? "Masukkan nama"
                      : role === "guru"
                      ? "Masukkan nama"
                      : role === "ortu"
                      ? "ortu"
                      : "Masukkan email admin"
                  }
                />
                {fieldErrors.username && (
                  <div className="field-error">{fieldErrors.username}</div>
                )}
              </div>
              <div
                className={`input-group ${
                  fieldErrors.password ? "error" : password.trim() ? "success" : ""
                }`}
              >
                <label htmlFor="password">
                  {role === "siswa"
                    ? "Nomor Induk Siswa (NIS)"
                    : role === "guru"
                    ? "NUPTK"
                    : "Password"}
                </label>
                <input
                  type={
                    role === "siswa" || role === "guru" ? "text" : "password"
                  }
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField("password", e.target.value);
                  }}
                  onBlur={(e) => validateField("password", e.target.value)}
                  required
                  autoComplete={
                    role === "siswa"
                      ? "username"
                      : role === "guru"
                      ? "username"
                      : "current-password"
                  }
                  placeholder={
                    role === "siswa"
                      ? "Masukkan NIS"
                      : role === "guru"
                      ? "Masukkan NUPTK"
                      : role === "ortu"
                      ? "ortu123"
                      : "Masukkan password"
                  }
                />
                {fieldErrors.password && (
                  <div className="field-error">{fieldErrors.password}</div>
                )}
              </div>
              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>
          </div>
        ) : loginSuccess ? (
          <div className="avatar-selection">
            <h3>Pilih Avatar Kamu!</h3>
            {avatarsLoading ? (
              <AvatarSkeleton />
            ) : (
              <div className="avatar-grid">
                {avatarOptions.map((avatar, index) => (
                  <motion.div
                    key={index}
                    className="avatar-option"
                    onClick={() => handleAvatarSelection(avatar)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAvatarSelection(avatar);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Pilih avatar ${avatar.name}`}
                    aria-selected={selectedAvatar?.name === avatar.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <img src={avatar.src} alt={avatar.name} />
                    <p>{avatar.name}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
