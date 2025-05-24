import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabase';

const InputNilai = ({ teacherId }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState({});

  useEffect(() => {
    fetchClasses();
    fetchMaterials();
  }, [teacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedMaterial && students.length > 0) {
      fetchExistingScores();
    }
  }, [selectedMaterial, students]);

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

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materi')
        .select('*')
        .eq('id_pembuat', teacherId)
        .eq('tipe_pembuat', 'guru');

      if (error) throw error;
      setMaterials(data || []);
      if (data && data.length > 0) {
        setSelectedMaterial(data[0].id_materi);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      alert('Terjadi kesalahan saat memuat data materi');
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

  const fetchExistingScores = async () => {
    try {
      const { data, error } = await supabase
        .from('nilai')
        .select('*')
        .eq('id_materi', selectedMaterial)
        .in('id_siswa', students.map(s => s.id_siswa));

      if (error) throw error;

      // Convert scores data to a more usable format
      const scoresMap = {};
      const notesMap = {};
      data?.forEach(record => {
        scoresMap[record.id_siswa] = record.nilai;
        notesMap[record.id_siswa] = record.catatan;
      });

      setScores(scoresMap);
      setNotes(notesMap);

      // Calculate student stats
      const stats = {};
      students.forEach(student => {
        stats[student.id_siswa] = calculateStudentStats(student.id_siswa, data);
      });
      setStudentStats(stats);

    } catch (error) {
      console.error('Error fetching existing scores:', error);
      alert('Terjadi kesalahan saat memuat nilai yang sudah ada');
    }
  };

  const calculateStudentStats = (studentId, scoresData) => {
    const studentScores = scoresData
      ?.filter(record => record.id_siswa === studentId)
      .map(record => record.nilai) || [];

    if (studentScores.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0
      };
    }

    const average = studentScores.reduce((a, b) => a + b, 0) / studentScores.length;
    const highest = Math.max(...studentScores);
    const lowest = Math.min(...studentScores);

    return {
      average: average.toFixed(2),
      highest: highest.toFixed(2),
      lowest: lowest.toFixed(2)
    };
  };

  const handleScoreChange = async (studentId, value) => {
    try {
      const score = parseFloat(value);
      if (isNaN(score) || score < 0 || score > 100) {
        alert('Nilai harus antara 0 dan 100');
        return;
      }

      // Check if score record exists
      const { data: existingRecord } = await supabase
        .from('nilai')
        .select('id_nilai')
        .eq('id_siswa', studentId)
        .eq('id_materi', selectedMaterial)
        .single();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('nilai')
          .update({ nilai: score })
          .eq('id_nilai', existingRecord.id_nilai);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('nilai')
          .insert({
            id_siswa: studentId,
            id_materi: selectedMaterial,
            nilai: score,
            tanggal: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update local state
      setScores(prev => ({
        ...prev,
        [studentId]: score
      }));

      // Update student stats
      const updatedStats = calculateStudentStats(studentId, [
        ...Object.entries(scores)
          .filter(([id]) => id !== studentId)
          .map(([id, nilai]) => ({ id_siswa: id, nilai })),
        { id_siswa: studentId, nilai: score }
      ]);
      setStudentStats(prev => ({
        ...prev,
        [studentId]: updatedStats
      }));

    } catch (error) {
      console.error('Error updating score:', error);
      alert('Terjadi kesalahan saat mengupdate nilai');
    }
  };

  const handleNoteChange = async (studentId, value) => {
    try {
      // Check if note record exists
      const { data: existingRecord } = await supabase
        .from('nilai')
        .select('id_nilai')
        .eq('id_siswa', studentId)
        .eq('id_materi', selectedMaterial)
        .single();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('nilai')
          .update({ catatan: value })
          .eq('id_nilai', existingRecord.id_nilai);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('nilai')
          .insert({
            id_siswa: studentId,
            id_materi: selectedMaterial,
            catatan: value,
            tanggal: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update local state
      setNotes(prev => ({
        ...prev,
        [studentId]: value
      }));

    } catch (error) {
      console.error('Error updating note:', error);
      alert('Terjadi kesalahan saat mengupdate catatan');
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
    <div className="input-nilai">
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="select_kelas">Pilih Kelas:</label>
          <select 
            id="select_kelas"
            name="select_kelas"
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

        <div className="filter-group">
          <label htmlFor="select_materi">Pilih Materi:</label>
          <select 
            id="select_materi"
            name="select_materi"
            value={selectedMaterial || ''} 
            onChange={(e) => setSelectedMaterial(parseInt(e.target.value))}
          >
            {materials.map(materi => (
              <option key={materi.id_materi} value={materi.id_materi}>
                {materi.nama_materi}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && selectedMaterial && (
        <div className="scores-table">
          <table>
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Nilai</th>
                <th>Catatan</th>
                <th>Statistik</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id_siswa}>
                  <td>{student.nama}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      id={`nilai_${student.id_siswa}`}
                      name={`nilai_${student.id_siswa}`}
                      value={scores[student.id_siswa] || ''}
                      onChange={(e) => handleScoreChange(student.id_siswa, e.target.value)}
                      placeholder="Masukkan nilai"
                    />
                  </td>
                  <td>
                    <textarea
                      id={`catatan_${student.id_siswa}`}
                      name={`catatan_${student.id_siswa}`}
                      value={notes[student.id_siswa] || ''}
                      onChange={(e) => handleNoteChange(student.id_siswa, e.target.value)}
                      placeholder="Masukkan catatan"
                      rows="2"
                    />
                  </td>
                  <td>
                    <div className="student-stats">
                      <p>Rata-rata: {studentStats[student.id_siswa]?.average || 0}</p>
                      <p>Tertinggi: {studentStats[student.id_siswa]?.highest || 0}</p>
                      <p>Terendah: {studentStats[student.id_siswa]?.lowest || 0}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InputNilai;