import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabase";
import "./admin.css";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add validatePhoneNumber function
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9+\-\s]{8,20}$/;
    return phoneRegex.test(phone);
  };

  // Filter function for users based on search term
  const filterUsers = (users) => {
    if (!searchTerm) return users;
    
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      switch (activeTab) {
        case 'siswa':
          return (
            user.nama?.toLowerCase().includes(searchLower) ||
            user.nis?.toLowerCase().includes(searchLower) ||
            user.alamat?.toLowerCase().includes(searchLower)
          );
        case 'guru':
          return (
            user.nama?.toLowerCase().includes(searchLower) ||
            user.nuptk?.toLowerCase().includes(searchLower) ||
            user.no_telp?.includes(searchTerm) ||
            user.alamat?.toLowerCase().includes(searchLower)
          );
        case 'wali':
          return (
            user.nama?.toLowerCase().includes(searchLower) ||
            user.no_telp?.includes(searchTerm) ||
            user.alamat?.toLowerCase().includes(searchLower)
          );
        case 'admin':
          return (
            user.nama?.toLowerCase().includes(searchLower) ||
            user.tipe_admin?.toLowerCase().includes(searchLower)
          );
        default:
          return false;
      }
    });
  };

  const [users, setUsers] = useState({
    siswa: [],
    guru: [],
    wali: [],
    admin: []
  });
  const [kelas, setKelas] = useState([]); // Add state for kelas
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("siswa");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    // Common fields
    nama: "",
    // Siswa fields
    nis: "",
    tanggal_lahir: "",
    alamat: "",
    id_kelas: "",
    id_wali: "",
    Jenis_Kelamin: "",
    // Guru fields
    nuptk: "",
    no_telp: "",
    kelas: "",
    // Admin fields
    tipe_admin: "",
    // Only for new users
    password: "",
    auth_user_id: null
  });

  useEffect(() => {
    fetchUsers();
    fetchKelas(); // Add kelas fetch on component mount
  }, []);
  // Update fetchUsers to use proper error handling
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch data from individual tables with join for siswa-wali
      const [siswaResult, guruResult, waliResult, adminResult] = await Promise.all([
        supabase
          .from("siswa")
          .select(`
            *,
            wali:id_wali (
              nama
            )
          `),
        supabase.from("guru").select("*"),
        supabase.from("wali").select("*"),
        supabase.from("admin").select("*")
      ]);

      // Check for errors
      if (siswaResult.error) throw new Error(`Error fetching siswa: ${siswaResult.error.message}`);
      if (guruResult.error) throw new Error(`Error fetching guru: ${guruResult.error.message}`);
      if (waliResult.error) throw new Error(`Error fetching wali: ${waliResult.error.message}`);
      if (adminResult.error) throw new Error(`Error fetching admin: ${adminResult.error.message}`);

      // Update state with the fetched data
      setUsers({
        siswa: siswaResult.data || [],
        guru: guruResult.data || [],
        wali: waliResult.data || [],
        admin: adminResult.data || []
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch kelas data
  const fetchKelas = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('*')
        .order('nama_kelas', { ascending: true });

      if (error) throw error;
      setKelas(data || []);
    } catch (error) {
      console.error('Error fetching kelas:', error);
      alert('Error fetching kelas data: ' + error.message);
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
  const handleDeleteUser = async (id, role, userData) => {
    let confirmMessage = '';
    
    // Create specific confirmation messages for each user type
    switch (role) {
      case 'siswa':
        confirmMessage = `Apakah Anda yakin ingin menghapus siswa "${userData.nama}" dengan NIS ${userData.nis}?\n\nPeringatan: Tindakan ini akan menghapus semua data terkait siswa termasuk:\n- Catatan siswa\n- Riwayat kemajuan\n- Nilai-nilai`;
        break;
      case 'guru':
        confirmMessage = `Apakah Anda yakin ingin menghapus guru "${userData.nama}" dengan NUPTK ${userData.nuptk}?\n\nPeringatan: Tindakan ini akan mempengaruhi data kelas yang diajar oleh guru ini.`;
        break;
      case 'wali':
        confirmMessage = `Apakah Anda yakin ingin menghapus wali murid "${userData.nama}"?\n\nPeringatan: Pastikan tidak ada siswa yang masih terkait dengan wali ini.`;
        break;
      case 'admin':
        confirmMessage = `Apakah Anda yakin ingin menghapus admin "${userData.nama}" (${userData.tipe_admin})?`;
        break;
      default:
        confirmMessage = 'Apakah Anda yakin ingin menghapus pengguna ini?';
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      let tableName;
      let idColumn;
      
      // Map role to correct table name and ID column
      if (role === "siswa") {
        tableName = "siswa";
        idColumn = "id_siswa";
        
        // First delete related records in siswa_catatan
        const { error: catatanError } = await supabase
          .from('siswa_catatan')
          .delete()
          .eq('id_siswa', id);
          
        if (catatanError) throw catatanError;

        // Delete related records in kemajuan
        const { error: kemajuanError } = await supabase
          .from('kemajuan')
          .delete()
          .eq('id_siswa', id);
          
        if (kemajuanError) throw kemajuanError;

        // Delete related records in nilai
        const { error: nilaiError } = await supabase
          .from('nilai')
          .delete()
          .eq('id_siswa', id);
          
        if (nilaiError) throw nilaiError;

      } else if (role === "guru") {
        tableName = "guru";
        idColumn = "id_guru";
      } else if (role === "wali") {
        tableName = "wali";
        idColumn = "id_wali";
      } else if (role === "admin") {
        tableName = "admin";
        idColumn = "id_admin";
      } else {
        throw new Error("Unknown role");
      }
      
      // Delete from appropriate table
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idColumn, id);

      if (error) throw error;

      // Show success message
      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} berhasil dihapus!`);

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user: " + error.message);
    }
  };  const handleCreateUser = async () => {
    try {
      const table = activeTab;
      
      // Validate phone number for guru and wali
      if ((activeTab === 'guru' || activeTab === 'wali') && !validatePhoneNumber(formData.no_telp)) {
        throw new Error('Nomor telepon harus terdiri dari 8-20 karakter dan hanya boleh mengandung angka, tanda plus, strip, dan spasi');
      }

      let dataToInsert = { ...formData };
      
      // Remove unnecessary fields based on user type
      switch (activeTab) {
        case 'siswa':
          // Keep only siswa-specific fields
          dataToInsert = {
            nama: formData.nama,
            nis: formData.nis,
            tanggal_lahir: formData.tanggal_lahir,
            alamat: formData.alamat,
            id_kelas: parseInt(formData.id_kelas),
            id_wali: parseInt(formData.id_wali),
            Jenis_Kelamin: formData.Jenis_Kelamin,
            id_role: 4 // Set default role for siswa
          };
          break;
        case 'guru':
          // Keep only guru-specific fields
          dataToInsert = {
            nama: formData.nama,
            nuptk: formData.nuptk,
            no_telp: formData.no_telp,
            alamat: formData.alamat,
            kelas: formData.kelas,
            id_role: 2 // Set default role for guru
          };
          break;
        case 'wali':
          // Keep only wali-specific fields
          dataToInsert = {
            nama: formData.nama,
            alamat: formData.alamat,
            no_telp: formData.no_telp,
            id_role: 3 // Set default role for wali
          };
          break;
        case 'admin':
          // Keep only admin-specific fields
          dataToInsert = {
            nama: formData.nama,
            tipe_admin: formData.tipe_admin
          };
          break;
        default:
          throw new Error('Invalid user type');
      }

      // Check if user with unique fields already exists
      let existingUserQuery = null;
      if (activeTab === 'siswa') {
        existingUserQuery = await supabase
          .from(table)
          .select()
          .eq('nis', formData.nis)
          .single();
      } else if (activeTab === 'guru') {
        existingUserQuery = await supabase
          .from(table)
          .select()
          .eq('nuptk', formData.nuptk)
          .single();
      }

      if (existingUserQuery?.data) {
        throw new Error(`${activeTab} dengan ${activeTab === 'siswa' ? 'NIS' : 'NUPTK'} tersebut sudah ada`);
      }

      // Insert new user
      const { data, error } = await supabase
        .from(table)
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      setUsers(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], data[0]]
      }));

      setModalOpen(false);
      setFormData(initialFormState);
      alert('Pengguna berhasil ditambahkan!');
      
      // Refresh the users list to get the latest data
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + error.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const table = activeTab;
      let idColumn;
      let dataToUpdate;

      // Validate phone number for guru and wali
      if ((activeTab === 'guru' || activeTab === 'wali') && !validatePhoneNumber(formData.no_telp)) {
        throw new Error('Nomor telepon harus terdiri dari 8-20 karakter dan hanya boleh mengandung angka, tanda plus, strip, dan spasi');
      }

      switch (activeTab) {
        case 'siswa':
          idColumn = 'id_siswa';
          dataToUpdate = {
            nama: formData.nama,
            nis: formData.nis,
            tanggal_lahir: formData.tanggal_lahir,
            alamat: formData.alamat,
            id_kelas: parseInt(formData.id_kelas),
            id_wali: parseInt(formData.id_wali),
            Jenis_Kelamin: formData.Jenis_Kelamin
          };
          break;
        case 'guru':
          idColumn = 'id_guru';
          dataToUpdate = {
            nama: formData.nama,
            nuptk: formData.nuptk,
            no_telp: formData.no_telp,
            alamat: formData.alamat,
            kelas: formData.kelas
          };
          break;
        case 'wali':
          idColumn = 'id_wali';
          dataToUpdate = {
            nama: formData.nama,
            alamat: formData.alamat,
            no_telp: formData.no_telp
          };
          break;
        case 'admin':
          idColumn = 'id_admin';
          dataToUpdate = {
            nama: formData.nama,
            tipe_admin: formData.tipe_admin
          };
          break;
        default:
          throw new Error('Invalid user type');
      }

      const { error } = await supabase
        .from(table)
        .update(dataToUpdate)
        .eq(idColumn, selectedUser[idColumn]);

      if (error) throw error;

      setUsers(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(user => 
          user[idColumn] === selectedUser[idColumn] ? { ...user, ...dataToUpdate } : user
        )
      }));

      setModalOpen(false);
      setEditMode(false);
      setSelectedUser(null);
      setFormData(initialFormState);
      alert('Pengguna berhasil diperbarui!');
      
      // Refresh the users list to get the latest data
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      ...user,
      // For siswa, ensure id_wali and id_kelas are strings for form inputs
      id_wali: user.id_wali ? user.id_wali.toString() : '',
      id_kelas: user.id_kelas ? user.id_kelas.toString() : '',
      // Keep other fields
      nama: user.nama || '',
      nis: user.nis || '',
      nuptk: user.nuptk || '',
      tanggal_lahir: user.tanggal_lahir || '',
      Jenis_Kelamin: user.Jenis_Kelamin || '',
      alamat: user.alamat || '',
      no_telp: user.no_telp || '',
      kelas: user.kelas || '',
      tipe_admin: user.tipe_admin || ''
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const initialFormState = {
    // Common fields
    nama: "",
    // Siswa fields
    nis: "",
    tanggal_lahir: "",
    alamat: "",
    id_kelas: "",
    id_wali: "",
    Jenis_Kelamin: "",
    // Guru fields
    nuptk: "",
    no_telp: "",
    kelas: "",
    // Admin fields
    tipe_admin: "",
    // Only for new users
    password: "",
    auth_user_id: null
  };

  const renderModal = () => (
    <div className={`modal ${modalOpen ? 'show' : ''}`}>
      <div className="modal-content">
        <h2>{editMode ? 'Edit' : 'Tambah'} {activeTab}</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          editMode ? handleUpdateUser() : handleCreateUser();
        }}>
          {/* Common field for all types: nama */}
          <div className="form-group">
            <label>Nama:</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          {/* Fields specific to siswa */}
          {activeTab === 'siswa' && (
            <>
              <div className="form-group">
                <label>NIS:</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Lahir:</label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat:</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kelas:</label>
                <select
                  value={formData.id_kelas}
                  onChange={(e) => setFormData({ ...formData, id_kelas: e.target.value })}
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {kelas.map((k) => (
                    <option key={k.id_kelas} value={k.id_kelas}>
                      {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Wali:</label>
                <select
                  value={formData.id_wali}
                  onChange={(e) => setFormData({ ...formData, id_wali: e.target.value })}
                  required
                >
                  <option value="">Pilih Wali</option>
                  {users.wali.map((wali) => (
                    <option key={wali.id_wali} value={wali.id_wali}>
                      {wali.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Jenis Kelamin:</label>
                <select
                  value={formData.Jenis_Kelamin}
                  onChange={(e) => setFormData({ ...formData, Jenis_Kelamin: e.target.value })}
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </>
          )}

          {/* Fields specific to guru */}
          {activeTab === 'guru' && (
            <>
              <div className="form-group">
                <label>NUPTK:</label>
                <input
                  type="text"
                  value={formData.nuptk}
                  onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>No. Telepon:</label>
                <input
                  type="tel"
                  value={formData.no_telp}
                  onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat:</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kelas:</label>
                <select
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {kelas.map((k) => (
                    <option key={k.id_kelas} value={k.nama_kelas}>
                      {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Fields specific to wali */}
          {activeTab === 'wali' && (
            <>
              <div className="form-group">
                <label>No. Telepon:</label>
                <input
                  type="tel"
                  value={formData.no_telp}
                  onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat:</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {/* Fields specific to admin */}
          {activeTab === 'admin' && (
            <>
              <div className="form-group">
                <label>Tipe Admin:</label>
                <select
                  value={formData.tipe_admin}
                  onChange={(e) => setFormData({ ...formData, tipe_admin: e.target.value })}
                  required
                >
                  <option value="">Pilih Tipe Admin</option>
                  <option value="super">Super Admin</option>
                  <option value="regular">Regular Admin</option>
                </select>
              </div>
            </>
          )}

          {/* Common field for auth_user_id and password (only for new users) */}
          {!editMode && (
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="submit">{editMode ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => {
              setModalOpen(false);
              setEditMode(false);
              setSelectedUser(null);
              setFormData(initialFormState);
            }}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderUserTable = () => {
    const currentUsers = users[activeTab] || [];
    const filteredUsers = filterUsers(currentUsers);

    if (loading) {
      return <div className="loading">
        <i className="fas fa-spinner"></i> Loading users...
      </div>;
    }

    const renderTableContent = () => {
      switch (activeTab) {
        case 'siswa':
          return (
            <table className="user-table">
              <thead>
                <tr>
                  <th>NIS</th>
                  <th>Nama</th>
                  <th>Tanggal Lahir</th>
                  <th>Alamat</th>
                  <th>Kelas</th>
                  <th>Wali</th>
                  <th>Jenis Kelamin</th>
                  <th>Avatar</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id_siswa}>
                    <td>{user.nis}</td>
                    <td>{user.nama}</td>
                    <td>{user.tanggal_lahir}</td>
                    <td>{user.alamat}</td>
                    <td>{kelas.find(k => k.id_kelas === user.id_kelas)?.nama_kelas || '-'}</td>
                    <td>{user.wali?.nama || '-'}</td>
                    <td>{user.Jenis_Kelamin}</td>
                    <td>{user.avatar ? '✓' : '✗'}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditUser(user)}>
                        <i className="fas fa-edit mr-2"></i>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user.id_siswa, 'siswa', user)}>
                        <i className="fas fa-trash-alt mr-2"></i>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        case 'guru':
          return (
            <table className="user-table">
              <thead>
                <tr>
                  <th>NUPTK</th>
                  <th>Nama</th>
                  <th>No. Telepon</th>
                  <th>Alamat</th>
                  <th>Kelas</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id_guru}>
                    <td>{user.nuptk}</td>
                    <td>{user.nama}</td>
                    <td>{user.no_telp}</td>
                    <td>{user.alamat}</td>
                    <td>{user.kelas}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditUser(user)}>
                        <i className="fas fa-edit mr-2"></i>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user.id_guru, 'guru', user)}>
                        <i className="fas fa-trash-alt mr-2"></i>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        case 'wali':
          return (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>No. Telepon</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id_wali}>
                    <td>{user.nama}</td>
                    <td>{user.alamat}</td>
                    <td>{user.no_telp}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditUser(user)}>
                        <i className="fas fa-edit mr-2"></i>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user.id_wali, 'wali', user)}>
                        <i className="fas fa-trash-alt mr-2"></i>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        case 'admin':
          return (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Tipe Admin</th>
                  <th>Created At</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id_admin}>
                    <td>{user.nama}</td>
                    <td>{user.tipe_admin}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditUser(user)}>
                        <i className="fas fa-edit mr-2"></i>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteUser(user.id_admin, 'admin', user)}>
                        <i className="fas fa-trash-alt mr-2"></i>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        default:
          return <div className="no-users">Tab tidak valid</div>;
      }
    };

    return (
      <div className="users-container">
        <div className="search-filter">
          <input
            type="text"
            className="search-input"
            placeholder={`Cari ${activeTab} berdasarkan nama, ${
              activeTab === 'siswa' ? 'NIS, atau alamat' :
              activeTab === 'guru' ? 'NUPTK, nomor telepon, atau alamat' :
              activeTab === 'wali' ? 'nomor telepon atau alamat' :
              'tipe admin'
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-actions">
          <button onClick={() => {
            setEditMode(false);
            setSelectedUser(null);
            setFormData(initialFormState);
            setModalOpen(true);
          }}>
            <i className="fas fa-plus-circle mr-2"></i>
            Tambah {activeTab}
          </button>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            Tidak ada pengguna {activeTab} yang ditemukan.
          </div>
        ) : (
          <div className="table-wrapper">
            {renderTableContent()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1>Dashboard Admin</h1>

        <div className="admin-actions">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "siswa" ? "active" : ""}`}
            onClick={() => setActiveTab("siswa")}
          >
            <i className="fas fa-user-graduate mr-2"></i>
            Siswa ({users.siswa.length})
          </button>
          <button
            className={`tab ${activeTab === "guru" ? "active" : ""}`}
            onClick={() => setActiveTab("guru")}
          >
            <i className="fas fa-chalkboard-teacher mr-2"></i>
            Guru ({users.guru.length})
          </button>
          <button
            className={`tab ${activeTab === "wali" ? "active" : ""}`}
            onClick={() => setActiveTab("wali")}
          >
            <i className="fas fa-users mr-2"></i>
            Orang Tua ({users.wali.length})
          </button>
          <button
            className={`tab ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            <i className="fas fa-user-shield mr-2"></i>
            Admin ({users.admin?.length || 0})
          </button>
        </div>

        <div className="users-container">
          {renderUserTable()}
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default DashboardAdmin;
