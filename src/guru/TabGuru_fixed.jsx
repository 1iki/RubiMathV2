import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";
import "../login.css";
import "./guru.css";

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
            // Check if it's a comma-separated list
            if (data.kelas.includes(",")) {
              kelasArray = data.kelas.split(",").map((k) => k.trim());
            } else {
              kelasArray = [data.kelas];
            }
          }
          // If it's already an array
          else if (Array.isArray(data.kelas)) {
            kelasArray = data.kelas;
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
              .map((k) => {
                // Extract the number part from class name
                const match = k.match(/\d+/);
                return match ? match[0] : "";
              })
              .filter(Boolean);

            if (classNumbers.length > 1) {
              // Check if classes are consecutive
              const min = Math.min(...classNumbers);
              const max = Math.max(...classNumbers);
              if (max - min + 1 === classNumbers.length) {
                roleText = `Guru Matematika Kelas ${min}-${max}`;
              } else {
                // Not consecutive, list them all
                roleText = `Guru Matematika Kelas ${classNumbers.join(", ")}`;
              }
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
      // Default avatar images by gender
      const maleAvatar = "/src/assets/laki.png";
      const femaleAvatar = "/src/assets/perempuan.png";

      // Make sure we have teacher's classes
      if (!teacherProfile.kelas || teacherProfile.kelas.length === 0) {
        console.warn("No teacher classes available to filter students");
        setStudents([]);
        setTeacherProfile((prev) => ({ ...prev, studentCount: 0 }));
        return;
      }

      console.log(
        "Fetching students for teacher classes:",
        teacherProfile.kelas
      );
      
      // Get all students from the siswa table
      const { data, error } = await supabase
        .from("siswa")
        .select("*");

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log("No students found in database");
        setStudents([]);
        setTeacherProfile((prev) => ({ ...prev, studentCount: 0 }));
        return;
      }

      console.log(`Found ${data.length} total students. Filtering by class...`);

      // Normalize teacher classes once for comparison
      const normalizedTeacherClasses = teacherProfile.kelas.map((kelas) =>
        normalizeClass(kelas).toLowerCase()
      );

      console.log("Normalized teacher classes:", normalizedTeacherClasses);
      
      // Filter students based on teacher's classes
      const filteredData = data.filter((student) => {
        // Skip students without class information
        if (!student.id_kelas) return false;

        // Convert student's class ID to a string for comparison
        const studentClass = `Kelas ${student.id_kelas}`;
        const normalizedStudentClass = normalizeClass(studentClass).toLowerCase();

        // Extract just the class number for numerical comparison if needed
        const studentClassNum = normalizedStudentClass.match(/\d+/);
        const studentClassNumber = studentClassNum
          ? parseInt(studentClassNum[0])
          : -1;

        // Check if this student's class matches any of the teacher's classes
        const matches = normalizedTeacherClasses.some((teacherClass) => {
          // Direct string match
          if (normalizedStudentClass === teacherClass) {
            return true;
          }

          // Extract teacher class number for numerical comparison
          const teacherClassNum = teacherClass.match(/\d+/);
          const teacherClassNumber = teacherClassNum
            ? parseInt(teacherClassNum[0])
            : -1;

          // Match by class number
          if (
            studentClassNumber > 0 &&
            teacherClassNumber > 0 &&
            studentClassNumber === teacherClassNumber
          ) {
            return true;
          }

          // Partial string matching (for cases like "Kelas 4A" matching "Kelas 4")
          return (
            normalizedStudentClass.includes(teacherClass) ||
            teacherClass.includes(normalizedStudentClass)
          );
        });
        
        if (matches) {
          console.log(
            `✅ Student matched: ${student.nama} (Kelas ${student.id_kelas} → ${normalizedStudentClass})`
          );
        } else {
          console.log(
            `❌ Student not matched: ${student.nama} (Kelas ${student.id_kelas} → ${normalizedStudentClass})`
          );
        }

        return matches;
      });

      console.log(
        `Filtered from ${data.length} to ${filteredData.length} students`
      );
      
      if (filteredData && filteredData.length > 0) {
        // Process the student data
        const formattedStudents = filteredData.map((student) => {
          // Get student's parent (wali) - in a real implementation,
          // you would do a join with the wali table using id_wali
          const hasParentInfo = student.id_wali ? true : false;
          const parentName = hasParentInfo ? "wali terhubung" : "Belum ditautkan";

          return {
            id: student.id_siswa,
            name: student.nama || "Nama tidak tersedia",
            class: `Kelas ${student.id_kelas}` || "Kelas tidak tersedia",
            age: calculateAge(student.tanggal_lahir) || "-",
            parent: parentName,
            parentStatus: hasParentInfo ? "linked" : "unlinked",
            avatar: student.jenis_kelamin === "P" ? femaleAvatar : maleAvatar,
          };
        });

        setStudents(formattedStudents);

        // Update teacher profile with student count
        setTeacherProfile((prev) => ({
          ...prev,
          studentCount: formattedStudents.length,
        }));
      } else {
        // If no matching students, create sample data based on teacher's classes
        console.log(
          "No students found matching teacher's classes. Creating samples."
        );
        createSampleStudents();
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      console.error("Teacher classes:", teacherProfile.kelas);
      alert("Error fetching students data. Using sample data instead.");

      // Create sample students for fallback
      createSampleStudents();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create sample students based on teacher's classes
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
    // Logic to show modal/form to add new student
    alert("Fitur tambah siswa akan segera tersedia!");
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

  const handleSendNote = (studentId) => {
    alert(`Kirim catatan untuk siswa ID: ${studentId}`);
  };

  const handleViewReport = (studentId) => {
    alert(`Lihat laporan siswa ID: ${studentId}`);
  };
  
  const handleDeleteStudent = async (studentId) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        // Delete the student from the database using the correct table and ID field
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
                        src={student.avatar}
                        alt={`${student.name} avatar`}
                      />
                    </div>{" "}
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      <p>
                        {student.class} | Umur {student.age} Tahun
                      </p>
                      <p className="parent-info">
                        <span className="parent-label">Orang Tua: </span>
                        {student.parentStatus === "linked" ? (
                          student.parent
                        ) : (
                          <span className="unlinked">{student.parent}</span>
                        )}
                      </p>
                    </div>{" "}
                    <div className="student-actions">
                      <button
                        className="action-button tugas"
                        onClick={() => alert("Tutian")}
                      >
                        Tutian
                      </button>
                      <button
                        className="action-button catatan"
                        onClick={() => handleSendNote(student.id)}
                      >
                        Catatan
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
          <div className="class-list">
            <h2>Kelola Kelas</h2>
            <p>Fitur pengelolaan kelas akan segera tersedia.</p>
          </div>
        );

      case "catatan":
        return (
          <div className="notes-list">
            <h2>Catatan Siswa</h2>
            <p>Fitur catatan siswa akan segera tersedia.</p>
          </div>
        );

      case "laporan":
        return (
          <div className="reports">
            <h2>Laporan</h2>
            <p>Fitur laporan akan segera tersedia.</p>
          </div>
        );

      default:
        return <div>No content available</div>;
    }
  };

  return (
    <div className="guru-dashboard">
      {" "}
      {/* Header */}{" "}
      <header className="header-guru">
        <div className="logo">
          <i className="fas fa-chalkboard-teacher logo-icon"></i>
          <h1>Math Fun - Profil Guru</h1>
        </div>
        <div className="header-actions">
          <button className="user-mode-button">
            <i className="fas fa-user-friends icon-margin"></i> Mode Orang Tua
          </button>
          <button className="home-button">
            <i className="fas fa-home"></i>
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt icon-margin"></i> Logout
          </button>
        </div>
      </header>{" "}
      {/* Teacher Profile */}{" "}
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
                <a href={`tel:${teacherProfile.phone}`} className="phone-link">
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
        </button>
      </nav>
      {/* Tab Content */}
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default TabGuru;
