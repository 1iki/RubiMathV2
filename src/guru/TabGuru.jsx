import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import "./guru.css";
import StudentHistoryModal from "./StudentHistoryModal";
import ModalCatatan from './components/ModalCatatan';
import ModalLihatCatatan from './components/ModalLihatCatatan';
import EditStudentModal from './components/EditStudentModal';
import AddStudentModal from './components/AddStudentModal';
import KelasModal from './components/KelasModal';

const TabGuru = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daftar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [students, setStudents] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState({
    name: "agung",
    role: "Guru Matematika",
    school: "SDN Merdeka 01",
    email: "siti.rahayu@sdnmerdeka01.sch.id",
    phone: "+62 812-3456-7890",
    studentCount: 0,
    kelas: [], // Will be populated from database
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    student: null
  });
  const [classes, setClasses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [scores, setScores] = useState([]);
  const [kemajuan, setKemajuan] = useState([]);
  const [modalCatatan, setModalCatatan] = useState({
    isOpen: false,
    studentId: null,
    studentName: ''
  });
  const [lihatCatatanModal, setLihatCatatanModal] = useState({
    isOpen: false,
    student: null,
    notes: []
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    student: null
  });
  const [addModal, setAddModal] = useState({
    isOpen: false
  });
  const [kelasModal, setKelasModal] = useState({
    isOpen: false,
    type: null, // 'naik' or 'pindah'
    student: null,
    availableClasses: []
  });

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
          .from('kelas')
          .select('*')
          .eq('id_guru', currentUserId);

        if (classesError) throw classesError;
        setClasses(classesData || []);

        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('siswa')
          .select('*');

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('catatan')
          .select(`
            *,
            siswa_catatan!inner(*)
          `)
          .eq('id_guru', currentUserId);

        if (notesError) throw notesError;
        setNotes(notesData || []);

        // Fetch scores
        const { data: scoresData, error: scoresError } = await supabase
          .from('nilai')
          .select('*');

        if (scoresError) throw scoresError;
        setScores(scoresData || []);

        // Fetch kemajuan
        const { data: kemajuanData, error: kemajuanError } = await supabase
          .from('kemajuan')
          .select('*');

        if (kemajuanError) throw kemajuanError;
        setKemajuan(kemajuanData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Terjadi kesalahan saat memuat data');
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
            kelasArray = data.kelas.split(",").map(k => normalizeClass(k.trim()));
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
          school: "SDN Merdeka 01", // Use a default value or fetch from a settings table
          email: data.email || teacherProfile.email,
          phone: data.no_telp || teacherProfile.phone,
          kelas: kelasArray,
          studentCount: 0 // Will be updated after fetching students
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
      const { data, error } = await supabase
        .from('siswa')
        .select(`
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
      const formattedStudents = data.map(student => {
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
          updated_at: student.updated_at
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
        avatar: "../src/assets/laki.png",
      });

      sampleStudents.push({
        id: `sample-${index}-2`,
        name: `Ani ${classNumber || index + 1}`, // e.g. "Ani 1"
        class: kelas,
        age: classAge,
        parent: index % 2 === 1 ? "Rina Wijayanti" : "Belum ditautkan",
        parentStatus: index % 2 === 1 ? "linked" : "unlinked",
        avatar: "./src/assets/perempuan.png",
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
      isOpen: true
    });
  };

  const closeAddModal = () => {
    setAddModal({
      isOpen: false
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
      avatar: newStudent.avatar
    };

    // Add the new student to the state
    setStudents(prev => [...prev, formattedStudent]);
    
    // Update teacher profile student count
    setTeacherProfile(prev => ({
      ...prev,
      studentCount: prev.studentCount + 1
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
      studentName
    });
  };

  const handleViewHistory = (student) => {
    setHistoryModal({
      isOpen: true,
      student: student
    });
  };

  const closeHistoryModal = () => {
    setHistoryModal({
      isOpen: false,
      student: null
    });
  };

  const handleViewReport = (studentId) => {
    alert(`Lihat laporan siswa ID: ${studentId}`);
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
      studentName: ''
    });
  };

  const handleLihatCatatan = (student) => {
    const studentNotes = notes.filter(n => 
      n.siswa_catatan[0]?.id_siswa === student.id
    );
    
    setLihatCatatanModal({
      isOpen: true,
      student: student,
      notes: studentNotes
    });
  };

  const closeLihatCatatanModal = () => {
    setLihatCatatanModal({
      isOpen: false,
      student: null,
      notes: []
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
        const updatedNotes = notes.filter(note => note.id_catatan !== noteId);
        setNotes(updatedNotes);

        // Also update the notes shown in the open modal if it's for the same student
        // This logic needs to be adjusted to filter notes correctly based on the student in the modal
        setLihatCatatanModal(prevState => {
          if (prevState.isOpen && prevState.student) {
            const studentIdInModal = prevState.student.id;
            const filteredNotesForModal = updatedNotes.filter(note => 
              note.siswa_catatan && note.siswa_catatan.length > 0 && 
              note.siswa_catatan.some(sc => sc.id_siswa === studentIdInModal)
            );
            return {
              ...prevState,
              notes: filteredNotesForModal
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

  const handleNaikKelas = async (student) => {
    try {
      // Get current class number
      const currentClass = student.class.match(/\d+/)[0];
      const nextClass = parseInt(currentClass) + 1;
      
      // Check if next class exists and is within valid range (1-6)
      if (nextClass > 6) {
        alert('Siswa sudah berada di kelas tertinggi');
        return;
      }

      // Get available higher classes from kelas table
      const { data: availableClasses, error } = await supabase
        .from('kelas')
        .select('nama_kelas')
        .gt('id_kelas', parseInt(currentClass))
        .lte('id_kelas', 6)
        .order('id_kelas', { ascending: true });

      if (error) throw error;

      if (!availableClasses || availableClasses.length === 0) {
        alert('Tidak ada kelas yang tersedia untuk kenaikan kelas');
        return;
      }

      setKelasModal({
        isOpen: true,
        type: 'naik',
        student: student,
        availableClasses: availableClasses.map(k => k.nama_kelas)
      });

    } catch (error) {
      console.error('Error in handleNaikKelas:', error);
      alert('Terjadi kesalahan saat memproses kenaikan kelas');
    }
  };

  const handlePindahKelas = async (student) => {
    try {
      const currentClassNumber = student.class.match(/\d+/)[0];

      // Get all available classes from kelas table except current
      const { data: availableClasses, error } = await supabase
        .from('kelas')
        .select('nama_kelas')
        .neq('id_kelas', parseInt(currentClassNumber))
        .order('id_kelas', { ascending: true });

      if (error) throw error;

      if (!availableClasses || availableClasses.length === 0) {
        alert('Tidak ada kelas lain yang tersedia untuk pemindahan');
        return;
      }

      setKelasModal({
        isOpen: true,
        type: 'pindah',
        student: student,
        availableClasses: availableClasses.map(k => k.nama_kelas)
      });

    } catch (error) {
      console.error('Error in handlePindahKelas:', error);
      alert('Terjadi kesalahan saat memproses pemindahan kelas');
    }
  };

  const handleKelasConfirm = async (targetClass) => {
    const student = kelasModal.student;
    const targetClassNumber = targetClass.match(/\d+/)[0];

    try {
      // Get the target kelas ID first
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select('id_kelas')
        .eq('nama_kelas', targetClass)
        .single();

      if (kelasError) throw kelasError;
      if (!kelasData) throw new Error('Kelas tidak ditemukan');

      // Update student's class in database
      const { error: updateError } = await supabase
        .from('siswa')
        .update({ 
          id_kelas: kelasData.id_kelas,
          updated_at: new Date().toISOString()
        })
        .eq('id_siswa', student.id);

      if (updateError) throw updateError;

      // Update UI
      setStudents(students.map(s => 
        s.id === student.id 
          ? { ...s, class: targetClass }
          : s
      ));

      const action = kelasModal.type === 'naik' ? 'dinaikkan ke' : 'dipindahkan ke';
      alert(`${student.name} berhasil ${action} ${targetClass}`);
      
      // Close modal and reset state
      setKelasModal({
        isOpen: false,
        type: null,
        student: null,
        availableClasses: []
      });

    } catch (error) {
      console.error('Error dalam mengubah kelas:', error);
      alert('Gagal mengubah kelas: ' + error.message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "daftar":
        const filteredStudents = filterStudents();
        return (
          <div className="tabguru-student-list">
            <div className="tabguru-search-filter-container">
              <div className="tabguru-search-bar">
                <div className="tabguru-search-input-wrapper">
                  <i className="fas fa-search tabguru-search-icon"></i>
                  <input
                    type="text"
                    id="search-siswa"
                    name="search-siswa"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="tabguru-search-input"
                  />
                </div>
              </div>
              <div className="tabguru-filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="tabguru-filter-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    id="filter-kelas"
                    name="filter-kelas"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="tabguru-filter-select"
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
                  <button className="tabguru-filter-button">
                    <i className="fas fa-filter"></i> Filter
                  </button>
                  <button 
                    className="tabguru-add-student-button"
                    onClick={() => setAddModal({ isOpen: true })}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: '#white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      height: '40px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#45a049';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#4CAF50';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <i className="fas fa-plus" style={{ fontSize: '14px' }}></i>
                    Tambah Siswa
                  </button>
                </div>
              </div>
            </div>
            <div className="tabguru-students-container">
              {loading ? (
                <div className="tabguru-loading">
                  <i className="fas fa-spinner fa-spin"></i> Memuat data siswa...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="tabguru-no-students">
                  Tidak ada siswa yang ditemukan
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div className="tabguru-student-card" key={student.id}>
                    <div className="tabguru-student-avatar">
                      <img
                        src={getStudentAvatar(student)}
                        alt={`${student.name} avatar`}
                      />
                    </div>
                    <div className="tabguru-student-info">
                      <h3>{student.name}</h3>
                      <p>
                        {student.class} | NIS: {student.nis}
                      </p>
                      <p className="tabguru-parent-info">
                        <span className="tabguru-parent-label">Wali Murid: </span>
                        {student.parentStatus === "linked" ? (
                          <span className="tabguru-linked">{student.parent}</span>
                        ) : (
                          <span className="tabguru-unlinked">Belum ditautkan</span>
                        )}
                      </p>
                    </div>
                    <div className="tabguru-student-actions">
                      <button
                        className="tabguru-action-button tabguru-edit"
                        onClick={() => handleEditStudent(student)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        className="tabguru-action-button tabguru-tugas"
                        onClick={() => handleViewHistory(student)}
                      >
                        Riwayat
                      </button>
                      <button
                        className="tabguru-action-button tabguru-hapus"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="tabguru-pagination">
              <button className="tabguru-pagination-prev">&lt;</button>
              <button className="tabguru-pagination-number tabguru-pagination-active">1</button>
              <button className="tabguru-pagination-number">2</button>
              <button className="tabguru-pagination-number">3</button>
              <button className="tabguru-pagination-next">&gt;</button>
            </div>
          </div>
        );

      case "kelas":
        return (
          <div className="tabguru-student-list">
            <div className="tabguru-search-filter-container">
              <div className="tabguru-search-bar">
                <div className="tabguru-search-input-wrapper">
                  <i className="fas fa-search tabguru-search-icon"></i>
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="tabguru-search-input"
                  />
                </div>
              </div>
              <div className="tabguru-filter-dropdown">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="tabguru-filter-select"
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
                <button className="tabguru-filter-button">
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>
            </div>

            <div className="tabguru-students-container">
              {loading ? (
                <div className="tabguru-loading">
                  <i className="fas fa-spinner fa-spin"></i> Memuat data siswa...
                </div>
              ) : students.filter(s => 
                  (selectedClass === "Semua Kelas" || s.class === selectedClass) &&
                  (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 ? (
                <div className="tabguru-no-students">
                  Tidak ada siswa yang ditemukan
                </div>
              ) : (
                students
                  .filter(s => 
                    (selectedClass === "Semua Kelas" || s.class === selectedClass) &&
                    (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((student) => (
                    <div className="tabguru-student-card" key={student.id}>
                      <div className="tabguru-student-avatar">
                        <img src={getStudentAvatar(student)} alt={`${student.name} avatar`} />
                      </div>
                      <div className="tabguru-student-info">
                        <h3>{student.name}</h3>
                        <p>{student.class} | NIS: {student.nis}</p>
                        <p className="tabguru-parent-info">
                          <span className="tabguru-parent-label">Wali Murid: </span>
                          {student.parentStatus === "linked" ? (
                            <span className="tabguru-linked">{student.parent}</span>
                          ) : (
                            <span className="tabguru-unlinked">Belum ditautkan</span>
                          )}
                        </p>
                      </div>
                      <div className="tabguru-student-actions">
                        <button
                          className="tabguru-action-button tabguru-naik-kelas"
                          onClick={() => handleNaikKelas(student)}
                          style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginRight: '8px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#45a049';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#4CAF50';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }}
                        >
                          <i className="fas fa-arrow-up" style={{ fontSize: '12px' }}></i>
                          Naik Kelas
                        </button>
                        <button
                          className="tabguru-action-button tabguru-pindah-kelas"
                          onClick={() => handlePindahKelas(student)}
                          style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#1976D2';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#2196F3';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }}
                        >
                          <i className="fas fa-exchange-alt" style={{ fontSize: '12px' }}></i>
                          Pindah Kelas
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
          <div className="tabguru-student-list">
            <div className="tabguru-search-filter-container">
              <div className="tabguru-search-bar">
                <div className="tabguru-search-input-wrapper">
                  <i className="fas fa-search tabguru-search-icon"></i>
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="tabguru-search-input"
                  />
                </div>
              </div>
              <div className="tabguru-filter-dropdown">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="tabguru-filter-select"
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
                <button className="tabguru-filter-button">
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>
            </div>

            <div className="tabguru-students-container">
              {loading ? (
                <div className="tabguru-loading">
                  <i className="fas fa-spinner fa-spin"></i> Memuat data siswa...
                </div>
              ) : students.filter(s => 
                  (selectedClass === "Semua Kelas" || s.class === selectedClass) &&
                  (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 ? (
                <div className="tabguru-no-students">
                  Tidak ada siswa yang ditemukan
                </div>
              ) : (
                students
                  .filter(s => 
                    (selectedClass === "Semua Kelas" || s.class === selectedClass) &&
                    (searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((student) => (
                    <div className="tabguru-student-card" key={student.id}>
                      <div className="tabguru-student-avatar">
                        <img src={getStudentAvatar(student)} alt={`${student.name} avatar`} />
                      </div>
                      <div className="tabguru-student-info">
                        <h3>{student.name}</h3>
                        <p>{student.class} | NIS: {student.nis}</p>
                        <p className="tabguru-parent-info">
                          <span className="tabguru-parent-label">Wali Murid: </span>
                          {student.parentStatus === "linked" ? (
                            <span className="tabguru-linked">{student.parent}</span>
                          ) : (
                            <span className="tabguru-unlinked">Belum ditautkan</span>
                          )}
                        </p>
                      </div>
                      <div className="tabguru-student-actions">
                        <button
                          className="tabguru-action-button tabguru-catatan"
                          onClick={() => handleSendNote(student.id, student.name)}
                        >
                          <i className="fas fa-comment-alt"></i> Kirim Catatan
                        </button>
                        <button
                          className="tabguru-action-button tabguru-lihat-catatan"
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
          <div className="tabguru-reports">
            <h2>Laporan</h2>
            <div className="tabguru-report-filters">
              <div className="tabguru-filter-group">
                <label>Pilih Kelas:</label>
                <select 
                  value={selectedClass || ''} 
                  onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                >
                  {classes.map(kelas => (
                    <option key={kelas.id_kelas} value={kelas.id_kelas}>
                      {kelas.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass && (
              <div className="tabguru-report-content">
                <div className="tabguru-class-summary">
                  <h3>Ringkasan Kelas</h3>
                  <div className="tabguru-summary-stats">
                    <div className="tabguru-stat-item">
                      <span className="tabguru-stat-label">Total Siswa:</span>
                      <span className="tabguru-stat-value">
                        {students.filter(s => s.id_kelas === selectedClass).length}
                      </span>
                    </div>
                    <div className="tabguru-stat-item">
                      <span className="tabguru-stat-label">Rata-rata Nilai:</span>
                      <span className="tabguru-stat-value">
                        {calculateClassAverage && calculateClassAverage(selectedClass)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tabguru-student-reports">
                  <h3>Laporan Per Siswa</h3>
                  <table className="tabguru-report-table">
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
                        .filter(s => s.id_kelas === selectedClass)
                        .map(siswa => (
                          <tr key={siswa.id_siswa}>
                            <td>{siswa.nama}</td>
                            <td>{calculateStudentAverage && calculateStudentAverage(siswa.id_siswa)}</td>
                            <td>{getStudentProgress && getStudentProgress(siswa.id_siswa)}</td>
                            <td>
                              <button onClick={() => handleViewReport(siswa.id_siswa)}>
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
      'Anjing': './src/assets/anjing.png',
      'Babi': './src/assets/babi.png',
      'Bebek': './src/assets/bebek.png',
      'Gurita': './src/assets/gurita.png',
      'Harimau': './src/assets/harimau.png',
      'Kelinci': './src/assets/kelinci.png',
      'Kucing': './src/assets/kucing.png',
      'Sapi': './src/assets/sapi.png',
      'Serigala': './src/assets/serigala.png',
      'Singa': './src/assets/singa.png'
    };

    // Check if student has an avatar set

    if (student?.avatar && animalAvatars[student.avatar]) {
      return animalAvatars[student.avatar];
    }

    // Fallback to gender-based avatar if no animal avatar is set
    return student?.gender === 'P' ? './src/assets/perempuan.png' : './src/assets/laki.png';
  };

  const handleStudentUpdate = () => {
    // Refresh the students list after update
    fetchStudents();
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      student: null
    });
  };

  const handleEditStudent = (student) => {
    setEditModal({
      isOpen: true,
      student: student
    });
  };

  return (
    <div className="tabguru-dashboard">
      {" "}
      {/* Header */}{" "}
      <header className="tabguru-header">
        <div className="tabguru-logo">
          <i className="fas fa-chalkboard-teacher tabguru-logo-icon"></i>
          <h1>Math Fun - Dashboard Guru</h1>
        </div>
        <div className="tabguru-header-actions">
          <button className="tabguru-user-mode-button">
            <i className="fas fa-user-friends tabguru-icon-margin"></i> Mode Orang Tua
          </button>
          <button className="tabguru-logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt tabguru-icon-margin"></i> Logout
          </button>
        </div>
      </header>{" "}
      {/* Teacher Profile */}{" "}
      <div className="tabguru-profile-container">
        <div className="tabguru-profile-avatar">
          <img src="./src/assets/icon_guru.png" alt="Profile" />
        </div>
        <div className="tabguru-profile-info">
          {loading ? (
            <div className="tabguru-loading-profile">
              <i className="fas fa-spinner fa-spin"></i> Memuat data guru...
            </div>
          ) : (
            <>
              <h2>{teacherProfile.name}</h2>
              <p>
                {teacherProfile.role} - {teacherProfile.school}
              </p>
              <div className="tabguru-contact-info">
                <a
                  href={`mailto:${teacherProfile.email}`}
                  className="tabguru-email-link"
                >
                  <i className="fas fa-envelope"></i> {teacherProfile.email}
                </a>
                <a href={`tel:${teacherProfile.phone}`} className="tabguru-phone-link">
                  <i className="fas fa-phone"></i> {teacherProfile.phone}
                </a>
                <span className="tabguru-student-count">
                  <i className="fas fa-user-graduate"></i>{" "}
                  {teacherProfile.studentCount} Siswa
                </span>
              </div>
            </>
          )}
        </div>
        <button className="tabguru-edit-profile-button">
          <i className="fas fa-edit"></i> Edit Profil
        </button>
      </div>{" "}
      {/* Navigation Tabs */}{" "}
      <nav className="tabguru-tabs-nav">
        <button
          className={`tabguru-tab-button ${activeTab === "daftar" ? "tabguru-active" : ""}`}
          onClick={() => setActiveTab("daftar")}
        >
          <i className="fas fa-users tabguru-tab-icon"></i> Kelola Siswa
        </button>
        <button
          className={`tabguru-tab-button ${activeTab === "kelas" ? "tabguru-active" : ""}`}
          onClick={() => setActiveTab("kelas")}
        >
          <i className="fas fa-chalkboard tabguru-tab-icon"></i> Kelola Kelas
        </button>
        <button
          className={`tabguru-tab-button ${activeTab === "materi" ? "tabguru-active" : ""}`}
          onClick={() => setActiveTab("materi")}
        >
          <i className="fas fa-chalkboard tabguru-tab-icon"></i> Kelola Materi
        </button>
        <button
          className={`tabguru-tab-button ${activeTab === "catatan" ? "tabguru-active" : ""}`}
          onClick={() => setActiveTab("catatan")}
        >
          <i className="fas fa-comment-alt tabguru-tab-icon"></i> Kirim Catatan
        </button>
        <button
          className={`tabguru-tab-button ${activeTab === "laporan" ? "tabguru-active" : ""}`}
          onClick={() => setActiveTab("laporan")}
        >
          <i className="fas fa-chart-bar tabguru-tab-icon"></i> Laporan
        </button>
      </nav>
      
      {/* Tab Content */}
      <div className="tabguru-tab-content">{renderTabContent()}</div>

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
        onClose={() => setKelasModal({
          isOpen: false,
          type: null,
          student: null,
          availableClasses: []
        })}
        student={kelasModal.student}
        availableClasses={kelasModal.availableClasses}
        onConfirm={handleKelasConfirm}
        type={kelasModal.type}
      />
    </div>
  );
};

export default TabGuru;
