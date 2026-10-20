import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const URUTAN_FILE = path.join(process.cwd(), "lib", "urutan-data.json");

function bacaUrutanLokal() {
  try {
    if (fs.existsSync(URUTAN_FILE)) {
      const data = fs.readFileSync(URUTAN_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanUrutanLokal(listIds) {
  try {
    fs.writeFileSync(URUTAN_FILE, JSON.stringify(listIds, null, 2), "utf-8");
  } catch {}
}

/**
 * Mengambil daftar urutan ID produk (US-47).
 */
export async function getDaftarUrutan() {
  return bacaUrutanLokal();
}

/**
 * Mengurutkan array produk sesuai urutan yang disimpan (US-47).
 */
export function terapkanUrutanProduk(daftarProduk, urutanIds = null) {
  if (!Array.isArray(daftarProduk) || daftarProduk.length === 0) {
    return [];
  }

  const ids = urutanIds || bacaUrutanLokal();
  if (!ids || ids.length === 0) {
    // Jika produk memiliki kolom urutan numerik langsung di DB
    if (daftarProduk.some((p) => typeof p.urutan === "number")) {
      return [...daftarProduk].sort((a, b) => (a.urutan ?? 99999) - (b.urutan ?? 99999));
    }
    return daftarProduk;
  }

  const indexMap = new Map();
  ids.forEach((id, idx) => {
    indexMap.set(String(id), idx);
  });

  return [...daftarProduk].sort((a, b) => {
    const aUrutan = indexMap.has(String(a.id)) ? indexMap.get(String(a.id)) : 999999;
    const bUrutan = indexMap.has(String(b.id)) ? indexMap.get(String(b.id)) : 999999;
    if (aUrutan !== bUrutan) {
      return aUrutan - bUrutan;
    }
    return (a.id || 0) - (b.id || 0);
  });
}

/**
 * Menggeser urutan posisi produk ke atas (naik) atau ke bawah (turun) (US-47).
 */
export async function geserUrutanProdukInternal(produkId, arah) {
  const supabase = createServerClient();
  let semuaProduk = [];

  try {
    const { data } = await supabase.from("produk").select("id, urutan").order("id", { ascending: true });
    if (data && data.length > 0) {
      semuaProduk = data;
    }
  } catch {}

  let ids = bacaUrutanLokal();
  if (ids.length === 0 && semuaProduk.length > 0) {
    ids = semuaProduk.map((p) => String(p.id));
  }

  const targetIdStr = String(produkId);
  if (!ids.includes(targetIdStr)) {
    ids.push(targetIdStr);
  }

  const currentIndex = ids.indexOf(targetIdStr);
  if (currentIndex === -1) return false;

  const newIndex = arah === "naik" ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0 || newIndex >= ids.length) {
    return false; // Sudah di paling atas atau paling bawah
  }

  // Tukar posisi
  const temp = ids[currentIndex];
  ids[currentIndex] = ids[newIndex];
  ids[newIndex] = temp;

  simpanUrutanLokal(ids);

  // Coba perbarui kolom urutan di Supabase bila kolom urutan tersedia
  try {
    await Promise.all([
      supabase.from("produk").update({ urutan: currentIndex }).eq("id", ids[currentIndex]),
      supabase.from("produk").update({ urutan: newIndex }).eq("id", ids[newIndex]),
    ]);
  } catch {}

  return true;
}

