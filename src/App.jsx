import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import supabase from "./config/supabase";
import WelcomePage from "./components/WelcomePage";
import Login from "./components/Login";
import MainSiswa from "./pages/materi/materikelas1_2/main-siswa";
import CategoryPage from "./CategoryPage";
// MateriPage import removed
import GamePage from "./GamePage";
import HasilPage from "./HasilPage";
import Skor from "./Skor";
import HasilRetryPage from "./HasilRetryPage";
import Category from "./pages/Category";
// Import komponen game dengan nama Bahasa Indonesia
import Penjumlahan from "./pages/game/kelas1/Penjumlahan";
import Pembagian from "./pages/game/kelas1/Pembagian";
import Pengurangan from "./pages/game/kelas1/Pengurangan";
import Perkalian from "./pages/game/kelas1/Perkalian";
// Import komponen game untuk Bab 4
import PengukuranLuas from "./pages/game/kelas1/PengukuranLuas";
import PengukuranVolume from "./pages/game/kelas1/PengukuranVolume";
// Import komponen materi dengan nama Bahasa Indonesia
import MateriPenjumlahan from "./pages/materi/materikelas1_2/MateriPenjumlahan";
import MateriPembagian from "./pages/materi/materikelas1_2/MateriPembagian";
import MateriPerkalian from "./pages/materi/materikelas1_2/MateriPerkalian";
import MateriPengurangan from "./pages/materi/materikelas1_2/MateriPengurangan";
// Import komponen materi kelas 4 BAB 1
import MateriBab1_1 from "./pages/materi/materikelas4/Materikelas4_bab1/materi_Bab1_1";
import MateriBab1_2 from "./pages/materi/materikelas4/Materikelas4_bab1/materi_Bab1_2";
import MateriBab1_3 from "./pages/materi/materikelas4/Materikelas4_bab1/materi_Bab1_3";
import MateriBab1_4 from "./pages/materi/materikelas4/Materikelas4_bab1/Materi_Bab1_4";
import MateriBab1_5 from "./pages/materi/materikelas4/Materikelas4_bab1/Materi_Bab1_5";
import MateriBab1_6 from "./pages/materi/materikelas4/Materikelas4_bab1/Materi_Bab1_6";
import MateriBab1_7 from "./pages/materi/materikelas4/Materikelas4_bab1/Materi_Bab1_7";
// Import komponen materi kelas 4 bab 2
import MateriBab2_1 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_1";
import MateriBab2_2 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_2";
import MateriBab2_3 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_3";
import MateriBab2_4 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_4";
import MateriBab2_5 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_5";
import MateriBab2_6 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_6";
import MateriBab2_7 from "./pages/materi/materikelas4/Materikelas4_bab2/Materi_Bab2_7";
// Import komponen materi kelas 4 bab 3
import MateriBab3_1 from "./pages/materi/materikelas4/Materikelas4_bab3/Materi_Bab3_1";
import MateriBab3_2 from "./pages/materi/materikelas4/Materikelas4_bab3/Materi_Bab3_2";
import MateriBab3_3 from "./pages/materi/materikelas4/Materikelas4_bab3/Materi_Bab3_3";
import MateriBab3_4 from "./pages/materi/materikelas4/Materikelas4_bab3/Materi_Bab3_4";
import MateriBab3_5 from "./pages/materi/materikelas4/Materikelas4_bab3/Materi_Bab3_5";
import MateriBab3_6 from "./pages/materi/materikelas4/Materikelas4_bab3/Materi_Bab3_6";

// Import komponen materi Bab 4
import MateriBab4_1 from "./pages/materi/materikelas4/Materikelas4_bab4/Materi_Bab4_1";
import MateriBab4_2 from "./pages/materi/materikelas4/Materikelas4_bab4/Materi_Bab4_2";
import MateriBab4_3 from "./pages/materi/materikelas4/Materikelas4_bab4/Materi_Bab4_3";
import MateriBab4_4 from "./pages/materi/materikelas4/Materikelas4_bab4/Materi_Bab4_4";

// Import komponen materi Bab 5
import MateriBab5_1 from "./pages/materi/materikelas4/Materikelas4_bab5/Materi_Bab5_1";
import MateriBab5_2 from "./pages/materi/materikelas4/Materikelas4_bab5/Materi_Bab5_2";
import MateriBab5_3 from "./pages/materi/materikelas4/Materikelas4_bab5/Materi_Bab5_3";

