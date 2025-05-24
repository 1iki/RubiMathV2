// Debug koneksi Supabase
import supabase from "./config/supabase";

console.log("============ DEBUG KONEKSI SUPABASE ============");

// Validasi ketersediaan Supabase client
const validateClient = () => {
  if (!supabase) {
    console.error("[Supabase] Client tidak tersedia");
    return false;
  }

  if (typeof supabase.from !== "function") {
    console.error("[Supabase] Metode from tidak tersedia pada client");
    return false;
  }

  // Uji metode from
  try {
    const testTable = supabase.from("siswa");
    if (!testTable || typeof testTable.select !== "function") {
      console.error(
        "[Supabase] Metode from tidak mengembalikan objek yang valid"
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Error saat validasi client:", err);
    return false;
  }
};

// Periksa ketersediaan supabase client
console.log("Supabase client tersedia:", supabase ? "Ya" : "Tidak");
if (supabase) {
  console.log("Supabase URL:", supabase.supabaseUrl);
  console.log("Supabase Key tersedia:", supabase.supabaseKey ? "Ya" : "Tidak");
  console.log("Metode yang tersedia:", Object.keys(supabase).join(", "));
  console.log("Validasi client:", validateClient() ? "Valid" : "Tidak valid");
}

// Ekspor fungsi debug
export const checkSupabaseConnection = async () => {
  try {
    const isValid = validateClient();
    if (!isValid) {
      return false;
    }

    // Test koneksi dengan simple query
    const { error } = await supabase.from("siswa").select("id_siswa").limit(1);

    if (error) {
      console.error("[Supabase] Connection test failed:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Supabase] Connection check error:", err);
    return false;
  }
};
