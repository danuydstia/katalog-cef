import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const LOG_FILE = path.join(process.cwd(), "lib", "log-data.json");

function bacaLogLokal() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanLogLokal(daftar) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {}
}

/**
 * Mencatat aktivitas perubahan oleh admin (US-45).
 */
export async function catatLogAktivitas({ user_email, aksi, detail }) {
  const logItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_email: user_email || "admin",
    aksi, // contoh: 'TAMBAH_PRODUK', 'UBAH_PRODUK', 'HAPUS_PRODUK'
    detail,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = createServerClient();
    await supabase.from("log_aktivitas").insert({
      user_email: logItem.user_email,
      aksi: logItem.aksi,
      detail: logItem.detail,
    });
  } catch {}

  const list = bacaLogLokal();
  list.unshift(logItem);
  if (list.length > 500) {
    list.pop();
  }
  simpanLogLokal(list);

  return logItem;
}

/**
 * Mengambil 50 log aktivitas terakhir untuk dashboard admin (US-45).
 */
export async function getLogAktivitas(limit = 50) {
  let list = [];

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("log_aktivitas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(data)) {
      list = data;
    }
  } catch {}

  const lokal = bacaLogLokal();
  const gabungan = [...list, ...lokal.filter((l) => !list.some((s) => s.id === l.id))];

  return gabungan
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}