// Import komponen materi Bab 6
import MateriBab6_1 from "./pages/materi/materikelas4/Materikelas4_bab6/Materi_Bab6_1";
import MateriBab6_2 from "./pages/materi/materikelas4/Materikelas4_bab6/Materi_Bab6_2";
import MateriBab6_3 from "./pages/materi/materikelas4/Materikelas4_bab6/Materi_Bab6_3";

// Import komponen admin
import AdminRegister from "./pages/admin/AdminRegister";
// Import komponen guru
import TabGuru from "./guru/TabGuru";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
// Import komponen kelas 4
import MainSiswa2 from "./pages/kelas/kelas2/MainSiswa2";
import MainSiswa4 from "./pages/kelas/kelas4/main-siswa4";
import Category4_Bab1 from "./pages/kelas/kelas4/Category4_Bab1";
import Category4_Bab2 from "./pages/kelas/kelas4/Category4_Bab2";
import Category4_Bab3 from "./pages/kelas/kelas4/Category4_Bab3";
import Category4_Bab4 from "./pages/kelas/kelas4/Category4_Bab4";
import Category4_Bab5 from "./pages/kelas/kelas4/Category4_Bab5";
import Category4_Bab6 from "./pages/kelas/kelas4/Category4_Bab6";
// Import game component for Bab1 Level1
import PetualanganBilanganCacah from "./pages/game/kelas4/Bab1/Bab1_Level1";
// Import game component for Bab1 Level2
import KomposisiDanPengurangan from "./pages/game/kelas4/Bab1/Bab1_Level2";
// Import game component for Bab1 Level3
import LatihanPerkalianPembagian from "./pages/game/kelas4/Bab1/Bab1_Level3";
// Import game component for Bab1 Level4
import FaktorKelipatanDragDropGame from "./pages/game/kelas4/Bab1/Bab1_Level4";
// Import game component for Bab2 Level1
import FractionAdventure from "./pages/game/kelas4/Bab2/Bab2_Level1";
// Import game component for Bab2 Level2
import FractionGame from "./pages/game/kelas4/Bab2/Bab2_Level2";
// Import game component for game Pecahan Desimal - Bab 2 Level 3
import GamePecahanDesimal from "./pages/game/kelas4/Bab2/Bab2_Level3";
// Import game component for game Pecahan Desimal - Bab 2 Level 4
import GamePecahanDesimalPersen from "./pages/game/kelas4/Bab2/Bab2_Level4";
//bab 3
import GamePolaBilangan from "./pages/game/kelas4/Bab3/Bab3_Level1";
// Import game component for Bab3 Level2
import GamePolaBilanganLevel2 from "./pages/game/kelas4/Bab3/Bab3_Level2";
// bab 4
import Bab4_Level1 from "./pages/game/kelas4/Bab4/Bab4_Level1";
// Import game component for Bab4 Level2
import Bab4_Level2 from "./pages/game/kelas4/Bab4/Bab4_Level2";
// bab 5
import Bab5_Level1 from "./pages/game/kelas4/Bab5/Bab5";
// bab6
import Bab6_Level1 from "./pages/game/kelas4/Bab6/Bab6_Level1";

