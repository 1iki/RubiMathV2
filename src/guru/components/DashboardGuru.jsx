import React, { useState, useEffect } from 'react';
import supabase from '../../config/supabase';

const DashboardGuru = ({ teacherId }) => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageScore: 0,
    recentNotes: [],
    upcomingSchedule: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetchDashboardData();
    }
  }, [teacherId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Ambil data kelas yang diajar guru
      const { data: classesData, error: classesError } = await supabase
        .from('kelas')
        .select(`
          id_kelas,
          nama_kelas
        `)
        .eq('id_guru', teacherId);

      if (classesError) throw classesError;

      // 2. Ambil data siswa dari kelas yang diajar
      const classIds = classesData?.map(c => c.id_kelas) || [];
      let studentsData = [];
      
      if (classIds.length > 0) {
        const { data: students, error: studentsError } = await supabase
          .from('siswa')
          .select(`
            id_siswa,
            nama,
            id_kelas
          `)
          .in('id_kelas', classIds);

        if (studentsError) throw studentsError;
        studentsData = students || [];
      }

      // 3. Ambil data nilai
      let scoresData = [];
      if (studentsData.length > 0) {
        const studentIds = studentsData.map(s => s.id_siswa);
        const { data: scores, error: scoresError } = await supabase
          .from('nilai')
          .select(`
            nilai,
            id_siswa
          `)
          .in('id_siswa', studentIds);

        if (scoresError) throw scoresError;
        scoresData = scores || [];
      }

      // 4. Ambil catatan terbaru
      const { data: notesData, error: notesError } = await supabase
        .from('catatan')
        .select(`
          id_catatan,
          catatan,
          waktu,
          siswa_catatan!inner(
            id_siswa,
            siswa!inner(
              nama
            )
          )
        `)
        .eq('id_guru', teacherId)
        .order('waktu', { ascending: false })
        .limit(5);

      if (notesError) throw notesError;

      // Hitung rata-rata nilai
      const averageScore = scoresData.length > 0
        ? scoresData.reduce((acc, curr) => acc + (curr.nilai || 0), 0) / scoresData.length
        : 0;

      // Format data catatan
      const formattedNotes = (notesData || []).map(note => ({
        id: note.id_catatan,
        content: note.catatan,
        studentName: note.siswa_catatan[0]?.siswa?.nama || 'Siswa tidak diketahui',
        date: new Date(note.waktu)
      }));

      // Update state dengan data yang sudah diformat
      setDashboardData({
        totalStudents: studentsData.length,
        totalClasses: classesData?.length || 0,
        averageScore: Math.round(averageScore * 10) / 10,
        recentNotes: formattedNotes,
        upcomingSchedule: [] // Implementasi jadwal bisa ditambahkan nanti
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Terjadi kesalahan saat memuat data dashboard');
    } finally {
      setLoading(false);
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
    <div className="dashboard-guru">
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-user-graduate"></i>
          <div className="stat-info">
            <h3>Total Siswa</h3>
            <p>{dashboardData.totalStudents}</p>
          </div>
        </div>

        <div className="stat-card">
          <i className="fas fa-chalkboard"></i>
          <div className="stat-info">
            <h3>Total Kelas</h3>
            <p>{dashboardData.totalClasses}</p>
          </div>
        </div>

        <div className="stat-card">
          <i className="fas fa-chart-line"></i>
          <div className="stat-info">
            <h3>Rata-rata Nilai</h3>
            <p>{dashboardData.averageScore}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-notes">
          <h3>Catatan Terbaru</h3>
          {dashboardData.recentNotes.length > 0 ? (
            <ul>
              {dashboardData.recentNotes.map(note => (
                <li key={note.id}>
                  <div className="note-header">
                    <span className="student-name">{note.studentName}</span>
                    <span className="note-date">
                      {note.date.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p>{note.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Belum ada catatan</p>
          )}
        </div>

        <div className="upcoming-schedule">
          <h3>Jadwal Mendatang</h3>
          {dashboardData.upcomingSchedule.length > 0 ? (
            <ul>
              {dashboardData.upcomingSchedule.map(schedule => (
                <li key={schedule.id}>
                  <div className="schedule-time">{schedule.time}</div>
                  <div className="schedule-info">
                    <h4>{schedule.title}</h4>
                    <p>{schedule.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Tidak ada jadwal mendatang</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardGuru; 