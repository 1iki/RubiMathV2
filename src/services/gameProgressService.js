import supabase from "../config/supabase";

// Fungsi untuk menyimpan progress game
export const saveGameProgress = async (gameData) => {
  try {
    // Get user data and id_siswa from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const id_siswa = localStorage.getItem("id_siswa") || userData.id_siswa;

    if (!id_siswa) {
      console.error("No student ID found");
      return false;
    }

    // Prepare game data
    const progressData = {
      id_siswa: parseInt(id_siswa),
      kelas: gameData.kelas,
      bab: gameData.bab,
      level: gameData.level,
      jenis_permainan: gameData.jenis_permainan,
      skor: gameData.skor,
      skor_maksimal: gameData.skor_maksimal || 100,
      status_selesai: gameData.status_selesai || false,
      detail_jawaban: gameData.detail_jawaban || {
        jawaban: [
          {
            total_benar: gameData.total_benar || 0,
            total_soal: gameData.total_soal || 0,
          },
        ],
      },
      waktu_selesai: gameData.status_selesai ? new Date().toISOString() : null,
    };

    console.log("Saving game progress:", progressData);

    // Try to save to Supabase using upsert
    try {
      const { error: progressError } = await supabase
        .from("game_progress")
        .upsert(progressData, {
          onConflict: "id_siswa,kelas,bab,level",
          returning: "minimal",
        });

      if (progressError) {
        console.error("Error saving to Supabase:", progressError);
        // Save to localStorage as backup
        await saveGameProgressLocally(progressData);
        return false;
      }

      console.log("Game progress saved successfully to Supabase!");
      return true;
    } catch (error) {
      console.error("Error in Supabase save:", error);
      // Save to localStorage as backup
      await saveGameProgressLocally(progressData);
      return false;
    }
  } catch (error) {
    console.error("Error in saveGameProgress:", error);
    return false;
  }
};

// Fungsi untuk menyimpan progress game ke localStorage
export const saveGameProgressLocally = async (progressData) => {
  try {
    const key = `game_progress_${progressData.kelas}_${progressData.bab}_${progressData.level}`;
    const existingProgress = JSON.parse(localStorage.getItem(key) || "[]");

    // Add timestamp and sync status
    const newProgress = {
      ...progressData,
      timestamp: new Date().toISOString(),
      needsSync: true,
    };

    // Add to existing progress array
    existingProgress.push(newProgress);

    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(existingProgress));

    console.log("Game progress saved locally");
    return true;
  } catch (error) {
    console.error("Error saving progress locally:", error);
    return false;
  }
};

// Fungsi untuk sinkronisasi progress yang tersimpan di localStorage ke Supabase
export const syncLocalProgress = async () => {
  try {
    const id_siswa = localStorage.getItem("id_siswa");
    if (!id_siswa) {
      console.error("No student ID found for syncing");
      return;
    }

    // Get all keys that start with game_progress_
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("game_progress_")
    );

    for (const key of keys) {
      const progressArray = JSON.parse(localStorage.getItem(key) || "[]");

      // Filter yang perlu disinkronkan
      const needsSync = progressArray.filter((p) => p.needsSync);

      for (const progress of needsSync) {
        try {
          // Ensure id_siswa is included and is a number
          const progressWithId = {
            ...progress,
            id_siswa: parseInt(id_siswa),
          };

          const { error } = await supabase.rpc(
            "update_game_progress",
            progressWithId
          );

          if (!error) {
            // Update sync status
            progress.needsSync = false;
            console.log("Successfully synced progress:", key);
          }
        } catch (error) {
          console.error("Error syncing progress:", error);
        }
      }

      // Save back the updated array
      localStorage.setItem(key, JSON.stringify(progressArray));
    }
  } catch (error) {
    console.error("Error in syncLocalProgress:", error);
  }
};

// Fungsi untuk mendapatkan progress game
export const getGameProgress = async (kelas, bab, level) => {
  try {
    const id_siswa = localStorage.getItem("id_siswa");
    if (!id_siswa) {
      console.error("No student ID found");
      return null;
    }

    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from("game_progress")
        .select("*")
        .eq("id_siswa", parseInt(id_siswa))
        .eq("kelas", kelas)
        .eq("bab", bab)
        .eq("level", level)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      // Return the most recent record
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      // If Supabase fails, get from localStorage
      console.error("Error getting progress from Supabase:", error);
      const key = `game_progress_${kelas}_${bab}_${level}`;
      const localProgress = JSON.parse(localStorage.getItem(key) || "[]");

      // Return the latest progress
      return localProgress[localProgress.length - 1] || null;
    }
  } catch (error) {
    console.error("Error in getGameProgress:", error);
    return null;
  }
};

// Fungsi untuk mendapatkan semua progress game untuk siswa tertentu
export const getStudentGameProgress = async (idSiswa) => {
  try {
    if (!idSiswa) {
      console.error("No student ID provided");
      return [];
    }

    // Get game progress data from Supabase
    const { data, error } = await supabase
      .from("game_progress")
      .select("*")
      .eq("id_siswa", parseInt(idSiswa))
      .order("waktu_selesai", { ascending: false });

    if (error) {
      console.error("Error fetching game progress from Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getStudentGameProgress:", error);
    return [];
  }
};
