import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import "../login.css";
import "./guru.css";
import StudentHistoryModal from "./StudentHistoryModal";
import ModalCatatan from "./components/ModalCatatan";
import ModalLihatCatatan from "./components/ModalLihatCatatan";
import EditStudentModal from "./components/EditStudentModal";
import AddStudentModal from "./components/AddStudentModal";
import KelasModal from "./components/KelasModal";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from "chart.js";
import { Pie, Bar, Line, Radar } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

const TabGuru = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daftar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [students, setStudents] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState({
    name: "agung",
    role: "Guru Matematika",
    school: "SDN Kedoya Utara 03",
    email: "siti.rahayu@sdnmerdeka01.sch.id",
    phone: "+62 812-3456-7890",
    studentCount: 0,
    kelas: [], // Will be populated from database
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    student: null,
  });
  const [classes, setClasses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [scores, setScores] = useState([]);
  const [kemajuan, setKemajuan] = useState([]);
  const [modalCatatan, setModalCatatan] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
  });
  const [lihatCatatanModal, setLihatCatatanModal] = useState({
    isOpen: false,
    student: null,
    notes: [],
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    student: null,
  });
  const [addModal, setAddModal] = useState({
    isOpen: false,
  });
  const [kelasModal, setKelasModal] = useState({
    isOpen: false,
    type: null, // 'naik' or 'pindah'
    student: null,
    availableClasses: [],
  });
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    student: null,
  });

  // State untuk kelas yang dipilih di dropdown laporan
  const [selectedReportClass, setSelectedReportClass] = useState(null);
  const [gameProgressData, setGameProgressData] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    // Fetch user data from localStorage instead of using supabase auth
    const getCurrentUser = async () => {
      try {
        setLoading(true);

        // Check if user is logged in via localStorage
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userRole = localStorage.getItem("userRole");

        // Get user data from localStorage if user was logged in through our custom login
        const userDataString = localStorage.getItem("userData");
        const userData = userDataString ? JSON.parse(userDataString) : null;

        if (!isLoggedIn || userRole !== "guru" || !userData) {
          console.warn("No valid teacher login session found in localStorage");
          // Redirect to login if not logged in as teacher
          alert("Sesi login tidak valid. Silakan login kembali.");
          navigate("/login");
          return;
        }

        console.log("Current user from localStorage:", userData);
        setCurrentUserId(userData.id_guru);

        // Fetch teacher profile and students data with the user ID
        await fetchTeacherData(userData.id_guru);
      } catch (error) {
        console.error("Error loading user data:", error);
        alert(
          "Terjadi kesalahan saat memuat data pengguna. Menggunakan data contoh."
        );

        // Set default classes if there was an error
        setTeacherProfile((prev) => ({
          ...prev,
          kelas: ["Kelas 1", "Kelas 2", "Kelas 3"],
        }));
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [navigate]);

  useEffect(() => {
    // Fetch students data after teacher profile is loaded
    if (teacherProfile.kelas && teacherProfile.kelas.length > 0) {
      console.log(
        "Teacher classes loaded, fetching students:",
        teacherProfile.kelas
      );
      fetchStudents();
    }
  }, [teacherProfile.kelas]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from("kelas")
          .select("*")
          .eq("id_guru", currentUserId);

        if (classesError) throw classesError;
        setClasses(classesData || []);

        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from("siswa")
          .select("*");

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from("catatan")
          .select(
            `
            *,
            siswa_catatan!inner(*)
          `
          )
          .eq("id_guru", currentUserId);

        if (notesError) throw notesError;
        setNotes(notesData || []);

        // Fetch scores
        const { data: scoresData, error: scoresError } = await supabase
          .from("nilai")
          .select("*");

        if (scoresError) throw scoresError;
        setScores(scoresData || []);

        // Fetch kemajuan
        const { data: kemajuanData, error: kemajuanError } = await supabase
          .from("kemajuan")
          .select("*");

        if (kemajuanError) throw kemajuanError;
        setKemajuan(kemajuanData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Terjadi kesalahan saat memuat data");
      }
    };

    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId]);

  const fetchTeacherData = async (userId) => {
    setLoading(true);
    try {
      // Fetch teacher data from the guru table using the correct ID field
      const { data, error } = await supabase
        .from("guru")
        .select("*")
        .eq("id_guru", userId)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Fetched teacher data:", data);

        // Process kelas data from the guru table
        let kelasArray = [];

        if (data.kelas) {
          console.log(
            "Raw kelas data:",
            data.kelas,
            "Type:",
            typeof data.kelas
          );

          // If it's a number (e.g. just the grade level like 1, 2, 3)
          if (typeof data.kelas === "number") {
            kelasArray = [`Kelas ${data.kelas}`];
          }
          // If it's a string like "Kelas 1" or "Kelas 1,Kelas 2,Kelas 3"
          else if (typeof data.kelas === "string") {
            kelasArray = data.kelas
              .split(",")
              .map((k) => normalizeClass(k.trim()));
          }
        }

        // Normalize all class names to consistent format
        kelasArray = kelasArray.map((k) => normalizeClass(k));

        // If still no classes found, set defaults
        if (kelasArray.length === 0) {
          kelasArray = ["Kelas 1", "Kelas 2", "Kelas 3"];
          console.log(
            "Using default classes as none were found in teacher data"
          );
        }

        console.log("Processed teacher classes:", kelasArray);

        // Format role information based on kelas
        let roleText = "Guru Matematika";
        if (kelasArray.length > 0) {
          if (kelasArray.length === 1) {
            roleText = `Guru Matematika ${kelasArray[0]}`;
          } else {
            // For multiple classes, show range or list
            const classNumbers = kelasArray
              .map((k) => k.match(/\d+/)?.[0])
              .filter(Boolean)
              .sort((a, b) => parseInt(a) - parseInt(b));

            if (classNumbers.length > 1) {
              roleText = `Guru Matematika Kelas ${classNumbers[0]}-${
                classNumbers[classNumbers.length - 1]
              }`;
            }
          }
        }

        // Update teacher profile with data from the database using correct field names
        setTeacherProfile({
          name: data.nama || teacherProfile.name,
          role: roleText,
          school: "SDN Kedoya Utara 03", // Use a default value or fetch from a settings table
          email: data.email || teacherProfile.email,
          phone: data.no_telp || teacherProfile.phone,
          kelas: kelasArray,
          studentCount: 0, // Will be updated after fetching students
        });
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      alert("Error fetching teacher data. Using default profile.");

      // Set default classes if there was an error
      setTeacherProfile((prev) => ({
        ...prev,
        kelas: ["Kelas 1", "Kelas 2", "Kelas 3"],
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Get all students with their parent information
      const { data, error } = await supabase.from("siswa").select(`
          *,
          wali:id_wali (
            nama
          )
        `);

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("No students found in database");
        setStudents([]);
        setTeacherProfile((prev) => ({ ...prev, studentCount: 0 }));
        return;
      }

      // Process the student data
      const formattedStudents = data.map((student) => {
        const hasParentInfo = student.wali !== null;
        return {
          id: student.id_siswa,
          name: student.nama || "Nama tidak tersedia",
          class: `Kelas ${student.id_kelas}` || "Kelas tidak tersedia",
          nis: student.nis,
          birthDate: student.tanggal_lahir,
          address: student.alamat,
          gender: student.Jenis_Kelamin,
          id_wali: student.id_wali,
          parent: hasParentInfo ? student.wali.nama : "Belum ditautkan",
          parentStatus: hasParentInfo ? "linked" : "unlinked",
          avatar: student.avatar,
          auth_user_id: student.created_at,
          created_at: student.created_at,
          updated_at: student.updated_at,
        };
      });

      setStudents(formattedStudents);
      setTeacherProfile((prev) => ({
        ...prev,
        studentCount: formattedStudents.length,
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Error fetching students data. Using sample data instead.");
      createSampleStudents();
    } finally {
      setLoading(false);
    }
  };

  const createSampleStudents = () => {
    const sampleStudents = [];

    // Create sample students for each of the teacher's classes
    teacherProfile.kelas.forEach((kelas, index) => {
      // Extract class number
      const classNumber = kelas.replace(/\D/g, "");
      const classAge = classNumber ? 6 + parseInt(classNumber) : 7;

      // Add a male and female student for each class
      sampleStudents.push({
        id: `sample-${index}-1`,
        name: `Budi ${classNumber || index + 1}`, // e.g. "Budi 1"
        class: kelas,
        age: classAge,
        parent: index % 2 === 0 ? "Andi Wijaya" : "Belum ditautkan",
        parentStatus: index % 2 === 0 ? "linked" : "unlinked",
        avatar: "/src/assets/laki.png",
      });

      sampleStudents.push({
        id: `sample-${index}-2`,
        name: `Ani ${classNumber || index + 1}`, // e.g. "Ani 1"
        class: kelas,
        age: classAge,
        parent: index % 2 === 1 ? "Rina Wijayanti" : "Belum ditautkan",
        parentStatus: index % 2 === 1 ? "linked" : "unlinked",
        avatar: "/src/assets/perempuan.png",
      });
    });

    setStudents(sampleStudents);
    setTeacherProfile((prev) => ({
      ...prev,
      studentCount: sampleStudents.length,
    }));
  };

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return null;

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Helper function to normalize class formats
  const normalizeClass = (kelasString) => {
    if (!kelasString) return "";

    // Convert to string if it's a number
    const str = String(kelasString).trim();

    // If it's just a number, prepend "Kelas "
    if (/^\d+$/.test(str)) {
      return `Kelas ${str}`;
    }

    // Handle "K1", "K 1", "k.1", "kls1", "kelas1" etc.
    if (/^[kK](elas|ls)?\.?\s*\d+[A-Za-z]?$/.test(str)) {
      const num = str.match(/\d+[A-Za-z]?/)[0];
      return `Kelas ${num}`;
    }

    // If it already has "Kelas" prefix (case insensitive), standardize the format
    if (str.toLowerCase().includes("kelas")) {
      // Extract the number part with any letter suffix (like 4A, 4B)
      const match = str.match(/\d+[A-Za-z]?/);
      if (match) {
        return `Kelas ${match[0]}`;
      }
      // If there's no number, return as is with first letter capitalized
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Otherwise, prepend "Kelas "
    return `Kelas ${str}`;
  };
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const handleAddStudent = () => {
    setAddModal({
      isOpen: true,
    });
  };

  const closeAddModal = () => {
    setAddModal({
      isOpen: false,
    });
  };

  const handleStudentAdd = (newStudent) => {
    // Format the new student data to match the existing structure
    const formattedStudent = {
      id: newStudent.id_siswa,
      name: newStudent.nama,
      class: `Kelas ${newStudent.id_kelas}`,
      nis: newStudent.nis,
      birthDate: newStudent.tanggal_lahir,
      address: newStudent.alamat,
      gender: newStudent.Jenis_Kelamin,
      id_wali: newStudent.id_wali,
      parentStatus: newStudent.id_wali ? "linked" : "unlinked",
      avatar: newStudent.avatar,
    };

    // Add the new student to the state
    setStudents((prev) => [...prev, formattedStudent]);

    // Update teacher profile student count
    setTeacherProfile((prev) => ({
      ...prev,
      studentCount: prev.studentCount + 1,
    }));
  };

  const filterStudents = () => {
    if (!students) return [];

    let filtered = [...students];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by class
    if (selectedClass !== "Semua Kelas") {
      filtered = filtered.filter((student) => student.class === selectedClass);
    }

    return filtered;
  };
  const handleSendNote = (studentId, studentName) => {
    setModalCatatan({
      isOpen: true,
      studentId,
      studentName,
    });
  };

  const handleViewHistory = (student) => {
    setHistoryModal({
      isOpen: true,
      student: student,
    });
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      student: null,
    });
  };

  const handleViewReport = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      // Make sure this student has data before showing report
      ensureStudentHasData(studentId);

      // Using setTimeout to allow the state update to complete
      setTimeout(() => {
        setReportModal({
          isOpen: true,
          student: student,
        });
      }, 100);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        // Step 1: Delete related records in siswa_catatan
        const { error: catatanError } = await supabase
          .from("siswa_catatan")
          .delete()
          .eq("id_siswa", studentId);

        if (catatanError) {
          console.error("Error menghapus catatan siswa:", catatanError);
          // Continue even if there's an error - records might not exist
        }

        // Step 2: Delete related records in nilai
        const { error: nilaiError } = await supabase
          .from("nilai")
          .delete()
          .eq("id_siswa", studentId);

        if (nilaiError) {
          console.error("Error menghapus nilai siswa:", nilaiError);
          // Continue even if there's an error
        }

        // Step 3: Delete related records in kemajuan
        const { error: kemajuanError } = await supabase
          .from("kemajuan")
          .delete()
          .eq("id_siswa", studentId);

        if (kemajuanError) {
          console.error("Error menghapus data kemajuan siswa:", kemajuanError);
          // Continue even if there's an error
        }

        // Step 4: Finally delete the student record
        const { error } = await supabase
          .from("siswa")
          .delete()
          .eq("id_siswa", studentId);

        if (error) throw error;

        // Update the UI
        setStudents(students.filter((student) => student.id !== studentId));

        // Update student count in teacher profile
        setTeacherProfile((prev) => ({
          ...prev,
          studentCount: prev.studentCount - 1,
        }));

        alert(`Siswa berhasil dihapus`);
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Error deleting student: " + error.message);
      }
    }
  };

  const closeModalCatatan = () => {
    setModalCatatan({
      isOpen: false,
      studentId: null,
      studentName: "",
    });
  };

  const handleLihatCatatan = (student) => {
    const studentNotes = notes.filter(
      (n) => n.siswa_catatan[0]?.id_siswa === student.id
    );

    setLihatCatatanModal({
      isOpen: true,
      student: student,
      notes: studentNotes,
    });
  };

  const closeLihatCatatanModal = () => {
    setLihatCatatanModal({
      isOpen: false,
      student: null,
      notes: [],
    });
  };

  const handleDeleteNote = async (noteId) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      try {
        // Step 1: Delete related records in siswa_catatan first
        const { error: siswaCatatanError } = await supabase
          .from("siswa_catatan")
          .delete()
          .eq("id_catatan", noteId);

        if (siswaCatatanError) throw siswaCatatanError;

        // Step 2: Now delete the note from the catatan table
        const { error: catatanError } = await supabase
          .from("catatan")
          .delete()
          .eq("id_catatan", noteId);

        if (catatanError) throw catatanError;

        // Update local state by removing the deleted note
        const updatedNotes = notes.filter((note) => note.id_catatan !== noteId);
        setNotes(updatedNotes);

        // Also update the notes shown in the open modal if it's for the same student
        // This logic needs to be adjusted to filter notes correctly based on the student in the modal
        setLihatCatatanModal((prevState) => {
          if (prevState.isOpen && prevState.student) {
            const studentIdInModal = prevState.student.id;
            const filteredNotesForModal = updatedNotes.filter(
              (note) =>
                note.siswa_catatan &&
                note.siswa_catatan.length > 0 &&
                note.siswa_catatan.some(
                  (sc) => sc.id_siswa === studentIdInModal
                )
            );
            return {
              ...prevState,
              notes: filteredNotesForModal,
            };
          } else {
            return prevState;
          }
        });

        alert("Catatan berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Gagal menghapus catatan: " + error.message);
      }
    }
  };

  const handleNaikKelas = (student) => {
    // Dapatkan nomor kelas saat ini
    const currentClass = student.class.match(/\d+/)[0];
    const nextClass = parseInt(currentClass) + 1;

    // Cek apakah kelas berikutnya tersedia
    const nextClassExists = teacherProfile.kelas.some((k) =>
      k.includes(`Kelas ${nextClass}`)
    );

    if (!nextClassExists) {
      alert(
        `Tidak dapat menaikkan kelas karena Kelas ${nextClass} tidak tersedia`
      );
      return;
    }

    // Tampilkan modal dengan opsi kelas yang tersedia untuk kenaikan
    const availableClasses = teacherProfile.kelas.filter((k) => {
      const classNum = parseInt(k.match(/\d+/)[0]);
      return classNum > parseInt(currentClass);
    });

    setKelasModal({
      isOpen: true,
      type: "naik",
      student: student,
      availableClasses: availableClasses,
    });
  };

  const handlePindahKelas = (student) => {
    // Dapatkan daftar kelas yang tersedia (kecuali kelas saat ini)
    const availableClasses = teacherProfile.kelas.filter(
      (k) => k !== student.class
    );

    if (availableClasses.length === 0) {
      alert("Tidak ada kelas lain yang tersedia untuk dipindahkan");
      return;
    }

    setKelasModal({
      isOpen: true,
      type: "pindah",
      student: student,
      availableClasses: availableClasses,
    });
  };

  const handleKelasConfirm = async (targetClass) => {
    const student = kelasModal.student;
    const targetClassNumber = targetClass.match(/\d+/)[0];

    try {
      const { error } = await supabase
        .from("siswa")
        .update({ id_kelas: parseInt(targetClassNumber) })
        .eq("id_siswa", student.id);

      if (error) throw error;

      // Update UI
      setStudents(
        students.map((s) =>
          s.id === student.id ? { ...s, class: targetClass } : s
        )
      );

      const action =
        kelasModal.type === "naik" ? "dinaikkan ke" : "dipindahkan ke";
      alert(`${student.name} berhasil ${action} ${targetClass}`);

      // Tutup modal
      setKelasModal({
        isOpen: false,
        type: null,
        student: null,
        availableClasses: [],
      });
    } catch (error) {
      console.error("Error mengubah kelas:", error);
      alert("Gagal mengubah kelas: " + error.message);
    }
  };

  // Data dummy untuk nilai dan kemajuan siswa
  useEffect(() => {
    // Jalankan sekali saja setelah students dimuat
    if (students.length > 0) {
      generateDummyData();
    }
  }, [students]);

  const generateDummyData = () => {
    console.log("Generating dummy data for charts...");
    // Buat data dummy untuk nilai siswa
    const dummyScores = [];
    const dummyKemajuan = [];

    // Kategori materi
    const materiCategories = [
      "Bilangan",
      "Pengukuran",
      "Geometri",
      "Statistik",
    ];
    const materiSubcategories = {
      Bilangan: ["Penjumlahan", "Pengurangan", "Perkalian", "Pembagian"],
      Pengukuran: ["Panjang", "Berat", "Waktu", "Luas", "Volume"],
      Geometri: ["Bangun Datar", "Bangun Ruang", "Simetri"],
      Statistik: ["Pengumpulan Data", "Penyajian Data", "Analisis Data"],
    };

    // Untuk setiap siswa
    students.forEach((student) => {
      // Untuk setiap kategori materi, pastikan ada minimal satu nilai
      materiCategories.forEach((category) => {
        // Tambahkan minimal satu nilai untuk kategori ini (untuk keperluan pie chart)
        const baseNilaiKategori = Math.floor(Math.random() * 36) + 60;
        dummyScores.push({
          id_nilai: `dummy-${student.id}-${category}-main`,
          id_siswa: student.id,
          nilai: baseNilaiKategori,
          kategori: category,
          sub_kategori: `${category} Dasar`,
          keterangan:
            baseNilaiKategori >= 75 ? "Sangat Baik" : "Perlu Ditingkatkan",
          tanggal: new Date(
            2023,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          )
            .toISOString()
            .split("T")[0],
        });

        // Untuk setiap subkategori dalam kategori
        materiSubcategories[category].forEach((subcategory, index) => {
          // Buat variasi nilai antara 60-95
          const baseNilai = Math.floor(Math.random() * 36) + 60;

          // Tambahkan ke scores
          dummyScores.push({
            id_nilai: `dummy-${student.id}-${category}-${index}`,
            id_siswa: student.id,
            nilai: baseNilai,
            kategori: category,
            sub_kategori: subcategory,
            keterangan: baseNilai >= 75 ? "Sangat Baik" : "Perlu Ditingkatkan",
            tanggal: new Date(
              2023,
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            )
              .toISOString()
              .split("T")[0],
          });

          // Tambahkan data kemajuan
          dummyKemajuan.push({
            id_kemajuan: `dummy-progress-${student.id}-${category}-${index}`,
            id_siswa: student.id,
            id_materi: `materi-${category}-${index}`,
            kategori: category,
            sub_kategori: subcategory,
            status_selesai: Math.random() > 0.3,
            tanggal_akses: new Date(
              2023,
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            )
              .toISOString()
              .split("T")[0],
          });
        });
      });
    });

    // Update state dengan data dummy - pastikan untuk menambahkan data baru, bukan menimpa data yang sudah ada
    setScores((prevScores) => {
      // Filter dulu untuk menghapus data dummy dari siswa yang sama agar tidak duplikat
      const filteredScores = prevScores.filter(
        (score) =>
          !score.id_nilai.startsWith("dummy-") ||
          !students.some((student) => score.id_nilai.includes(student.id))
      );
      return [...filteredScores, ...dummyScores];
    });

    setKemajuan((prevKemajuan) => {
      const filteredKemajuan = prevKemajuan.filter(
        (k) =>
          !k.id_kemajuan.startsWith("dummy-progress-") ||
          !students.some((student) => k.id_kemajuan.includes(student.id))
      );
      return [...filteredKemajuan, ...dummyKemajuan];
    });

    console.log(
      `Data dummy dibuat: ${dummyScores.length} nilai dan ${dummyKemajuan.length} data kemajuan`
    );
  };

  // Fungsi untuk mendapatkan data untuk pie chart - Perbaikan implementasi
  const getPieChartData = (siswaId) => {
    // Kategori materi
    const categories = ["Bilangan", "Pengukuran", "Geometri", "Statistik"];

    // Check if we have game progress data for this student
    if (!gameProgressData[siswaId]) {
      // Data default jika belum ada nilai
      return {
        labels: categories,
        datasets: [
          {
            data: [0, 0, 0, 0],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          },
        ],
      };
    }

    // Get all game progress data for the student from supabase directly
    const { data: studentGameData, error } = supabase
      .from("game_progress")
      .select("*")
      .eq("id_siswa", siswaId)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching student game data:", error);
          return null;
        }

        // Map jenis_permainan to our categories
        const scoresByCategory = {
          Bilangan: { total: 0, count: 0 },
          Pengukuran: { total: 0, count: 0 },
          Geometri: { total: 0, count: 0 },
          Statistik: { total: 0, count: 0 },
        };

        // Map game data to categories based on jenis_permainan field
        data.forEach((gameData) => {
          let category = "Bilangan"; // Default category

          // Map jenis_permainan to categories
          if (gameData.jenis_permainan) {
            const jenis = gameData.jenis_permainan.toLowerCase();
            if (
              jenis.includes("ukur") ||
              jenis.includes("panjang") ||
              jenis.includes("berat") ||
              jenis.includes("waktu")
            ) {
              category = "Pengukuran";
            } else if (
              jenis.includes("bangun") ||
              jenis.includes("geometri") ||
              jenis.includes("ruang") ||
              jenis.includes("datar")
            ) {
              category = "Geometri";
            } else if (
              jenis.includes("data") ||
              jenis.includes("statistik") ||
              jenis.includes("diagram")
            ) {
              category = "Statistik";
            }
          }

          // Add score to category
          scoresByCategory[category].total += gameData.skor;
          scoresByCategory[category].count += 1;
        });

        // Calculate average for each category
        const categoryAverages = {};
        categories.forEach((category) => {
          if (scoresByCategory[category].count > 0) {
            categoryAverages[category] = Math.round(
              scoresByCategory[category].total /
                scoresByCategory[category].count
            );
          } else {
            categoryAverages[category] = 0;
          }
        });

        return {
          labels: categories,
          datasets: [
            {
              data: Object.values(categoryAverages),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
              borderWidth: 1,
            },
          ],
        };
      });

    // If we couldn't get data from supabase, use our cached gameProgressData
    if (!studentGameData) {
      // Use the average score for all categories for now
      const avgScore = gameProgressData[siswaId].averageScore || 0;
      const equalDistribution = [avgScore, avgScore, avgScore, avgScore];

      return {
        labels: categories,
        datasets: [
          {
            data: equalDistribution,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            borderWidth: 1,
          },
        ],
      };
    }

    return studentGameData;
  };

  // Fungsi untuk mendapatkan data untuk bar chart - Perbaikan implementasi
  const getBarChartData = (kelasId) => {
    // Filter siswa di kelas tertentu
    const kelasSiswa = students.filter((s) => s.class === `Kelas ${kelasId}`);

    // Batasi ke 10 siswa saja untuk tampilan yang lebih baik
    const limitedStudents = kelasSiswa.slice(0, 10);

    const data = {
      labels: limitedStudents.map((s) => s.name),
      datasets: [
        {
          label: "Rata-rata Nilai",
          data: limitedStudents.map((s) => {
            const avg = calculateStudentAverage(s.id);
            return avg === "N/A" ? 0 : parseFloat(avg);
          }),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  // Fungsi untuk mendapatkan data untuk radar chart
  const getRadarChartData = (siswaId) => {
    const student = students.find((s) => s.id === siswaId);
    if (!student) return null;

    // Kategori materi
    const subcategories = [
      "Penjumlahan",
      "Pengurangan",
      "Perkalian",
      "Pembagian",
      "Bangun Datar",
      "Bangun Ruang",
    ];

    // Mengambil data untuk siswa
    const studentScores = scores.filter((score) => score.id_siswa === siswaId);

    // Data nilai untuk setiap subkategori
    const scoreData = subcategories.map((sub) => {
      const subScores = studentScores.filter(
        (score) => score.sub_kategori === sub
      );
      if (subScores.length > 0) {
        const total = subScores.reduce((sum, score) => sum + score.nilai, 0);
        return Math.round(total / subScores.length);
      }
      return Math.floor(Math.random() * 30) + 65; // Nilai default jika tidak ada data
    });

    // Data nilai rata-rata kelas untuk perbandingan
    const classStudents = students.filter((s) => s.class === student.class);
    const classAvgData = subcategories.map((sub) => {
      let total = 0;
      let count = 0;

      classStudents.forEach((s) => {
        const studentSubScores = scores.filter(
          (score) => score.id_siswa === s.id && score.sub_kategori === sub
        );

        if (studentSubScores.length > 0) {
          const studentAvg =
            studentSubScores.reduce((sum, score) => sum + score.nilai, 0) /
            studentSubScores.length;
          total += studentAvg;
          count++;
        }
      });

      return count > 0
        ? Math.round(total / count)
        : Math.floor(Math.random() * 20) + 70;
    });

    return {
      labels: subcategories,
      datasets: [
        {
          label: `${student.name}`,
          data: scoreData,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgb(255, 99, 132)",
          pointBackgroundColor: "rgb(255, 99, 132)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(255, 99, 132)",
        },
        {
          label: `Rata-rata ${student.class}`,
          data: classAvgData,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgb(54, 162, 235)",
          pointBackgroundColor: "rgb(54, 162, 235)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(54, 162, 235)",
        },
      ],
    };
  };

  // Fungsi untuk mendapatkan data untuk line chart
  const getProgressLineChartData = (siswaId) => {
    const student = students.find((s) => s.id === siswaId);
    if (!student) return null;

    // Buat array untuk 6 bulan terakhir (Januari - Juni 2023)
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
    const monthNumbers = [0, 1, 2, 3, 4, 5]; // Januari sampai Juni

    // Filter nilai berdasarkan siswa
    const studentScores = scores.filter((score) => score.id_siswa === siswaId);

    // Kelompokkan nilai berdasarkan bulan
    const scoresByMonth = monthNumbers.map((month) => {
      const monthScores = studentScores.filter((score) => {
        const scoreDate = new Date(score.tanggal);
        return scoreDate.getMonth() === month;
      });

      if (monthScores.length > 0) {
        const total = monthScores.reduce((sum, score) => sum + score.nilai, 0);
        return Math.round(total / monthScores.length);
      }

      // Jika tidak ada nilai untuk bulan tersebut, gunakan nilai acak
      // Nilai acak dengan sedikit peningkatan setiap bulan (simulasi kemajuan)
      return 65 + Math.floor(Math.random() * 20) + month * 2;
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Perkembangan Nilai",
          data: scoresByMonth,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };
  };

  // Fungsi untuk mendapatkan data perbandingan nilai per topik
  const getTopicComparisonData = (siswaId) => {
    const student = students.find((s) => s.id === siswaId);
    if (!student) return null;

    // Pilih topik-topik penting yang ingin ditampilkan
    const topics = [
      "Penjumlahan",
      "Pengurangan",
      "Perkalian",
      "Pembagian",
      "Bangun Datar",
      "Bangun Ruang",
    ];

    // Filter nilai untuk siswa tersebut
    const studentScores = scores.filter((score) => score.id_siswa === siswaId);

    // Hitung rata-rata nilai per topik untuk siswa
    const studentData = [];
    topics.forEach((topic) => {
      const topicScores = studentScores.filter(
        (score) => score.sub_kategori === topic
      );
      if (topicScores.length > 0) {
        const avg =
          topicScores.reduce((sum, score) => sum + score.nilai, 0) /
          topicScores.length;
        studentData.push(Math.round(avg));
      } else {
        // Jika tidak ada data, gunakan nilai default
        studentData.push(Math.floor(Math.random() * 20) + 70);
      }
    });

    // Hitung rata-rata nilai per topik untuk kelas
    const classStudents = students.filter((s) => s.class === student.class);
    const classData = [];
    topics.forEach((topic) => {
      let totalNilai = 0;
      let totalSiswa = 0;

      classStudents.forEach((classStudent) => {
        const studentTopicScores = scores.filter(
          (score) =>
            score.id_siswa === classStudent.id && score.sub_kategori === topic
        );

        if (studentTopicScores.length > 0) {
          const avg =
            studentTopicScores.reduce((sum, score) => sum + score.nilai, 0) /
            studentTopicScores.length;
          totalNilai += avg;
          totalSiswa++;
        }
      });

      if (totalSiswa > 0) {
        classData.push(Math.round(totalNilai / totalSiswa));
      } else {
        // Jika tidak ada data, gunakan nilai default
        classData.push(Math.floor(Math.random() * 15) + 70);
      }
    });

    return {
      labels: topics,
      datasets: [
        {
          label: student.name,
          data: studentData,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
        {
          label: `Rata-rata ${student.class}`,
          data: classData,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };
  };

  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      student: null,
    });
  };

  const printReportToPDF = (student) => {
    try {
      // Display loading message
      alert("Sedang memproses laporan. Silahkan tunggu...");

      // Get the report content element
      const reportContent = document.getElementById("report-content");
      if (!reportContent) {
        alert("Konten laporan tidak ditemukan");
        return;
      }

      // Create a PDF with better styling
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set document properties
      doc.setProperties({
        title: `Laporan Siswa - ${student.name}`,
        subject: `Laporan Pembelajaran ${student.class}`,
        author: "Math Fun",
        creator: "Math Fun Application",
      });

      // COLORS DEFINITION
      const primaryColor = [66, 133, 244]; // Blue
      const secondaryColor = [52, 168, 83]; // Green
      const accentColor = [234, 67, 53]; // Red
      const highlightColor = [251, 188, 5]; // Yellow
      const textColor = [60, 64, 67]; // Dark gray
      const lightGray = [240, 240, 240]; // Light gray for backgrounds

      // HEADER SECTION WITH COLORFUL STYLING
      // Add colorful header background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");

      // Add white text for header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("SDN Kedoya Utara 03", 105, 15, { align: "center" });
      doc.setFontSize(14);
      doc.text("Laporan Pembelajaran Siswa", 105, 25, { align: "center" });

      // Add logo instead of circle with "MF" text
      try {
        // Get logo from DOM by creating a temporary image element
        const logoImg = new Image();
        logoImg.src = "/src/assets/logo.png";

        // When the image loads, add it to the PDF
        logoImg.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(logoImg, 0, 0);

          const logoBase64 = canvas.toDataURL("image/png");
          // Add logo to PDF - positioned on the left side of the header
          doc.addImage(logoBase64, "PNG", 20, 5, 30, 30);

          // Now that the logo is added, save the PDF
          const formattedDate = new Date().toISOString().split("T")[0];
          const fileName = `Laporan_${student.name.replace(
            /\s+/g,
            "_"
          )}_${formattedDate}.pdf`;
          doc.save(fileName);

          alert(`Laporan berhasil diunduh dengan nama file: ${fileName}`);
        };

        // Handle errors with loading the image
        logoImg.onerror = function () {
          console.error("Error loading logo image");
          // Fall back to saving without the logo
          const formattedDate = new Date().toISOString().split("T")[0];
          const fileName = `Laporan_${student.name.replace(
            /\s+/g,
            "_"
          )}_${formattedDate}.pdf`;
          doc.save(fileName);

          alert(`Laporan berhasil diunduh dengan nama file: ${fileName}`);
        };
      } catch (logoError) {
        console.error("Error adding logo to PDF:", logoError);
        // Fall back to saving without the logo
        const formattedDate = new Date().toISOString().split("T")[0];
        const fileName = `Laporan_${student.name.replace(
          /\s+/g,
          "_"
        )}_${formattedDate}.pdf`;
        doc.save(fileName);

        alert(`Laporan berhasil diunduh dengan nama file: ${fileName}`);
      }

      // STUDENT INFORMATION SECTION
      // Add gray background for student info section
      doc.setFillColor(...lightGray);
      doc.rect(10, 45, 190, 50, "F");

      // Add section title with colored rectangle
      doc.setFillColor(...secondaryColor);
      doc.rect(10, 45, 190, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMASI SISWA", 105, 52, { align: "center" });

      // Add student info with better formatting
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Nama:", 15, 67);
      doc.text("Kelas:", 15, 77);
      doc.text("NIS:", 15, 87);

      doc.setFont("helvetica", "normal");
      doc.text(student.name, 45, 67);
      doc.text(student.class, 45, 77);
      doc.text(student.nis || "-", 45, 87);

      // Add performance summary on the right side
      doc.setFont("helvetica", "bold");
      doc.text("Rata-rata Nilai:", 110, 67);
      doc.text("Kemajuan:", 110, 77);

      const avgScore = calculateStudentAverage(student.id);
      doc.setFont("helvetica", "normal");
      doc.text(avgScore, 160, 67);
      doc.text(getStudentProgress(student.id), 160, 77);

      // Add box around the student info
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.rect(10, 45, 190, 50);

      // NILAI MATA PELAJARAN SECTION
      let yPos = 105;

      // Section header with color
      doc.setFillColor(...accentColor);
      doc.rect(10, yPos, 190, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("NILAI PER KATEGORI MATERI", 105, yPos + 7, { align: "center" });

      yPos += 15;
      doc.setTextColor(...textColor);

      // Get pie chart data to create a table
      const pieData = getPieChartData(student.id);

      // Create a table for subject scores
      doc.setFillColor(...lightGray);
      doc.rect(10, yPos, 190, 8, "F");

      // Table headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Kategori", 25, yPos + 5);
      doc.text("Nilai", 150, yPos + 5);

      yPos += 10;

      // Table rows with alternating background
      doc.setFont("helvetica", "normal");
      pieData.labels.forEach((label, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(10, yPos - 4, 190, 8, "F");
        }

        doc.text(label, 25, yPos);

        // Color the score based on value
        const score = pieData.datasets[0].data[index];
        if (score >= 80) {
          doc.setTextColor(...secondaryColor); // Green for good scores
        } else if (score >= 70) {
          doc.setTextColor(...highlightColor); // Yellow for average scores
        } else {
          doc.setTextColor(...accentColor); // Red for poor scores
        }
        doc.text(score.toString(), 150, yPos);
        doc.setTextColor(...textColor); // Reset color

        yPos += 8;
      });

      // Add border around table
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.rect(10, 120, 190, yPos - 112);

      // ANALISIS KEKUATAN & KELEMAHAN
      yPos += 10;

      // Section header with color
      doc.setFillColor(...highlightColor);
      doc.rect(10, yPos, 190, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ANALISIS KEKUATAN & KELEMAHAN", 105, yPos + 7, {
        align: "center",
      });

      yPos += 15;
      doc.setTextColor(...textColor);

      // Get student data for analysis
      const studentScores = scores.filter(
        (score) => score.id_siswa === student.id
      );
      const scoresBySubject = {};
      studentScores.forEach((score) => {
        if (!scoresBySubject[score.sub_kategori]) {
          scoresBySubject[score.sub_kategori] = [];
        }
        scoresBySubject[score.sub_kategori].push(score.nilai);
      });

      // Calculate averages
      const subjectAverages = {};
      Object.keys(scoresBySubject).forEach((subject) => {
        const scores = scoresBySubject[subject];
        subjectAverages[subject] =
          scores.reduce((a, b) => a + b, 0) / scores.length;
      });

      // Find strengths and weaknesses
      const subjects = Object.keys(subjectAverages);
      const strengths = subjects
        .filter((s) => subjectAverages[s] >= 80)
        .slice(0, 3);
      const weaknesses = subjects
        .filter((s) => subjectAverages[s] < 70)
        .slice(0, 3);

      // Draw a split section for strengths and weaknesses
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos, 92, 45, "F");
      doc.rect(108, yPos, 92, 45, "F");

      // Add strengths header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...secondaryColor);
      doc.text("Kekuatan:", 20, yPos + 7);

      // Add strengths content
      doc.setTextColor(...textColor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      if (strengths.length > 0) {
        strengths.forEach((subject, idx) => {
          doc.text(
            `• ${subject}: ${subjectAverages[subject].toFixed(1)}`,
            22,
            yPos + 15 + idx * 7
          );
        });
      } else {
        doc.text("• Belum ada data kekuatan yang signifikan", 22, yPos + 15);
      }

      // Add weaknesses header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accentColor);
      doc.text("Perlu Ditingkatkan:", 118, yPos + 7);

      // Add weaknesses content
      doc.setTextColor(...textColor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      if (weaknesses.length > 0) {
        weaknesses.forEach((subject, idx) => {
          doc.text(
            `• ${subject}: ${subjectAverages[subject].toFixed(1)}`,
            120,
            yPos + 15 + idx * 7
          );
        });
      } else {
        doc.text(
          "• Tidak ada area yang perlu peningkatan signifikan",
          120,
          yPos + 15
        );
      }

      // Draw borders around sections
      doc.setDrawColor(...secondaryColor);
      doc.rect(10, yPos, 92, 45);
      doc.setDrawColor(...accentColor);
      doc.rect(108, yPos, 92, 45);

      // RECOMMENDATION SECTION
      yPos += 55;

      // Section header with color
      doc.setFillColor(...primaryColor);
      doc.rect(10, yPos, 190, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("REKOMENDASI", 105, yPos + 7, { align: "center" });

      yPos += 15;
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Create recommendation cards with different colors
      const recommendations = [
        "Memberikan latihan tambahan pada topik yang perlu ditingkatkan",
        "Menggunakan pendekatan pembelajaran yang lebih visual dan interaktif",
        "Melakukan evaluasi berkala untuk memantau perkembangan",
      ];

      const cardHeight = 20;
      const cardColors = [primaryColor, secondaryColor, highlightColor];

      recommendations.forEach((rec, idx) => {
        // Draw colored rectangle at the left
        doc.setFillColor(...cardColors[idx]);
        doc.rect(10, yPos, 10, cardHeight, "F");

        // Draw light gray rectangle for the content
        doc.setFillColor(...lightGray);
        doc.rect(20, yPos, 180, cardHeight, "F");

        // Add the text
        doc.text(rec, 25, yPos + cardHeight / 2 + 1);

        // Add bullet point number
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text((idx + 1).toString(), 15, yPos + cardHeight / 2 + 1);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "normal");

        yPos += cardHeight + 5;
      });

      // FOOTER SECTION
      // Add a colorful footer
      doc.setFillColor(...primaryColor);
      doc.rect(0, 277, 210, 20, "F");

      // Add footer text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(
        `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        105,
        283,
        { align: "center" }
      );
      doc.text(
        "Math Fun © 2025 - Aplikasi Pembelajaran Matematika Interaktif",
        105,
        289,
        { align: "center" }
      );

      // Add signature section
      yPos = 240;
      doc.setTextColor(...textColor);
      doc.text("Mengetahui,", 150, yPos, { align: "center" });
      doc.text("Guru Matematika", 150, yPos + 7, { align: "center" });

      // Add signature line
      doc.setDrawColor(...textColor);
      doc.line(130, yPos + 25, 170, yPos + 25);

      // Add name
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(teacherProfile.name, 150, yPos + 32, { align: "center" });

      // Add page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        doc.text(`Halaman ${i} dari ${totalPages}`, 185, 270);
      }

      // Save the PDF with a nicely formatted filename
      const formattedDate = new Date().toISOString().split("T")[0];
      const fileName = `Laporan_${student.name.replace(
        /\s+/g,
        "_"
      )}_${formattedDate}.pdf`;
      doc.save(fileName);

      alert(`Laporan berhasil diunduh dengan nama file: ${fileName}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Terjadi kesalahan saat membuat PDF: ${error.message}`);
    }
  };

  // Fungsi untuk mengubah gambar menjadi base64 string
  function getBase64Image(img) {
    // Jika gambar tidak valid atau belum dimuat, return empty string
    if (!img || !img.complete || !img.naturalWidth) {
      console.warn("Image not fully loaded, skipping logo");
      return "";
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 64; // Default width jika tidak tersedia
      canvas.height = img.height || 64; // Default height jika tidak tersedia

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  }
  // Specific function to ensure student has data when report is opened
  const ensureStudentHasData = (studentId) => {
    console.log(`Ensuring data for student ID: ${studentId}`);

    // Check if student already has scores
    const studentScores = scores.filter(
      (score) => score.id_siswa === studentId
    );

    // If student has enough data already, don't need to generate more
    if (studentScores.length >= 8) {
      console.log(
        `Student ${studentId} already has ${studentScores.length} scores, no need to generate more`
      );
      return;
    }

    // Kategori materi - same as in generateDummyData
    const materiCategories = [
      "Bilangan",
      "Pengukuran",
      "Geometri",
      "Statistik",
    ];
    const materiSubcategories = {
      Bilangan: ["Penjumlahan", "Pengurangan", "Perkalian", "Pembagian"],
      Pengukuran: ["Panjang", "Berat", "Waktu", "Luas", "Volume"],
      Geometri: ["Bangun Datar", "Bangun Ruang", "Simetri"],
      Statistik: ["Pengumpulan Data", "Penyajian Data", "Analisis Data"],
    };

    const newScores = [];

    // Generate data for the specific student
    materiCategories.forEach((category) => {
      // Check if student already has data for this category
      const existingCategoryScores = studentScores.filter(
        (score) => score.kategori === category
      );

      // If no scores exist for this category, create main score
      if (existingCategoryScores.length === 0) {
        const baseNilaiKategori = Math.floor(Math.random() * 36) + 60;
        newScores.push({
          id_nilai: `dummy-${studentId}-${category}-main`,
          id_siswa: studentId,
          nilai: baseNilaiKategori,
          kategori: category,
          sub_kategori: `${category} Dasar`,
          keterangan:
            baseNilaiKategori >= 75 ? "Sangat Baik" : "Perlu Ditingkatkan",
          tanggal: new Date(
            2023,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          )
            .toISOString()
            .split("T")[0],
        });
      }

      // Generate subcategory scores if needed
      materiSubcategories[category].forEach((subcategory, index) => {
        // Check if student already has data for this subcategory
        const existingSubScores = studentScores.filter(
          (score) => score.sub_kategori === subcategory
        );

        // If no scores exist for this subcategory, create one
        if (existingSubScores.length === 0) {
          const baseNilai = Math.floor(Math.random() * 36) + 60;

          newScores.push({
            id_nilai: `dummy-${studentId}-${category}-${index}`,
            id_siswa: studentId,
            nilai: baseNilai,
            kategori: category,
            sub_kategori: subcategory,
            keterangan: baseNilai >= 75 ? "Sangat Baik" : "Perlu Ditingkatkan",
            tanggal: new Date(
              2023,
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            )
              .toISOString()
              .split("T")[0],
          });
        }
      });
    });

    // Update scores state
    if (newScores.length > 0) {
      setScores((prevScores) => [...prevScores, ...newScores]);
      console.log(
        `Generated ${newScores.length} new scores for student ${studentId}`
      );
    }
  };

  // Function to ensure all students in a class have data
  const ensureClassStudentsHaveData = (classId) => {
    console.log(`Ensuring all students in class ${classId} have data`);

    // Find students in this class
    const classStudents = students.filter((s) => {
      const studentClassNum = s.class.match(/\d+/)?.[0];
      return studentClassNum && parseInt(studentClassNum) === parseInt(classId);
    });

    // Generate data for each student in the class
    classStudents.forEach((student) => {
      ensureStudentHasData(student.id);
    });
  };

  // Function to fetch game progress data for reports
  const fetchGameProgressData = async (classId) => {
    setLoadingProgress(true);
    try {
      // First, get all students in the selected class
      const classStudents = students.filter((s) => {
        const studentClassNum = s.class.match(/\d+/)?.[0];
        return (
          studentClassNum && parseInt(studentClassNum) === parseInt(classId)
        );
      });

      // Get student IDs for the selected class
      const studentIds = classStudents.map((student) => student.id);

      if (studentIds.length === 0) {
        setGameProgressData({});
        setLoadingProgress(false);
        return;
      }

      // Fetch game progress data from the database for these students
      const { data, error } = await supabase
        .from("game_progress")
        .select("*")
        .in("id_siswa", studentIds);

      if (error) {
        console.error("Error fetching game progress:", error);
        throw error;
      }

      // Process data for each student
      const progressByStudent = {};

      data.forEach((progress) => {
        // Initialize student data if not exists
        if (!progressByStudent[progress.id_siswa]) {
          progressByStudent[progress.id_siswa] = {
            scores: [],
            totalScore: 0,
            completedLevels: 0,
            averageScore: 0,
          };
        }

        // Add score to student data
        progressByStudent[progress.id_siswa].scores.push(progress.skor);
        progressByStudent[progress.id_siswa].totalScore += progress.skor;

        // Count completed level if status_selesai is true
        if (progress.status_selesai) {
          progressByStudent[progress.id_siswa].completedLevels += 1;
        }
      });

      // Calculate averages and set data
      Object.keys(progressByStudent).forEach((studentId) => {
        const student = progressByStudent[studentId];
        student.averageScore =
          student.scores.length > 0
            ? Math.round(student.totalScore / student.scores.length)
            : 0;
      });

      setGameProgressData(progressByStudent);
    } catch (error) {
      console.error("Error in fetchGameProgressData:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Calculate student average score based on game progress data
  const calculateStudentAverage = (studentId) => {
    if (!gameProgressData[studentId]) {
      return "0";
    }
    return gameProgressData[studentId].averageScore.toString();
  };

  // Calculate class average score
  const calculateClassAverage = (classId) => {
    const classStudents = students.filter((s) => {
      const studentClassNum = s.class.match(/\d+/)?.[0];
      return studentClassNum && parseInt(studentClassNum) === parseInt(classId);
    });

    let totalAverage = 0;
    let studentsWithScores = 0;

    classStudents.forEach((student) => {
      if (
        gameProgressData[student.id] &&
        gameProgressData[student.id].scores.length > 0
      ) {
        totalAverage += gameProgressData[student.id].averageScore;
        studentsWithScores++;
      }
    });

    return studentsWithScores > 0
      ? Math.round(totalAverage / studentsWithScores).toString()
      : "0";
  };

  // Get student progress percentage
  const getStudentProgress = (studentId) => {
    if (!gameProgressData[studentId]) {
      return "0%";
    }

    // For this example, we'll use completed levels as a measure of progress
    // You can adjust this calculation based on your specific requirements
    const completedLevels = gameProgressData[studentId].completedLevels;

    // Assuming there's a total of 20 levels across all classes/chapters
    // You may need to adjust this value based on your curriculum
    const totalLevels = 20;

    const progressPercentage = Math.min(
      100,
      Math.round((completedLevels / totalLevels) * 100)
    );
    return `${progressPercentage}%`;
  };

  // Effect to fetch game progress data when report class is selected
  useEffect(() => {
    if (selectedReportClass) {
      fetchGameProgressData(selectedReportClass);
    }
  }, [selectedReportClass]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "daftar":
        const filteredStudents = filterStudents();
        return (
          <div className="student-list">
            <div className="search-filter-container">
              {" "}
              <div className="search-bar">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    id="search-siswa"
                    name="search-siswa"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="filter-dropdown">
                {" "}
                <select
                  id="filter-kelas"
                  name="filter-kelas"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="filter-select"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {teacherProfile.kelas &&
                    teacherProfile.kelas
                      .sort((a, b) => {
                        // Extract numbers from class names for proper sorting
                        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                        return numA - numB;
                      })
                      .map((kelas, index) => (
                        <option key={index} value={kelas}>
                          {kelas}
                        </option>
                      ))}
                </select>
                <button className="filter-button">
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>
            </div>{" "}
            <div className="students-container">
              {loading ? (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i> Memuat data
                  siswa...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="no-students">
                  Tidak ada siswa yang ditemukan
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div className="student-card" key={student.id}>
                    <div className="student-avatar">
                      <img
                        src={getStudentAvatar(student)}
                        alt={`${student.name} avatar`}
                      />
                    </div>{" "}
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      <p>
                        {student.class} | NIS: {student.nis}
                      </p>
                      <p className="parent-info">
                        <span className="parent-label">Wali Murid: </span>
                        {student.parentStatus === "linked" ? (
                          <span className="linked">{student.parent}</span>
                        ) : (
                          <span className="unlinked">Belum ditautkan</span>
                        )}
                      </p>
                    </div>{" "}
                    <div className="student-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditStudent(student)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        className="action-button tugas"
                        onClick={() => handleViewHistory(student)}
                      >
                        Riwayat
                      </button>
                      <button
                        className="action-button hapus"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>{" "}
            <div className="add-student-container" onClick={handleAddStudent}>
              <div className="add-student-card">
                <div className="add-icon">+</div>
                <p>Tambah Siswa Baru</p>
                <small>Klik untuk menambahkan siswa baru ke dalam kelas</small>
              </div>
            </div>
            <div className="pagination">
              <button className="pagination-prev">&lt;</button>
              <button className="pagination-number active">1</button>
              <button className="pagination-number">2</button>
              <button className="pagination-number">3</button>
              <button className="pagination-next">&gt;</button>
            </div>
          </div>
        );

      case "kelas":
        return (
          <div className="student-list">
            <div className="search-filter-container">
              <div className="search-bar">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="filter-dropdown">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="filter-select"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {teacherProfile.kelas &&
                    teacherProfile.kelas
                      .sort((a, b) => {
                        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                        return numA - numB;
                      })
                      .map((kelas, index) => (
                        <option key={index} value={kelas}>
                          {kelas}
                        </option>
                      ))}
                </select>
                <button className="filter-button">
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>
            </div>

            <div className="students-container">
              {loading ? (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i> Memuat data
                  siswa...
                </div>
              ) : students.filter(
                  (s) =>
                    (selectedClass === "Semua Kelas" ||
                      s.class === selectedClass) &&
                    (searchQuery === "" ||
                      s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 ? (
                <div className="no-students">
                  Tidak ada siswa yang ditemukan
                </div>
              ) : (
                students
                  .filter(
                    (s) =>
                      (selectedClass === "Semua Kelas" ||
                        s.class === selectedClass) &&
                      (searchQuery === "" ||
                        s.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
                  )
                  .map((student) => (
                    <div className="student-card" key={student.id}>
                      <div className="student-avatar">
                        <img
                          src={getStudentAvatar(student)}
                          alt={`${student.name} avatar`}
                        />
                      </div>
                      <div className="student-info">
                        <h3>{student.name}</h3>
                        <p>
                          {student.class} | NIS: {student.nis}
                        </p>
                        <p className="parent-info">
                          <span className="parent-label">Wali Murid: </span>
                          {student.parentStatus === "linked" ? (
                            <span className="linked">{student.parent}</span>
                          ) : (
                            <span className="unlinked">Belum ditautkan</span>
                          )}
                        </p>
                      </div>
                      <div className="student-actions">
                        <button
                          className="action-button naik-kelas"
                          onClick={() => handleNaikKelas(student)}
                          style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            marginRight: "8px",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#45a049";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.15)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#4CAF50";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          <i
                            className="fas fa-arrow-up"
                            style={{ fontSize: "12px" }}
                          ></i>
                          Naik Kelas
                        </button>
                        <button
                          className="action-button pindah-kelas"
                          onClick={() => handlePindahKelas(student)}
                          style={{
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#1976D2";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.15)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#2196F3";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          <i
                            className="fas fa-exchange-alt"
                            style={{ fontSize: "12px" }}
                          ></i>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        );

      case "catatan":
        return (
          <div className="student-list">
            <div className="search-filter-container">
              <div className="search-bar">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="filter-dropdown">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="filter-select"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {teacherProfile.kelas &&
                    teacherProfile.kelas

                      .sort((a, b) => {
                        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
                        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
                        return numA - numB;
                      })
                      .map((kelas, index) => (
                        <option key={index} value={kelas}>
                          {kelas}
                        </option>
                      ))}
                </select>
                <button className="filter-button">
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>
            </div>

            <div className="students-container">
              {loading ? (
                <div className="loading">
                  <i className="fas fa-spinner fa-spin"></i> Memuat data
                  siswa...
                </div>
              ) : students.filter(
                  (s) =>
                    (selectedClass === "Semua Kelas" ||
                      s.class === selectedClass) &&
                    (searchQuery === "" ||
                      s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 ? (
                <div className="no-students">
                  Tidak ada siswa yang ditemukan
                </div>
              ) : (
                students
                  .filter(
                    (s) =>
                      (selectedClass === "Semua Kelas" ||
                        s.class === selectedClass) &&
                      (searchQuery === "" ||
                        s.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
                  )
                  .map((student) => (
                    <div className="student-card" key={student.id}>
                      <div className="student-avatar">
                        <img
                          src={getStudentAvatar(student)}
                          alt={`${student.name} avatar`}
                        />
                      </div>
                      <div className="student-info">
                        <h3>{student.name}</h3>
                        <p>
                          {student.class} | NIS: {student.nis}
                        </p>
                        <p className="parent-info">
                          <span className="parent-label">Wali Murid: </span>
                          {student.parentStatus === "linked" ? (
                            <span className="linked">{student.parent}</span>
                          ) : (
                            <span className="unlinked">Belum ditautkan</span>
                          )}
                        </p>
                      </div>
                      <div className="student-actions">
                        <button
                          className="action-button catatan"
                          onClick={() =>
                            handleSendNote(student.id, student.name)
                          }
                        >
                          <i className="fas fa-comment-alt"></i> Kirim Catatan
                        </button>
                        <button
                          className="action-button lihat-catatan"
                          onClick={() => handleLihatCatatan(student)}
                        >
                          <i className="fas fa-eye"></i> Lihat Catatan
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        );

      case "laporan":
        return (
          <div className="reports">
            <h2>Laporan</h2>
            <div className="report-filters">
              <div className="filter-group">
                <label>Pilih Kelas:</label>
                <select
                  value={selectedReportClass || ""}
                  onChange={(e) =>
                    setSelectedReportClass(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                >
                  <option value="">-- Pilih Kelas --</option>
                  {teacherProfile.kelas.map((kelas, index) => {
                    // Extract class number (e.g., "Kelas 4" -> "4")
                    const classNum = kelas.match(/\d+/)?.[0];
                    return classNum ? (
                      <option key={index} value={classNum}>
                        {kelas}
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
            </div>

            {selectedReportClass && (
              <div className="report-content">
                <div
                  className="class-summary"
                  style={{ backgroundColor: "white" }}
                >
                  <h3>Ringkasan Kelas</h3>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Siswa:</span>
                      <span className="stat-value">
                        {
                          students.filter((s) => {
                            const studentClassNum = s.class.match(/\d+/)?.[0];
                            return (
                              studentClassNum &&
                              parseInt(studentClassNum) ===
                                parseInt(selectedReportClass)
                            );
                          }).length
                        }
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Rata-rata Nilai:</span>
                      <span className="stat-value">
                        {calculateClassAverage(selectedReportClass)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="student-reports">
                  <h3>Laporan Per Siswa</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Nama Siswa</th>
                        <th>Rata-rata Nilai</th>
                        <th>Kemajuan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((s) => {
                          const studentClassNum = s.class.match(/\d+/)?.[0];
                          return (
                            studentClassNum &&
                            parseInt(studentClassNum) ===
                              parseInt(selectedReportClass)
                          );
                        })
                        .map((student) => (
                          <tr key={student.id}>
                            <td>{student.name}</td>
                            <td>{calculateStudentAverage(student.id)}</td>
                            <td>{getStudentProgress(student.id)}</td>
                            <td>
                              <button
                                onClick={() => handleViewReport(student.id)}
                              >
                                <i className="fas fa-file-alt"></i> Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>No content available</div>;
    }
  };

  // Add getStudentAvatar function at the top of the component
  const getStudentAvatar = (student) => {
    const animalAvatars = {
      Anjing: "/src/assets/anjing.png",
      Babi: "/src/assets/babi.png",
      Bebek: "/src/assets/bebek.png",
      Gurita: "/src/assets/gurita.png",
      Harimau: "/src/assets/harimau.png",
      Kelinci: "/src/assets/kelinci.png",
      Kucing: "/src/assets/kucing.png",
      Sapi: "/src/assets/sapi.png",
      Serigala: "/src/assets/serigala.png",
      Singa: "/src/assets/singa.png",
    };

    // Check if student has an avatar set

    if (student?.avatar && animalAvatars[student.avatar]) {
      return animalAvatars[student.avatar];
    }

    // Fallback to gender-based avatar if no animal avatar is set
    return student?.gender === "P"
      ? "/src/assets/perempuan.png"
      : "/src/assets/laki.png";
  };

  const handleStudentUpdate = () => {
    // Refresh the students list after update
    fetchStudents();
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      student: null,
    });
  };

  const handleEditStudent = (student) => {
    setEditModal({
      isOpen: true,
      student: student,
    });
  };

  // Effect to ensure data is generated when class is selected in report tab
  useEffect(() => {
    if (selectedReportClass) {
      console.log(
        `Class ${selectedReportClass} selected, generating data for all students`
      );
      ensureClassStudentsHaveData(selectedReportClass);
    }
  }, [selectedReportClass]);

  return (
    <div
      className="guru-dashboard"
      style={{
        minHeight: "100vh",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        background: "white",
        position: "relative",
        overflowY: "auto", // Add overflow-y: auto to enable vertical scrolling
        maxHeight: "100vh", // Ensure the container doesn't exceed the viewport height
      }}
    >
      {/* Header */}
      <header
        className="header-guru-pages"
        style={{
          borderRadius: "0",
          position: "sticky",
          top: "0",
          zIndex: "100",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div className="logo" style={{ flex: "0 1 auto" }}>
          <i className="fas fa-chalkboard-teacher logo-icon"></i>
          <h1>Math Fun - Profil Guru</h1>
        </div>
        <div className="header-actions" style={{ flex: "0 0 auto" }}>
          <button
            className="logout-button-guru"
            onClick={handleLogout}
            style={{ whiteSpace: "nowrap" }}
          >
            <i className="fas fa-sign-out-alt icon-margin"></i> Logout
          </button>
        </div>
      </header>
      {/* Main content container */}
      <div
        style={{
          padding: "0 20px",
          flex: "1 1 auto",
          position: "relative",
        }}
      >
        {/* Teacher Profile */}
        <div className="profile-container">
          <div className="profile-avatar">
            <img src="/src/assets/icon_guru.png" alt="Profile" />
          </div>
          <div className="profile-info">
            {loading ? (
              <div className="loading-profile">
                <i className="fas fa-spinner fa-spin"></i> Memuat data guru...
              </div>
            ) : (
              <>
                <h2>{teacherProfile.name}</h2>
                <p>
                  {teacherProfile.role} - {teacherProfile.school}
                </p>
                <div className="contact-info">
                  <a
                    href={`mailto:${teacherProfile.email}`}
                    className="email-link"
                  >
                    <i className="fas fa-envelope"></i> {teacherProfile.email}
                  </a>
                  <a
                    href={`tel:${teacherProfile.phone}`}
                    className="phone-link"
                  >
                    <i className="fas fa-phone"></i> {teacherProfile.phone}
                  </a>
                  <span className="student-count">
                    <i className="fas fa-user-graduate"></i>{" "}
                    {teacherProfile.studentCount} Siswa
                  </span>
                </div>
              </>
            )}
          </div>
          <button className="edit-profile-button">
            <i className="fas fa-edit"></i> Edit Profil
          </button>
        </div>{" "}
        {/* Navigation Tabs */}{" "}
        <nav className="tabs-nav">
          <button
            className={`tab-button ${activeTab === "daftar" ? "active" : ""}`}
            onClick={() => setActiveTab("daftar")}
          >
            <i className="fas fa-users tab-icon"></i> Kelola Siswa
          </button>
          <button
            className={`tab-button ${activeTab === "kelas" ? "active" : ""}`}
            onClick={() => setActiveTab("kelas")}
          >
            <i className="fas fa-chalkboard tab-icon"></i> Kelola Kelas
          </button>
          <button
            className={`tab-button ${activeTab === "materi" ? "active" : ""}`}
            onClick={() => setActiveTab("materi")}
          >
            <i className="fas fa-book tab-icon"></i> Kelola Materi
          </button>
          <button
            className={`tab-button ${activeTab === "catatan" ? "active" : ""}`}
            onClick={() => setActiveTab("catatan")}
          >
            <i className="fas fa-comment-alt tab-icon"></i> Kirim Catatan
          </button>
          <button
            className={`tab-button ${activeTab === "laporan" ? "active" : ""}`}
            onClick={() => setActiveTab("laporan")}
          >
            <i className="fas fa-chart-bar tab-icon"></i> Laporan
          </button>{" "}
        </nav>
        {/* Tab Content */}
        <div className="tab-content">{renderTabContent()}</div>
        {/* Student History Modal */}
        <StudentHistoryModal
          isOpen={historyModal.isOpen}
          onClose={closeHistoryModal}
          student={historyModal.student}
        />
        {/* Modal Catatan */}
        <ModalCatatan
          isOpen={modalCatatan.isOpen}
          onClose={closeModalCatatan}
          studentId={modalCatatan.studentId}
          teacherId={currentUserId}
          studentName={modalCatatan.studentName}
        />
        {/* Add ModalLihatCatatan */}
        <ModalLihatCatatan
          isOpen={lihatCatatanModal.isOpen}
          onClose={closeLihatCatatanModal}
          student={lihatCatatanModal.student}
          notes={lihatCatatanModal.notes}
          onDeleteNote={handleDeleteNote}
        />
        {/* Edit Student Modal */}
        <EditStudentModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          student={editModal.student}
          onUpdate={handleStudentUpdate}
        />
        {/* Add Student Modal */}
        <AddStudentModal
          isOpen={addModal.isOpen}
          onClose={closeAddModal}
          onAdd={handleStudentAdd}
        />
        {/* Kelas Modal */}
        <KelasModal
          isOpen={kelasModal.isOpen}
          onClose={() =>
            setKelasModal({
              isOpen: false,
              type: null,
              student: null,
              availableClasses: [],
            })
          }
          student={kelasModal.student}
          availableClasses={kelasModal.availableClasses}
          onConfirm={handleKelasConfirm}
          type={kelasModal.type}
        />
        {/* Report Modal */}
        {reportModal.isOpen && (
          <div className="report-modal">
            <div className="modal-content">
              <span className="close" onClick={closeReportModal}>
                &times;
              </span>
              <div
                className="modal-header-actions"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h2>Laporan Siswa: {reportModal.student.name}</h2>
                <button
                  className="print-report-button"
                  onClick={() => printReportToPDF(reportModal.student)}
                  style={{
                    backgroundColor: "#4285F4",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 15px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    boxShadow: "0  2px 5px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <i className="fas fa-download"></i> Download PDF
                </button>
              </div>

              {/* Printable report content */}

              <div id="report-content" className="printable-report">
                <div
                  className="report-header"
                  style={{
                    borderBottom: "2px solid #ddd",
                    marginBottom: "15px",
                    paddingBottom: "10px",
                  }}
                >
                  <div
                    className="school-logo"
                    style={{ textAlign: "center", marginBottom: "10px" }}
                  >
                    <img
                      src="/src/assets/logo.png"
                      alt="Logo Sekolah"
                      style={{ height: "60px", marginBottom: "5px" }}
                    />
                    <h3 style={{ margin: "5px 0" }}>SDN Kedoya Utara 03</h3>
                    <p style={{ margin: "0", fontSize: "14px" }}>
                      Laporan Pembelajaran Siswa
                    </p>
                  </div>
                </div>

                <div className="report-details">
                  <div className="detail-item">
                    <span className="detail-label">Nama:</span>
                    <span className="detail-value">
                      {reportModal.student.name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Kelas:</span>
                    <span className="detail-value">
                      {reportModal.student.class}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">NIS:</span>
                    <span className="detail-value">
                      {reportModal.student.nis}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rata-rata Nilai:</span>
                    <span className="detail-value">
                      {calculateStudentAverage(reportModal.student.id)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Kemajuan:</span>
                    <span className="detail-value">
                      {getStudentProgress(reportModal.student.id)}
                    </span>
                  </div>
                </div>

                <div className="chart-container">
                  <h3>Rata-rata Nilai per Materi</h3>
                  <div
                    style={{
                      height: "300px",
                      position: "relative",
                      width: "100%",
                      maxWidth: "350px",
                      margin: "0 auto",
                    }}
                  >
                    <Pie
                      data={getPieChartData(reportModal.student.id)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div
                  className="chart-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                    marginTop: "20px",
                  }}
                >
                  <div className="chart-container">
                    <h3>Perkembangan Nilai Siswa</h3>
                    <div style={{ height: "250px", position: "relative" }}>
                      <Line
                        data={getProgressLineChartData(reportModal.student.id)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              min: 50,
                              max: 100,
                            },
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                title: function (context) {
                                  return "Bulan: " + context[0].label;
                                },
                                label: function (context) {
                                  return "Nilai: " + context.parsed.y;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="chart-container">
                    <h3>Perbandingan Nilai per Topik</h3>
                    <div style={{ height: "250px", position: "relative" }}>
                      <Bar
                        data={getTopicComparisonData(reportModal.student.id)}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: "y",
                          scales: {
                            x: {
                              beginAtZero: false,
                              min: 50,
                              max: 100,
                              grid: {
                                display: false,
                              },
                            },
                            y: {
                              grid: {
                                display: false,
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                boxWidth: 12,
                                padding: 15,
                                usePointStyle: true,
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  return (
                                    context.dataset.label +
                                    ": " +
                                    context.parsed.x
                                  );
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="student-strengths-weaknesses"
                  style={{
                    marginTop: "20px",
                    backgroundColor: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3>Analisis Kekuatan dan Kelemahan</h3>

                  {(() => {
                    // Analyze student data to find strengths and weaknesses
                    const studentScores = scores.filter(
                      (score) => score.id_siswa === reportModal.student.id
                    );

                    // Group scores by subcategory
                    const scoresBySubject = {};
                    studentScores.forEach((score) => {
                      if (!scoresBySubject[score.sub_kategori]) {
                        scoresBySubject[score.sub_kategori] = [];
                      }
                      scoresBySubject[score.sub_kategori].push(score.nilai);
                    });

                    // Calculate averages
                    const subjectAverages = {};

                    Object.keys(scoresBySubject).forEach((subject) => {
                      const scores = scoresBySubject[subject];
                      subjectAverages[subject] =
                        scores.reduce((a, b) => a + b, 0) / scores.length;
                    });

                    // Find strengths and weaknesses
                    const subjects = Object.keys(subjectAverages);
                    const strengths = subjects
                      .filter((s) => subjectAverages[s] >= 80)
                      .slice(0, 3);
                    const weaknesses = subjects
                      .filter((s) => subjectAverages[s] < 70)
                      .slice(0, 3);

                    return (
                      <div
                        className="strengths-weaknesses-container"
                        style={{
                          display: "flex",
                          gap: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          className="strengths"
                          style={{ flex: 1, minWidth: "250px" }}
                        >
                          <h4 style={{ color: "#4CAF50" }}>Kekuatan</h4>
                          {strengths.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: "0" }}>
                              {strengths.map((subject) => (
                                <li
                                  key={subject}
                                  style={{
                                    padding: "8px",
                                    margin: "5px 0",
                                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                                    borderLeft: "3px solid #4CAF50",
                                    borderRadius: "3px",
                                  }}
                                >
                                  <span style={{ fontWeight: "bold" }}>
                                    {subject}:
                                  </span>{" "}
                                  {subjectAverages[subject].toFixed(1)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>Belum ada data kekuatan yang signifikan</p>
                          )}
                        </div>

                        <div
                          className="weaknesses"
                          style={{ flex: 1, minWidth: "250px" }}
                        >
                          <h4 style={{ color: "#F44336" }}>
                            Perlu Ditingkatkan
                          </h4>
                          {weaknesses.length > 0 ? (
                            <ul style={{ listStyleType: "none", padding: "0" }}>
                              {weaknesses.map((subject) => (
                                <li
                                  key={subject}
                                  style={{
                                    padding: "8px",
                                    margin: "5px 0",
                                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                                    borderLeft: "3px solid #F44336",
                                    borderRadius: "3px",
                                  }}
                                >
                                  <span style={{ fontWeight: "bold" }}>
                                    {subject}:
                                  </span>{" "}
                                  {subjectAverages[subject].toFixed(1)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>
                              Tidak ada area yang perlu peningkatan signifikan
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div
                    className="recommendations"
                    style={{ marginTop: "15px" }}
                  >
                    <h4>Rekomendasi</h4>
                    <p>
                      Berdasarkan analisis data, siswa dapat meningkatkan
                      pemahaman materi dengan:
                    </p>
                    <ul>
                      <li>
                        Memberikan latihan tambahan pada topik yang perlu
                        ditingkatkan
                      </li>
                      <li>
                        Menggunakan pendekatan pembelajaran yang lebih visual
                        dan interaktif
                      </li>
                      <li>
                        Melakukan evaluasi berkala untuk memantau perkembangan
                      </li>
                    </ul>
                  </div>
                </div>

                <div
                  className="report-footer"
                  style={{
                    marginTop: "30px",
                    textAlign: "right",
                    paddingTop: "20px",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  <p>
                    Tanggal Cetak:{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div style={{ marginTop: "30px" }}>
                    <p>Tanda Tangan Guru</p>
                    <div style={{ marginTop: "40px" }}>
                      <p>{teacherProfile.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabGuru;
