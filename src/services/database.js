import supabase from "../config/supabase";
import { dummySiswa, dummyGuru } from "../config/mockData";

// Connection state tracking
let connectionState = {
  isOnline: true,
  lastChecked: null,
  retryCount: 0,
  maxRetries: 3,
};

// Check connection status
export const checkConnection = async () => {
  try {
    const isConnected = await testConnection();
    connectionState.isOnline = isConnected;
    connectionState.lastChecked = Date.now();
    return isConnected;
  } catch (error) {
    console.error("[Database] Connection check failed:", error);
    connectionState.isOnline = false;
    connectionState.lastChecked = Date.now();
    return false;
  }
};

// Test connection with Supabase
export const testConnection = async (timeout = 3000) => {
  if (!supabase) {
    console.error("[Database] Supabase client not initialized");
    return false;
  }

  try {
    return await supabase.testConnection(timeout);
  } catch (error) {
    console.error("[Database] Connection test failed:", error);
    return false;
  }
};

// Fungsi untuk mengambil data siswa
export const getSiswa = async (id) => {
  try {
    if (!connectionState.isOnline) {
      console.log("[Database] Working in offline mode - getSiswa");
      return id ? dummySiswa.find((s) => s.id_siswa === id) : dummySiswa;
    }

    if (id) {
      const { data, error } = await supabase
        .from("siswa")
        .select("*, kelas(nama_kelas), wali(nama)")
        .eq("id_siswa", id)
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("siswa")
        .select("*, kelas(nama_kelas), wali(nama)");

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("[Database] getSiswa error:", error);
    // Fallback to offline data
    return id ? dummySiswa.find((s) => s.id_siswa === id) : dummySiswa;
  }
};

// Fungsi untuk mengambil data guru
export const getGuru = async (id) => {
  try {
    if (!connectionState.isOnline) {
      console.log("[Database] Working in offline mode - getGuru");
      return id ? dummyGuru.find((g) => g.id_guru === id) : dummyGuru;
    }

    if (id) {
      const { data, error } = await supabase
        .from("guru")
        .select("*")
        .eq("id_guru", id)
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from("guru").select("*");

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("[Database] getGuru error:", error);
    // Fallback to offline data
    return id ? dummyGuru.find((g) => g.id_guru === id) : dummyGuru;
  }
};

// Fungsi untuk mengambil data wali
export const getwali = async (id) => {
  if (id) {
    const { data, error } = await supabase
      .from("wali")
      .select("*")
      .eq("id_wali", id)
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from("wali").select("*");

    if (error) throw error;
    return data;
  }
};

// Fungsi untuk mengambil data kelas
export const getKelas = async (id) => {
  if (id) {
    const { data, error } = await supabase
      .from("kelas")
      .select("*, guru(nama)")
      .eq("id_kelas", id)
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("kelas")
      .select("*, guru(nama)");

    if (error) throw error;
    return data;
  }
};

// Fungsi untuk mengambil data materi
export const getMateri = async () => {
  try {
    const { data, error } = await supabase
      .from("materi_dengan_pembuat")
      .select("*");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get materi error:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data nilai siswa
export const getNilaiSiswa = async (id_siswa) => {
  try {
    const { data, error } = await supabase
      .from("nilai")
      .select(
        `
        *,
        materi (
          nama_materi,
          kategori
        )
      `
      )
      .eq("id_siswa", id_siswa);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get nilai error:", error);
    throw error;
  }
};

// Fungsi untuk menyimpan nilai siswa
export const saveNilai = async (id_siswa, id_materi, nilai) => {
  try {
    const { data, error } = await supabase.from("nilai").insert([
      {
        id_siswa,
        id_materi,
        nilai,
        tanggal: new Date(),
      },
    ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Save nilai error:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data kemajuan siswa
export const getKemajuanSiswa = async (id_siswa) => {
  try {
    const { data, error } = await supabase
      .from("kemajuan")
      .select("*")
      .eq("id_siswa", id_siswa)
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get kemajuan error:", error);
    throw error;
  }
};

// Fungsi untuk mencatat kemajuan siswa
export const saveKemajuan = async (id_siswa, deskripsi) => {
  try {
    const { data, error } = await supabase.from("kemajuan").insert([
      {
        id_siswa,
        deskripsi,
        tanggal: new Date(),
      },
    ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Save kemajuan error:", error);
    throw error;
  }
};

// Login handler with fallback
export const login = async (username, password, role) => {
  try {
    // Check connection first
    const isOnline = await checkConnection();

    if (!isOnline) {
      console.log("[Database] Working in offline mode");
      return handleOfflineLogin(username, password, role);
    } // Online mode
    let data;

    switch (role) {
      case "siswa":
        data = await loginSiswa(username, password);
        break;
      case "guru":
        data = await loginGuru(username, password);
        break;
      // Add other roles as needed
    }

    if (!data) {
      throw new Error("Invalid credentials");
    }

    return {
      user: data,
      session: null, // We're not using Supabase Auth in this case
    };
  } catch (error) {
    console.error("[Database] Login error:", error);
    // Try offline login as last resort
    return handleOfflineLogin(username, password, role);
  }
};

// Offline login handler
const handleOfflineLogin = (username, password, role) => {
  let user;

  switch (role) {
    case "siswa":
      user = dummySiswa.find((s) => s.nama === username && s.nis === password);
      break;
    case "guru":
      user = dummyGuru.find((g) => g.nama === username && g.nuptk === password);
      break;
    // Add other roles as needed
  }

  if (!user) {
    throw new Error("Invalid credentials");
  }

  return {
    user,
    session: null,
    isOffline: true,
  };
};

// Logout handler
export const logout = async () => {
  try {
    if (connectionState.isOnline) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }

    // Always clear local storage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("selectedAvatar");

    return true;
  } catch (error) {
    console.error("[Database] Logout error:", error);
    // Still clear local storage even if Supabase logout fails
    localStorage.clear();
    return true;
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    if (!connectionState.isOnline) {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      return isLoggedIn
        ? { user: JSON.parse(localStorage.getItem("userData")) }
        : null;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("[Database] Get session error:", error);
    // Fallback to localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    return isLoggedIn
      ? { user: JSON.parse(localStorage.getItem("userData")) }
      : null;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const session = await getCurrentSession();
    if (!session) return null;

    return session.user;
  } catch (error) {
    console.error("[Database] Get user error:", error);
    return null;
  }
};

// Login siswa
export const loginSiswa = async (nama, nis) => {
  try {
    console.log(
      `[Database] Mencoba login siswa dengan nama: ${nama} dan NIS: ${nis}`
    );

    // Periksa ketersediaan supabase client
    if (!supabase) {
      console.error("[Database] Supabase client tidak tersedia");
      // Langsung fallback ke data offline
      const offlineSiswa = dummySiswa.find(
        (s) => s.nama === nama && s.nis === nis
      );
      if (!offlineSiswa) {
        throw new Error("Siswa tidak ditemukan (offline mode)");
      }
      console.log("[Database] Menggunakan data offline:", offlineSiswa);
      return offlineSiswa;
    }

    // Periksa metode from pada supabase client
    if (typeof supabase.from !== "function") {
      console.error(
        "[Database] Metode from tidak tersedia pada supabase client"
      );

      // Coba perbaiki metode from dengan cara alternatif
      if (supabase["from"] && typeof supabase["from"] === "function") {
        console.log(
          "[Database] Mencoba memperbaiki metode from dengan cara alternatif"
        );
        try {
          // Bind metode from ke supabase client
          const fixedFrom = supabase["from"].bind(supabase);
          // Uji metode from yang diperbaiki
          const testTable = fixedFrom("siswa");
          if (testTable && typeof testTable.select === "function") {
            console.log("[Database] Metode from berhasil diperbaiki");
            // Tambahkan metode from yang diperbaiki ke supabase client
            supabase.from = fixedFrom;
            // Lanjutkan dengan metode from yang diperbaiki
          } else {
            console.error("[Database] Metode from tidak dapat diperbaiki");
            // Langsung fallback ke data offline
            const offlineSiswa = dummySiswa.find(
              (s) => s.nama === nama && s.nis === nis
            );
            if (!offlineSiswa) {
              throw new Error("Siswa tidak ditemukan (offline mode)");
            }
            console.log("[Database] Menggunakan data offline:", offlineSiswa);
            return offlineSiswa;
          }
        } catch (fixError) {
          console.error(
            "[Database] Error saat memperbaiki metode from:",
            fixError
          );
          // Langsung fallback ke data offline
          const offlineSiswa = dummySiswa.find(
            (s) => s.nama === nama && s.nis === nis
          );
          if (!offlineSiswa) {
            throw new Error("Siswa tidak ditemukan (offline mode)");
          }
          console.log("[Database] Menggunakan data offline:", offlineSiswa);
          return offlineSiswa;
        }
      } else {
        // Langsung fallback ke data offline
        const offlineSiswa = dummySiswa.find(
          (s) => s.nama === nama && s.nis === nis
        );
        if (!offlineSiswa) {
          throw new Error("Siswa tidak ditemukan (offline mode)");
        }
        console.log("[Database] Menggunakan data offline:", offlineSiswa);
        return offlineSiswa;
      }
    }

    // Gunakan REST API langsung jika metode from().select().eq() bermasalah
    try {
      console.log("[Database] Mencoba dengan metode Supabase client");
      const { data, error } = await supabase
        .from("siswa")
        .select(
          `
          *,
          kelas (
            id_kelas,
            nama_kelas
          )
        `
        )
        .eq("nama", nama)
        .eq("nis", nis);

      console.log("[Database] Hasil query Supabase:", { data, error });

      if (error) {
        console.error("[Database] Error dengan metode Supabase client:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("[Database] Tidak ada data siswa yang ditemukan");
        throw new Error("Siswa tidak ditemukan");
      }

      console.log("[Database] Login siswa berhasil dengan data:", data[0]);
      return data[0];
    } catch (clientError) {
      console.error(
        "[Database] Error dengan Supabase client, mencoba dengan fetch API:",
        clientError
      );

      try {
        // Fallback ke fetch API langsung
        // Perbaiki format URL untuk query parameter
        const siswaTable = "siswa";
        const url = `${
          supabase.supabaseUrl
        }/rest/v1/${siswaTable}?select=*,kelas(id_kelas,nama_kelas)&nama=eq.${encodeURIComponent(
          nama
        )}&nis=eq.${encodeURIComponent(nis)}`;
        console.log("[Database] Request URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            apikey: supabase.supabaseKey,
            Authorization: `Bearer ${supabase.supabaseKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            Prefer: "return=representation",
          },
        });

        if (!response.ok) {
          console.error(
            "[Database] HTTP error:",
            response.status,
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Database] Data dari fetch API:", data);

        if (!data || data.length === 0) {
          console.warn(
            "[Database] Tidak ada data siswa yang ditemukan dengan fetch API"
          );
          throw new Error("Siswa tidak ditemukan");
        }

        console.log(
          "[Database] Login siswa berhasil dengan fetch API:",
          data[0]
        );
        return data[0];
      } catch (fetchError) {
        console.error("[Database] Fetch API error:", fetchError);

        // Fallback ke data offline sebagai upaya terakhir
        const offlineSiswa = dummySiswa.find(
          (s) => s.nama === nama && s.nis === nis
        );
        if (!offlineSiswa) {
          throw new Error("Siswa tidak ditemukan (offline mode)");
        }
        console.log(
          "[Database] Menggunakan data offline sebagai fallback terakhir:",
          offlineSiswa
        );
        return offlineSiswa;
      }
    }
  } catch (error) {
    console.error("[Database] Login siswa error:", error);
    throw error;
  }
};

// Login guru
export const loginGuru = async (nama, nuptk) => {
  try {
    console.log(
      `[Database] Mencoba login guru dengan nama: ${nama} dan NUPTK: ${nuptk}`
    );

    // Periksa ketersediaan supabase client
    if (!supabase) {
      console.error("[Database] Supabase client tidak tersedia");
      // Langsung fallback ke data offline
      const offlineGuru = dummyGuru.find(
        (g) => g.nama === nama && g.nuptk === nuptk
      );
      if (!offlineGuru) {
        throw new Error("Guru tidak ditemukan (offline mode)");
      }
      console.log("[Database] Menggunakan data offline:", offlineGuru);
      return offlineGuru;
    }

    // Periksa metode from pada supabase client
    if (typeof supabase.from !== "function") {
      console.error(
        "[Database] Metode from tidak tersedia pada supabase client"
      );

      // Coba perbaiki metode from dengan cara alternatif
      if (supabase["from"] && typeof supabase["from"] === "function") {
        console.log(
          "[Database] Mencoba memperbaiki metode from dengan cara alternatif"
        );
        try {
          // Bind metode from ke supabase client
          const fixedFrom = supabase["from"].bind(supabase);
          // Uji metode from yang diperbaiki
          const testTable = fixedFrom("guru");
          if (testTable && typeof testTable.select === "function") {
            console.log("[Database] Metode from berhasil diperbaiki");
            // Tambahkan metode from yang diperbaiki ke supabase client
            supabase.from = fixedFrom;
            // Lanjutkan dengan metode from yang diperbaiki
          } else {
            console.error("[Database] Metode from tidak dapat diperbaiki");
            // Langsung fallback ke data offline
            const offlineGuru = dummyGuru.find(
              (g) => g.nama === nama && g.nuptk === nuptk
            );
            if (!offlineGuru) {
              throw new Error("Guru tidak ditemukan (offline mode)");
            }
            console.log("[Database] Menggunakan data offline:", offlineGuru);
            return offlineGuru;
          }
        } catch (fixError) {
          console.error(
            "[Database] Error saat memperbaiki metode from:",
            fixError
          );
          // Langsung fallback ke data offline
          const offlineGuru = dummyGuru.find(
            (g) => g.nama === nama && g.nuptk === nuptk
          );
          if (!offlineGuru) {
            throw new Error("Guru tidak ditemukan (offline mode)");
          }
          console.log("[Database] Menggunakan data offline:", offlineGuru);
          return offlineGuru;
        }
      } else {
        // Langsung fallback ke data offline
        const offlineGuru = dummyGuru.find(
          (g) => g.nama === nama && g.nuptk === nuptk
        );
        if (!offlineGuru) {
          throw new Error("Guru tidak ditemukan (offline mode)");
        }
        console.log("[Database] Menggunakan data offline:", offlineGuru);
        return offlineGuru;
      }
    }

    // Gunakan REST API langsung jika metode from().select().eq() bermasalah
    try {
      console.log("[Database] Mencoba dengan metode Supabase client");
      const { data, error } = await supabase
        .from("guru")
        .select("*")
        .eq("nama", nama)
        .eq("nuptk", nuptk)
        .single();

      if (error) {
        console.error("[Database] Error dengan metode Supabase client:", error);
        throw error;
      }

      if (!data) {
        console.warn("[Database] Tidak ada data guru yang ditemukan");
        throw new Error("Guru tidak ditemukan");
      }

      console.log("[Database] Login guru berhasil dengan data:", data);
      return data;
    } catch (clientError) {
      console.error(
        "[Database] Error dengan Supabase client, mencoba dengan fetch API:",
        clientError
      );

      try {
        // Fallback ke fetch API langsung
        const url = `${
          supabase.supabaseUrl
        }/rest/v1/guru?select=*&nama=eq.${encodeURIComponent(
          nama
        )}&nuptk=eq.${encodeURIComponent(nuptk)}`;
        console.log("[Database] Request URL:", url);

        const response = await fetch(url, {
          headers: {
            apikey: supabase.supabaseKey,
            Authorization: `Bearer ${supabase.supabaseKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          console.error(
            "[Database] HTTP error:",
            response.status,
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Database] Data dari fetch API:", data);

        if (!data || data.length === 0) {
          console.warn(
            "[Database] Tidak ada data guru yang ditemukan dengan fetch API"
          );
          throw new Error("Guru tidak ditemukan");
        }

        console.log(
          "[Database] Login guru berhasil dengan fetch API:",
          data[0]
        );
        return data[0];
      } catch (fetchError) {
        console.error("[Database] Fetch API error:", fetchError);

        // Fallback ke data offline sebagai upaya terakhir
        const offlineGuru = dummyGuru.find(
          (g) => g.nama === nama && g.nuptk === nuptk
        );
        if (!offlineGuru) {
          throw new Error("Guru tidak ditemukan (offline mode)");
        }
        console.log(
          "[Database] Menggunakan data offline sebagai fallback terakhir:",
          offlineGuru
        );
        return offlineGuru;
      }
    }
  } catch (error) {
    console.error("[Database] Login guru error:", error);
    throw error;
  }
};

// Login admin
export const loginAdmin = async (username, password) => {
  try {
    console.log(`[Database] Attempting admin login with username: ${username}`);

    // Check Supabase client availability
    if (!supabase) {
      console.error("[Database] Supabase client not available");
      return handleOfflineLogin(username, password, "admin");
    }

    try {
      // Get admin by name
      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("*")
        .eq("nama", username)
        .single();

      if (adminError) {
        // Tangani error policy Supabase (infinite recursion)
        if (adminError.code === "42P17") {
          console.error(
            "[Database] Supabase RLS policy error (infinite recursion):",
            adminError
          );
          throw new Error(
            "Supabase RLS policy error pada tabel 'admin': infinite recursion. Silakan perbaiki policy di dashboard Supabase."
          );
        }
        console.error("[Database] Error fetching admin:", adminError);
        throw new Error("Invalid credentials");
      }

      if (!adminData) {
        console.warn("[Database] No admin found with provided name");
        throw new Error("Invalid credentials");
      }

      // Verify if password matches (in this case we're checking the plain password field)
      // In a production environment, you should use password_hash and proper password hashing
      if (adminData.password !== password) {
        console.warn("[Database] Invalid password");
        throw new Error("Invalid credentials");
      }
      console.log("[Database] Admin login successful");
      return {
        ...adminData,
        offline: false,
      };
    } catch (error) {
      // Tangani error policy Supabase (infinite recursion) pada catch
      if (
        error &&
        error.message &&
        error.message.includes("infinite recursion")
      ) {
        throw error;
      }
      console.error("[Database] Admin login failed:", error);
      return handleOfflineLogin(username, password, "admin");
    }
  } catch (error) {
    // Tangani error policy Supabase (infinite recursion) pada catch utama
    if (
      error &&
      error.message &&
      error.message.includes("infinite recursion")
    ) {
      throw error;
    }
    console.error("[Database] Admin login error:", error);
    throw error;
  }
};

// Update siswa avatar
export const updateSiswaAvatar = async (id_siswa, avatar) => {
  try {
    console.log(
      `[Database] Mencoba update avatar siswa dengan ID: ${id_siswa} ke avatar: ${avatar}`
    );

    // Periksa ketersediaan supabase client
    if (!supabase) {
      console.error("[Database] Supabase client tidak tersedia");
      // Langsung fallback ke mode offline - update data lokal saja
      console.log("[Database] Fallback ke mode offline untuk update avatar");
      return { id_siswa, avatar, offline: true };
    }

    // Periksa metode from pada supabase client
    if (typeof supabase.from !== "function") {
      console.error(
        "[Database] Metode from tidak tersedia pada supabase client"
      );

      // Coba perbaiki metode from dengan cara alternatif
      if (supabase["from"] && typeof supabase["from"] === "function") {
        console.log(
          "[Database] Mencoba memperbaiki metode from dengan cara alternatif"
        );
        try {
          // Bind metode from ke supabase client
          const fixedFrom = supabase["from"].bind(supabase);
          // Uji metode from yang diperbaiki
          const testTable = fixedFrom("siswa");
          if (testTable && typeof testTable.select === "function") {
            console.log("[Database] Metode from berhasil diperbaiki");
            // Tambahkan metode from yang diperbaiki ke supabase client
            supabase.from = fixedFrom;
            // Lanjutkan dengan metode from yang diperbaiki
          } else {
            console.error("[Database] Metode from tidak dapat diperbaiki");
            // Langsung fallback ke mode offline - update data lokal saja
            console.log(
              "[Database] Fallback ke mode offline untuk update avatar"
            );
            return { id_siswa, avatar, offline: true };
          }
        } catch (fixError) {
          console.error(
            "[Database] Error saat memperbaiki metode from:",
            fixError
          );
          // Langsung fallback ke mode offline - update data lokal saja
          console.log(
            "[Database] Fallback ke mode offline untuk update avatar"
          );
          return { id_siswa, avatar, offline: true };
        }
      } else {
        // Langsung fallback ke mode offline - update data lokal saja
        console.log("[Database] Fallback ke mode offline untuk update avatar");
        return { id_siswa, avatar, offline: true };
      }
    }

    // Gunakan REST API langsung jika metode from().update().eq() bermasalah
    try {
      console.log("[Database] Mencoba dengan metode Supabase client");
      const { data, error } = await supabase
        .from("siswa")
        .update({ avatar })
        .eq("id_siswa", id_siswa)
        .select()
        .single();

      if (error) {
        console.error("[Database] Error dengan metode Supabase client:", error);
        throw error;
      }

      console.log("[Database] Update avatar berhasil dengan data:", data);
      return data;
    } catch (clientError) {
      console.error(
        "[Database] Error dengan Supabase client, mencoba dengan fetch API:",
        clientError
      );

      try {
        // Fallback ke fetch API langsung
        const url = `${supabase.supabaseUrl}/rest/v1/siswa?id_siswa=eq.${id_siswa}`;
        console.log("[Database] Request URL:", url);

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            apikey: supabase.supabaseKey,
            Authorization: `Bearer ${supabase.supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ avatar }),
        });

        if (!response.ok) {
          console.error(
            "[Database] HTTP error:",
            response.status,
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Database] Data dari fetch API:", data);

        if (!data || data.length === 0) {
          console.warn(
            "[Database] Tidak ada data yang dikembalikan dengan fetch API"
          );
          // Fallback ke mode offline - update data lokal saja
          return { id_siswa, avatar, offline: true };
        }

        console.log(
          "[Database] Update avatar berhasil dengan fetch API:",
          data[0]
        );
        return data[0];
      } catch (fetchError) {
        console.error("[Database] Fetch API error:", fetchError);
        // Fallback ke mode offline - update data lokal saja
        console.log(
          "[Database] Fallback ke mode offline untuk update avatar setelah semua upaya gagal"
        );
        return { id_siswa, avatar, offline: true };
      }
    }
  } catch (error) {
    console.error("[Database] Update avatar error:", error);
    // Fallback ke mode offline - update data lokal saja
    return { id_siswa, avatar, offline: true };
  }
};