// Komponen untuk proteksi rute
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Komponen untuk proteksi rute admin
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("userRole") === "admin";

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function App() {
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        if (!supabase) {
          setDbError(
            "Tidak dapat terhubung ke database. Beberapa fitur mungkin tidak tersedia."
          );
          return;
        }

        const isConnected = await supabase.testConnection();
        if (!isConnected) {
          setDbError(
            "Tidak dapat terhubung ke database. Beberapa fitur mungkin tidak tersedia."
          );
        } else {
          setDbError(null);
        }
      } catch (error) {
        console.error("Database connection error:", error);
        setDbError("Terjadi kesalahan saat menghubungi database.");
      }
    };

    checkDbConnection();

    // Check connection periodically
    const interval = setInterval(checkDbConnection, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Router basename="/">
      {dbError && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "10px",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          {dbError}
        </div>
      )}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/main-siswa"
          element={
            <ProtectedRoute>
              <MainSiswa />
            </ProtectedRoute>
          }
        />
        {/* Route untuk kelas 2 */}
        <Route
          path="/kelas2"
          element={
            <ProtectedRoute>
              <MainSiswa2 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk kelas 4 */}
        <Route
          path="/kelas4"
          element={
            <ProtectedRoute>
              <MainSiswa4 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk Category4_Bab1 */}
        <Route
          path="/category4_bab1"
          element={
            <ProtectedRoute>
              <Category4_Bab1 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk Category4_Bab2 */}
        <Route
          path="/category4_bab2"
          element={
            <ProtectedRoute>
              <Category4_Bab2 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk Category4_Bab3 */}
        <Route
          path="/category4_bab3"
          element={
            <ProtectedRoute>
              <Category4_Bab3 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk Category4_Bab4 */}
        <Route
          path="/category4_bab4"
          element={
            <ProtectedRoute>
              <Category4_Bab4 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk Category4_Bab5 */}
        <Route
          path="/category4_bab5"
          element={
            <ProtectedRoute>
              <Category4_Bab5 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk Category4_Bab6 */}
        <Route
          path="/category4_bab6"
          element={
            <ProtectedRoute>
              <Category4_Bab6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kategori"
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        {/* MateriPage route removed */}
        <Route
          path="/game/:chapterIndex/:levelIndex"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hasil/:score"
          element={
            <ProtectedRoute>
              <HasilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hasil-retry/:score"
          element={
            <ProtectedRoute>
              <HasilRetryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skor"
          element={
            <ProtectedRoute>
              <Skor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category"
          element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game dengan nama Bahasa Indonesia */}
        <Route
          path="/game/penjumlahan"
          element={
            <ProtectedRoute>
              <Penjumlahan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/pembagian"
          element={
            <ProtectedRoute>
              <Pembagian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/pengurangan"
          element={
            <ProtectedRoute>
              <Pengurangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/perkalian"
          element={
            <ProtectedRoute>
              <Perkalian />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Pengukuran Luas dan Volume - Bab 4 */}
        <Route
          path="/game/pengukuran-luas"
          element={
            <ProtectedRoute>
              <PengukuranLuas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/pengukuran-volume"
          element={
            <ProtectedRoute>
              <PengukuranVolume />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Petualangan Bilangan Cacah - Bab 1 */}
        <Route
          path="/game/kelas4/bab1/level1"
          element={
            <ProtectedRoute>
              <PetualanganBilanganCacah />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Komposisi dan Pengurangan - Bab 1 Level 2 */}
        <Route
          path="/game/kelas4/bab1/level2"
          element={
            <ProtectedRoute>
              <KomposisiDanPengurangan />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Latihan Perkalian dan Pembagian - Bab 1 Level 3 */}
        <Route
          path="/game/kelas4/bab1/level3"
          element={
            <ProtectedRoute>
              <LatihanPerkalianPembagian />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Faktor Kelipatan Drag and Drop - Bab 1 Level 4 */}
        <Route
          path="/game/kelas4/bab1/level4"
          element={
            <ProtectedRoute>
              <FaktorKelipatanDragDropGame />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Fraction Adventure - Bab 2 Level 1 */}
        <Route
          path="/game/kelas4/bab2/level1"
          element={
            <ProtectedRoute>
              <FractionAdventure />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Fraction Game - Bab 2 Level 2 */}
        <Route
          path="/game/kelas4/bab2/level2"
          element={
            <ProtectedRoute>
              <FractionGame />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Pecahan Desimal - Bab 2 Level 3 */}
        <Route
          path="/game/kelas4/bab2/level3"
          element={
            <ProtectedRoute>
              <GamePecahanDesimal />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Pecahan Desimal - Bab 2 Level 4 */}
        <Route
          path="/game/kelas4/bab2/level4"
          element={
            <ProtectedRoute>
              <GamePecahanDesimalPersen />
            </ProtectedRoute>
          }
        />{" "}
        {/* Route untuk game Pola Bilangan - Bab 3 Level 1 */}
        <Route
          path="/game/kelas4/bab3/level1"
          element={
            <ProtectedRoute>
              <GamePolaBilangan />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Pola Bilangan - Bab 3 Level 2 */}
        <Route
          path="/game/kelas4/bab3/level2"
          element={
            <ProtectedRoute>
              <GamePolaBilanganLevel2 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Bab 4 Level 1 */}
        <Route
          path="/game/kelas4/bab4/level1"
          element={
            <ProtectedRoute>
              <Bab4_Level1 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Bab 4 Level 2 */}
        <Route
          path="/game/kelas4/bab4/level2"
          element={
            <ProtectedRoute>
              <Bab4_Level2 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Bab 5 Level 1 */}
        <Route
          path="/game/kelas4/bab5/level1"
          element={
            <ProtectedRoute>
              <Bab5_Level1 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk game Bab 6 Level 1 */}
        <Route
          path="/game/kelas4/bab6/level1"
          element={
            <ProtectedRoute>
              <Bab6_Level1 />
            </ProtectedRoute>
          }
        />
        {/* Routes for games with English names - redirect to Indonesian routes */}
        <Route
          path="/game/addition"
          element={<Navigate to="/game/penjumlahan" replace />}
        />
        <Route
          path="/game/division"
          element={<Navigate to="/game/pembagian" replace />}
        />
        <Route
          path="/game/subtraction"
          element={<Navigate to="/game/pengurangan" replace />}
        />
        <Route
          path="/game/multiplication"
          element={<Navigate to="/game/perkalian" replace />}
        />
        {/* Route untuk halaman materi dengan nama Bahasa Indonesia */}
        <Route
          path="/materi/addition"
          element={
            <ProtectedRoute>
              <MateriPenjumlahan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/subtraction"
          element={
            <ProtectedRoute>
              <MateriPengurangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/multiplication"
          element={
            <ProtectedRoute>
              <MateriPerkalian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/division"
          element={
            <ProtectedRoute>
              <MateriPembagian />
            </ProtectedRoute>
          }
        />
        {/* Route untuk materi kelas 4 */}
        <Route
          path="/materi/materikelas4/materiBab1_1"
          element={
            <ProtectedRoute>
              <MateriBab1_1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab1_2"
          element={
            <ProtectedRoute>
              <MateriBab1_2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab1_3"
          element={
            <ProtectedRoute>
              <MateriBab1_3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab1_4"
          element={
            <ProtectedRoute>
              <MateriBab1_4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab1_5"
          element={
            <ProtectedRoute>
              <MateriBab1_5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab1_6"
          element={
            <ProtectedRoute>
              <MateriBab1_6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab1_7"
          element={
            <ProtectedRoute>
              <MateriBab1_7 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk materi kelas 4 bab 2 */}
        <Route
          path="/materi/materikelas4/materiBab2_1"
          element={
            <ProtectedRoute>
              <MateriBab2_1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab2_2"
          element={
            <ProtectedRoute>
              <MateriBab2_2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab2_3"
          element={
            <ProtectedRoute>
              <MateriBab2_3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab2_4"
          element={
            <ProtectedRoute>
              <MateriBab2_4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab2_5"
          element={
            <ProtectedRoute>
              <MateriBab2_5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab2_6"
          element={
            <ProtectedRoute>
              <MateriBab2_6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab2_7"
          element={
            <ProtectedRoute>
              <MateriBab2_7 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk materi kelas 4 bab 3 */}
        <Route
          path="/materi/materikelas4/materiBab3_1"
          element={
            <ProtectedRoute>
              <MateriBab3_1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab3_2"
          element={
            <ProtectedRoute>
              <MateriBab3_2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab3_3"
          element={
            <ProtectedRoute>
              <MateriBab3_3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab3_4"
          element={
            <ProtectedRoute>
              <MateriBab3_4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab3_5"
          element={
            <ProtectedRoute>
              <MateriBab3_5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab3_6"
          element={
            <ProtectedRoute>
              <MateriBab3_6 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk materi kelas 4 bab 4 */}
        <Route
          path="/materi/materikelas4/materiBab4_1"
          element={
            <ProtectedRoute>
              <MateriBab4_1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab4_2"
          element={
            <ProtectedRoute>
              <MateriBab4_2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab4_3"
          element={
            <ProtectedRoute>
              <MateriBab4_3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab4_4"
          element={
            <ProtectedRoute>
              <MateriBab4_4 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk materi kelas 4 bab 5 */}
        <Route
          path="/materi/materikelas4/materiBab5_1"
          element={
            <ProtectedRoute>
              <MateriBab5_1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab5_2"
          element={
            <ProtectedRoute>
              <MateriBab5_2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab5_3"
          element={
            <ProtectedRoute>
              <MateriBab5_3 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk materi kelas 4 bab 6 */}
        <Route
          path="/materi/materikelas4/materiBab6_1"
          element={
            <ProtectedRoute>
              <MateriBab6_1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab6_2"
          element={
            <ProtectedRoute>
              <MateriBab6_2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/materikelas4/materiBab6_3"
          element={
            <ProtectedRoute>
              <MateriBab6_3 />
            </ProtectedRoute>
          }
        />
        {/* Route untuk halaman admin */}
        <Route
          path="/admin/register"
          element={
            <AdminRoute>
              <AdminRegister />
            </AdminRoute>
          }
        />
        {/* Route untuk halaman guru */}
        <Route
          path="/guru/dashboard"
          element={
            <ProtectedRoute>
              <TabGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tabguru"
          element={
            <ProtectedRoute>
              <TabGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <DashboardAdmin />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}
