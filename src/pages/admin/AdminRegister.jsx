import React, { useState } from "react";
import supabase from "../../config/supabase";
import { useNavigate } from "react-router-dom";
// import "../../login.css";
import "./register.css";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    nomorInduk: "",
    role: "4", // Default role_id untuk siswa
    kelas: "",
    noTelp: "", // Untuk data guru/wali
    password: "", 
    tanggalLahir: "", // Untuk siswa
    alamat: "", // Untuk semua pengguna
    jenisKelamin: "L", // Default untuk siswa (L/P)
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Mapping role_id ke role name untuk tampilan pesan
  const roleNames = {
    1: "admin",
    2: "guru",
    3: "orang tua",
    4: "siswa",
  };

  // Fungsi untuk mengecek apakah role memerlukan kelas
  const needsClass = (role) => {
    return role === "2" || role === "4"; // Guru dan siswa memerlukan kelas
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Validasi form
      if (!formData.nama || !formData.nomorInduk) {
        setMessage({ text: "Nama dan nomor induk harus diisi", type: "error" });
        setLoading(false);
        return;
      }

      // Untuk role yang memerlukan kelas, kelas harus diisi
      if (needsClass(formData.role) && !formData.kelas) {
        const roleText = formData.role === "4" ? "siswa" : "guru";
        setMessage({ text: `Kelas harus diisi untuk ${roleText}`, type: "error" });
        setLoading(false);
        return;
      }
        // Untuk siswa, tanggal lahir dan jenis kelamin harus diisi
      if (formData.role === "4" && (!formData.tanggalLahir || !formData.jenisKelamin)) {
        setMessage({ text: "Tanggal lahir dan jenis kelamin harus diisi untuk siswa", type: "error" });
        setLoading(false);
        return;
      }

      // Untuk guru, nomor telepon harus diisi
      if (formData.role === "2" && !formData.noTelp) {
        setMessage({ text: "Nomor telepon harus diisi untuk guru", type: "error" });
        setLoading(false);
        return;
      }

      // Untuk semua role, password harus diisi
      if (!formData.password) {
        setMessage({ text: "Password harus diisi", type: "error" });
        setLoading(false);
        return;
      }

      let error;
      const roleName = roleNames[formData.role] || "pengguna";      // Buat user berdasarkan role
      if (formData.role === "4") {
        // Siswa
        const siswaData = {
          nis: formData.nomorInduk,
          nama: formData.nama,
          id_kelas: parseInt(formData.kelas),
          id_role: parseInt(formData.role),
          password: formData.password,
          tanggal_lahir: formData.tanggalLahir || null,
          alamat: formData.alamat || null,
          Jenis_Kelamin: formData.jenisKelamin === "P" ? "perempuan" : "laki"
          // avatar: formData.avatar || null, 
        };
        
        const result = await supabase.from("siswa").insert(siswaData);
        error = result.error;
      } 
      else if (formData.role === "2") {
        // Guru
        const guruData = {
          nuptk: formData.nomorInduk,
          nama: formData.nama,
          no_telp: formData.noTelp,
          id_role: parseInt(formData.role),
          password: formData.password,
          kelas: parseInt(formData.kelas),
          alamat: formData.alamat || null
        };
        
        const result = await supabase.from("guru").insert(guruData);
        error = result.error;
      } 
      else if (formData.role === "3") {
        // Orang Tua
        const waliData = {
          nama: formData.nama,
          no_telp: formData.noTelp,
          id_role: parseInt(formData.role),
          password: formData.password,
          alamat: formData.alamat || null
        };
        
        const result = await supabase.from("wali").insert(waliData);
        error = result.error;
      }

      if (error) throw error;

      // Pesan sukses menggunakan roleName dari mapping
      setMessage({
        text: `Akun ${roleName} berhasil dibuat untuk ${formData.nama}`,
        type: "success",
      });

      // Reset form after successful submission
      setFormData({
        nama: "",
        nomorInduk: "",
        role: "4", // Reset ke default siswa
        kelas: "",
        noTelp: "",
        password: "",
        tanggalLahir: "",
        alamat: "",
        jenisKelamin: "L",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage({
        text: `Error: ${
          error.message || "Terjadi kesalahan saat membuat akun"
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container admin-register">
      <div className="login-card">
        <h2>Admin - Registrasi Pengguna Baru</h2>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Jenis Pengguna</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="4">Siswa</option>
              <option value="2">Guru</option>
              <option value="3">Orang Tua</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nama">Nama Lengkap</label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>          <div className="form-group">
            <label htmlFor="nomorInduk">
              {formData.role === "4" ? "NIS" : formData.role === "2" ? "NUPTK" : "Nomor Induk"}
            </label>
            <input
              type="text"
              id="nomorInduk"
              name="nomorInduk"
              value={formData.nomorInduk}
              onChange={handleChange}
              required
            />
          </div>

          {(formData.role === "2" || formData.role === "3") && (
            <div className="form-group">
              <label htmlFor="noTelp">Nomor Telepon</label>
              <input
                type="tel"
                id="noTelp"
                name="noTelp"
                value={formData.noTelp}
                onChange={handleChange}
                required={formData.role === "2"} 
                placeholder="Format: 08xxxxxxxxxx"
              />
            </div>
          )}          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>          {needsClass(formData.role) && (
            <div className="form-group">
              <label htmlFor="kelas">Kelas</label>
              <select
                id="kelas"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Kelas</option>
                <option value="1">Kelas 1</option>
                <option value="2">Kelas 2</option>
                <option value="3">Kelas 3</option>
                <option value="4">Kelas 4</option>
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </div>
          )}

          {formData.role === "4" && (
            <>
              <div className="form-group">
                <label htmlFor="tanggalLahir">Tanggal Lahir</label>
                <input
                  type="date"
                  id="tanggalLahir"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jenisKelamin">Jenis Kelamin</label>
                <select
                  id="jenisKelamin"
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleChange}
                  required
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="alamat">Alamat</label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows="3"
              required={formData.role === "4"}
            ></textarea>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sedang Memproses..." : "Daftarkan Pengguna"}
          </button>
        </form>

        <button
          className="back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Kembali ke Dashboard Admin
        </button>
      </div>
    </div>
  );
};

export default AdminRegister;
