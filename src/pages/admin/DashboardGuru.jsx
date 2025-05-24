import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabase";
import "./admin.css";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState({
    siswa: [],
    guru: [],
    wali: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("siswa");

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch data from individual tables instead of the non-existent users table
      const siswaResult = await supabase.from("siswa").select("*");
      const guruResult = await supabase.from("guru").select("*");
      const waliResult = await supabase.from("wali").select("*");

      if (siswaResult.error) console.error("Error fetching siswa:", siswaResult.error);
      if (guruResult.error) console.error("Error fetching guru:", guruResult.error);
      if (waliResult.error) console.error("Error fetching wali:", waliResult.error);      // Use the data directly from each query
      const siswa = siswaResult.data || [];
      const guru = guruResult.data || [];
      const wali = waliResult.data || [];
      
      setUsers({
        siswa,
        guru,
        wali,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  };
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna ini?`))
      return;

    try {
      let tableName;
      let idColumn;
      
      // Map role to correct table name and ID column
      if (role === "siswa") {
        tableName = "siswa";
        idColumn = "id_siswa";
      } else if (role === "guru") {
        tableName = "guru";
        idColumn = "id_guru";
      } else if (role === "wali") {
        tableName = "wali";
        idColumn = "id_wali";
      } else {
        throw new Error("Unknown role");
      }
      
      // Delete from appropriate table
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idColumn, id);

      if (error) throw error;

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user: " + error.message);
    }
  };  const renderUserTable = () => {
    const currentUsers = users[activeTab] || [];

    if (loading) {
      return <div className="loading">Loading users...</div>;
    }

    if (currentUsers.length === 0) {
      return (
        <div className="no-users">
          Tidak ada pengguna {activeTab} yang terdaftar.
        </div>
      );
    }

    return (
      <table className="user-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>{activeTab === "siswa" ? "NIS" : (activeTab === "guru" ? "NUPTK" : "No. Telepon")}</th>
            {activeTab === "siswa" && <th>Kelas</th>}
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={activeTab === "siswa" ? user.id_siswa : (activeTab === "guru" ? user.id_guru : user.id_wali)}>
              <td>{user.nama}</td>
              <td>{activeTab === "siswa" ? user.nis : (activeTab === "guru" ? user.nuptk : user.no_telp)}</td>
              {activeTab === "siswa" && <td>{user.id_kelas}</td>}
              <td>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteUser(
                    activeTab === "siswa" ? user.id_siswa : (activeTab === "guru" ? user.id_guru : user.id_wali), 
                    activeTab
                  )}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1>Dashboard Admin</h1>

        <div className="admin-actions">
          <button
            className="register-button"
            onClick={() => navigate("/admin/register")}
          >
            Daftarkan Pengguna Baru
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "siswa" ? "active" : ""}`}
            onClick={() => setActiveTab("siswa")}
          >
            Siswa ({users.siswa.length})
          </button>
          <button
            className={`tab ${activeTab === "guru" ? "active" : ""}`}
            onClick={() => setActiveTab("guru")}
          >
            Guru ({users.guru.length})
          </button>
          <button
            className={`tab ${activeTab === "wali" ? "active" : ""}`}
            onClick={() => setActiveTab("wali")}
          >
            Orang Tua ({users.wali.length})
          </button>
        </div>

        <div className="users-container">{renderUserTable()}</div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
