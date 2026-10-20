import fs from "fs";
import path from "path";
import { toko as tokoBawaan } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

const TOKO_FILE = path.join(process.cwd(), "lib", "toko-data.json");

function bacaTokoLokal() {
  try {
    if (fs.existsSync(TOKO_FILE)) {
      const data = fs.readFileSync(TOKO_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return null;
}

function simpanTokoLokal(data) {
  try {
    fs.writeFileSync(TOKO_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

/**
 * Mengambil pengaturan toko dinamis dari database dengan fallback ke lib/toko.js (US-43).
 */
export async function getPengaturanToko() {
  // 1. Coba baca dari tabel pengaturan di Supabase
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("pengaturan")
      .select("*")
      .eq("kunci", "identitas_toko")
      .maybeSingle();

    if (!error && data?.nilai) {
      const nilai = typeof data.nilai === "string" ? JSON.parse(data.nilai) : data.nilai;
      return {
        ...tokoBawaan,
        ...nilai,
      };
    }
  } catch {}

  // 2. Coba baca dari file lokal
  const lokal = bacaTokoLokal();
  if (lokal && lokal.nama) {
    return {
      ...tokoBawaan,
      ...lokal,
    };
  }

  // 3. Cadangan utama: lib/toko.js
  return tokoBawaan;
}

/**
 * Menyimpan pengaturan toko baru (US-43).
 */
export async function simpanPengaturanTokoInternal(pengaturanBaru) {
  const data = {
    nama: pengaturanBaru.nama.trim(),
    tagline: (pengaturanBaru.tagline || "").trim(),
    nomorWhatsApp: pengaturanBaru.nomorWhatsApp.trim(),
    alamat: pengaturanBaru.alamat.trim(),
    jamBuka: pengaturanBaru.jamBuka.trim(),
  };

  try {
    const supabase = createServerClient();
    await supabase.from("pengaturan").upsert(
      {
        kunci: "identitas_toko",
        nilai: JSON.stringify(data),
      },
      { onConflict: "kunci" }
    );
  } catch {}

  simpanTokoLokal(data);
  return data;
}
