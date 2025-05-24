import { createClient } from "@supabase/supabase-js";

// Supabase konfigurasi
const supabaseUrl = "https://pvcqsfrxxncafvvsutvr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Y3FzZnJ4eG5jYWZ2dnN1dHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDkxOTQsImV4cCI6MjA2MjkyNTE5NH0.cmZYoSG7UUsrUAsyNCsHcUhyIL9OHSelveGXH06Hm64";

// Status koneksi global
let connectionStatus = {
  isOnline: true, // Set default to true
  lastChecked: null,
  retryCount: 0,
  maxRetries: 3,
};

// Fungsi untuk membuat dummy client
const createDummyClient = () => {
  console.warn("[Supabase] Membuat dummy client");

  // Buat objek dengan struktur yang sama dengan client asli
  return {
    supabaseUrl,
    supabaseKey,
    from: (table) => {
      console.log(`[Supabase Dummy] Mengakses tabel ${table}`);
      return {
        select: (columns) => {
          console.log(
            `[Supabase Dummy] Select ${columns || "*"} dari ${table}`
          );
          return {
            eq: (column, value) => {
              console.log(`[Supabase Dummy] Where ${column} = ${value}`);
              return {
                single: () => ({
                  data: null,
                  error: new Error("Dummy client"),
                }),
                data: null,
                error: new Error("Dummy client"),
              };
            },
            limit: (num) => {
              console.log(`[Supabase Dummy] Limit ${num}`);
              return { data: [], error: null };
            },
            single: () => ({ data: null, error: new Error("Dummy client") }),
          };
        },
        update: (data) => {
          console.log(`[Supabase Dummy] Update ${table} dengan`, data);
          return {
            eq: (column, value) => {
              console.log(`[Supabase Dummy] Where ${column} = ${value}`);
              return {
                select: () => ({
                  single: () => ({ data: { ...data, id: value }, error: null }),
                }),
                data: { ...data, id: value },
                error: null,
              };
            },
          };
        },
        insert: (data) => {
          console.log(`[Supabase Dummy] Insert ke ${table}`, data);
          return { data: Array.isArray(data) ? data : [data], error: null };
        },
      };
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    rpc: (func, params) => {
      console.log(`[Supabase Dummy] RPC call ${func} dengan`, params);
      return { data: null, error: null };
    },
    isOnline: () => false,
    testConnection: async () => true, // Dummy selalu terhubung untuk menghindari loop
  };
};

// Membuat wrapper untuk Supabase client dengan penanganan kesalahan yang lebih baik
const createSafeClient = () => {
  try {
    console.log("[Supabase] Mencoba membuat client...");

    // Buat client dasar terlebih dahulu
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "Content-Type": "application/json",
        },
      },
      realtime: {
        enabled: true,
      },
    });

    // Verifikasi bahwa client memiliki metode from
    if (!client) {
      console.error("[Supabase] Client tidak berhasil dibuat");
      return createDummyClient();
    }

    // Periksa metode from dengan lebih teliti
    if (typeof client.from !== "function") {
      console.error("[Supabase] Client tidak memiliki metode from yang valid");

      // Coba akses from dengan cara lain (kadang terjadi karena perbedaan versi library)
      if (client["from"] && typeof client["from"] === "function") {
        console.log("[Supabase] Metode from ditemukan dengan cara alternatif");
        // Buat client baru dengan metode from yang benar
        const fixedClient = {
          ...client,
          from: client["from"].bind(client),
        };

        // Uji metode from yang diperbaiki
        try {
          const testTable = fixedClient.from("siswa");
          if (testTable && typeof testTable.select === "function") {
            console.log("[Supabase] Metode from berhasil diperbaiki");
            // Lanjutkan dengan client yang diperbaiki
            client.from = fixedClient.from;
          } else {
            console.error(
              "[Supabase] Metode from yang diperbaiki tidak berfungsi"
            );
            return createDummyClient();
          }
        } catch (fixError) {
          console.error(
            "[Supabase] Error saat memperbaiki metode from:",
            fixError
          );
          return createDummyClient();
        }
      } else {
        console.error("[Supabase] Metode from tidak ditemukan sama sekali");
        return createDummyClient();
      }
    }

    // Uji metode from untuk memastikan berfungsi
    try {
      const testTable = client.from("siswa");
      if (!testTable || typeof testTable.select !== "function") {
        console.error(
          "[Supabase] Metode from tidak mengembalikan objek yang valid"
        );
        return createDummyClient();
      }

      // Tambahan: uji metode select dan eq untuk memastikan chain method berfungsi
      const testQuery = testTable.select("*");
      if (!testQuery || typeof testQuery.eq !== "function") {
        console.error(
          "[Supabase] Metode select tidak mengembalikan objek yang valid"
        );
        return createDummyClient();
      }

      console.log("[Supabase] Semua metode chain berhasil diuji");
    } catch (fromError) {
      console.error("[Supabase] Error saat menguji metode from:", fromError);
      return createDummyClient();
    }

    console.log(
      "[Supabase] Client berhasil dibuat dengan metode from yang valid"
    );

    // Menambahkan metode untuk mengecek koneksi
    const enhancedClient = {
      ...client, // Menggunakan semua metode asli dari client
      // Tambahkan URL dan key untuk akses langsung
      supabaseUrl,
      supabaseKey,
      isOnline: () => connectionStatus.isOnline,

      // Metode untuk mengecek koneksi dan memperbarui status
      checkConnection: async () => {
        try {
          // Gunakan metode testConnection yang lebih aman
          return await enhancedClient.testConnection();
        } catch (error) {
          console.error(
            "[Supabase] Error saat memeriksa koneksi:",
            error.message
          );
          connectionStatus = {
            ...connectionStatus,
            isOnline: false,
            lastChecked: Date.now(),
            retryCount: connectionStatus.retryCount + 1,
          };
          return false;
        }
      },

      // Metode untuk tes koneksi dengan timeout
      testConnection: async (timeout = 3000) => {
        try {
          // Gunakan metode auth.getSession sebagai test yang lebih sederhana dan reliable
          const startTime = Date.now();

          // Create a promise that rejects after timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Connection timeout")), timeout);
          });

          // Create the actual query promise - gunakan getSession yang lebih reliable
          const sessionPromise = client.auth.getSession();
          // Race the two promises
          await Promise.race([sessionPromise, timeoutPromise]);

          const responseTime = Date.now() - startTime;
          console.log(`[Supabase] Response time: ${responseTime}ms`);

          // Update connection status
          connectionStatus = {
            ...connectionStatus,
            isOnline: true,
            lastChecked: Date.now(),
          };

          return true;
        } catch (error) {
          console.error("[Supabase] Connection test failed:", error.message);
          connectionStatus = {
            ...connectionStatus,
            isOnline: false,
            lastChecked: Date.now(),
          };
          return false;
        }
      },

      // Retry mechanism for operations
      retryOperation: async (operation, maxRetries = 3, delay = 1000) => {
        let retries = 0;

        while (retries < maxRetries) {
          try {
            return await operation();
          } catch (error) {
            retries++;
            if (retries >= maxRetries) throw error;
            console.log(
              `[Supabase] Retry ${retries}/${maxRetries} after ${delay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            // Increase delay for next retry (exponential backoff)
            delay *= 2;
          }
        }
      },

      // PENTING: Pastikan metode from selalu tersedia
      from: function (table) {
        if (typeof client.from === "function") {
          return client.from(table);
        } else {
          console.error(
            "[Supabase] Metode from tidak tersedia, menggunakan dummy"
          );
          return createDummyClient().from(table);
        }
      },

      // Tambahkan metode debug untuk melihat fungsi yang tersedia
      debug: () => {
        console.log(
          "[Supabase] Available methods on client:",
          Object.keys(client)
        );
        try {
          const testTable = client.from("siswa");
          console.log(
            "[Supabase] Available methods on from:",
            Object.keys(testTable)
          );
        } catch (error) {
          console.error("[Supabase] Error saat debug metode from:", error);
        }
        return {
          client,
          connectionStatus,
        };
      },
    };

    // Periksa koneksi saat inisialisasi
    enhancedClient.checkConnection().catch((err) => {
      console.error("[Supabase] Initial connection check failed:", err);
      connectionStatus.isOnline = false;
    });

    return enhancedClient;
  } catch (error) {
    console.error("[Supabase] Error membuat client:", error);
    return createDummyClient();
  }
};

// Buat client Supabase yang aman
console.log("[Supabase] Memulai inisialisasi client...");
const supabase = createSafeClient();

// Pastikan supabase client selalu tersedia
if (!supabase) {
  console.error(
    "[Supabase] Failed to initialize client, menggunakan dummy client"
  );
}

// Ekspor auth untuk kompatibilitas
export const auth = supabase
  ? supabase.auth
  : {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    };

// Ekspor status koneksi
export const getConnectionStatus = () => connectionStatus;

// Fungsi untuk memvalidasi ketersediaan Supabase client
export const validateSupabaseClient = () => {
  if (!supabase) {
    console.error("[Supabase] Client tidak tersedia");
    return false;
  }

  if (typeof supabase.from !== "function") {
    console.error("[Supabase] Metode from tidak tersedia pada client");
    return false;
  }

  // Uji metode from untuk memastikan berfungsi
  try {
    const testTable = supabase.from("siswa");
    if (!testTable || typeof testTable.select !== "function") {
      console.error(
        "[Supabase] Metode from tidak mengembalikan objek yang valid"
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Supabase] Error saat validasi client:", error);
    return false;
  }
};

// Ekspor supabase client
export default supabase;
