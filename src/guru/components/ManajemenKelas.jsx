import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabase';

const ManajemenKelas = ({ teacherId }) => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchClasses();
  }, [teacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
      fetchAttendance(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('*')
        .eq('id_guru', teacherId);

      if (error) throw error;
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClass(data[0].id_kelas);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Terjadi kesalahan saat memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('id_kelas', classId);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Terjadi kesalahan saat memuat data siswa');
    }
  };

  const fetchAttendance = async (classId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('kehadiran')
        .select('*')
        .eq('id_kelas', classId)
        .eq('tanggal', today);

      if (error) throw error;
      
      const attendanceMap = {};
      data?.forEach(record => {
        attendanceMap[record.id_siswa] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Terjadi kesalahan saat memuat data kehadiran');
    }
  };

  const handleAttendanceChange = async (studentId, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if attendance record exists
      const { data: existingRecord } = await supabase
        .from('kehadiran')
        .select('id')
        .eq('id_siswa', studentId)
        .eq('id_kelas', selectedClass)
        .eq('tanggal', today)
        .single();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('kehadiran')
          .update({ status })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('kehadiran')
          .insert({
            id_siswa: studentId,
            id_kelas: selectedClass,
            tanggal: today,
            status
          });

        if (error) throw error;
      }

      // Update local state
      setAttendance(prev => ({
        ...prev,
        [studentId]: status
      }));

    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Terjadi kesalahan saat mengupdate kehadiran');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i> Memuat data...
      </div>
    );
  }

  return (
    <div className="manajemen-kelas">
      <div className="class-selector">
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

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama</th>
              <th>Tanggal Lahir</th>
              <th>Alamat</th>
              <th>Jenis Kelamin</th>
              <th>Kehadiran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id_siswa}>
                <td>{student.nis}</td>
                <td>{student.nama}</td>
                <td>{new Date(student.tanggal_lahir).toLocaleDateString('id-ID')}</td>
                <td>{student.alamat}</td>
                <td>{student.Jenis_Kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                <td>
                  <select
                    value={attendance[student.id_siswa] || 'belum'}
                    onChange={(e) => handleAttendanceChange(student.id_siswa, e.target.value)}
                  >
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alpha">Alpha</option>
                    <option value="belum">Belum Diisi</option>
                  </select>
                </td>
                <td>
                  <button className="action-button">
                    <i className="fas fa-eye"></i> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManajemenKelas;