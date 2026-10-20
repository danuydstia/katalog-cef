import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const KATEGORI_FILE = path.join(process.cwd(), "lib", "kategori-kustom.json");

// Baca kategori tambahan lokal jika database belum memiliki tabel kategori terpisah
function bacaKategoriLokal() {
  try {
    if (fs.existsSync(KATEGORI_FILE)) {
      const data = fs.readFileSync(KATEGORI_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanKategoriLokal(daftar) {
  try {
    fs.writeFileSync(KATEGORI_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {}
}

/**
 * Mengambil seluruh daftar kategori:
 * Menggabungkan kategori dari database produk dan tabel/file kategori.
 */
export async function getDaftarKategori() {
  const supabase = createServerClient();
  const setKategori = new Set();

  // 1. Coba baca dari tabel kategori di Supabase jika tabelnya ada
  try {
    const { data: katData, error } = await supabase
      .from("kategori")
      .select("nama")
      .order("nama");

    if (!error && Array.isArray(katData)) {
      katData.forEach((k) => k.nama && setKategori.add(k.nama.trim()));
    }
  } catch {}

  // 2. Ambil dari produk yang ada di database
  try {
    const { data: prodData } = await supabase.from("produk").select("kategori");
    if (prodData) {
      prodData.forEach((p) => p.kategori && setKategori.add(p.kategori.trim()));
    }
  } catch {}

  // 3. Gabungkan kategori lokal
  const lokal = bacaKategoriLokal();
  lokal.forEach((k) => k && setKategori.add(k.trim()));

  return Array.from(setKategori).sort();
}

/**
 * Tambah kategori baru.
 */
export async function tambahKategoriInternal(namaBaru) {
  const cleanNama = namaBaru.trim();
  if (!cleanNama) throw new Error("Nama kategori tidak boleh kosong.");

  const semua = await getDaftarKategori();
  if (semua.some((k) => k.toLowerCase() === cleanNama.toLowerCase())) {
    throw new Error(`Kategori "${cleanNama}" sudah ada.`);
  }

  const supabase = createServerClient();
  try {
    await supabase.from("kategori").insert({ nama: cleanNama });
  } catch {}

  const lokal = bacaKategoriLokal();
  if (!lokal.includes(cleanNama)) {
    lokal.push(cleanNama);
    simpanKategoriLokal(lokal);
  }

  return cleanNama;
}

/**
 * Ubah nama kategori lama menjadi nama baru (sekaligus memperbarui produk terkait).
 */
export async function ubahKategoriInternal(namaLama, namaBaru) {
  const cleanBaru = namaBaru.trim();
  if (!cleanBaru) throw new Error("Nama kategori baru tidak boleh kosong.");

  const supabase = createServerClient();

  // 1. Update kategori di tabel kategori jika ada
  try {
    await supabase.from("kategori").update({ nama: cleanBaru }).eq("nama", namaLama);
  } catch {}

  // 2. Update semua produk yang memakai kategori lama
  const { error: prodError } = await supabase
    .from("produk")
    .update({ kategori: cleanBaru })
    .eq("kategori", namaLama);

  if (prodError) {
    throw new Error(`Gagal memperbarui kategori pada produk: ${prodError.message}`);
  }

  // 3. Update lokal file jika ada
  const lokal = bacaKategoriLokal();
  const index = lokal.indexOf(namaLama);
  if (index !== -1) {
    lokal[index] = cleanBaru;
    simpanKategoriLokal(lokal);
  }

  return cleanBaru;
}

/**
 * Hapus kategori (wajib ditolak jika masih ada produk yang menggunakan kategori ini - US-31).
 */
export async function hapusKategoriInternal(namaHapus) {
  const supabase = createServerClient();

  // Wajib periksa apakah kategori masih dipakai oleh produk
  const { count, error } = await supabase
    .from("produk")
    .select("*", { count: "exact", head: true })
    .eq("kategori", namaHapus);

  if (!error && count && count > 0) {
    throw new Error(
      `Kategori "${namaHapus}" tidak dapat dihapus karena masih digunakan oleh ${count} produk. Pindahkan atau hapus produk terlebih dahulu.`
    );
  }

  // Hapus dari tabel kategori jika ada
  try {
    await supabase.from("kategori").delete().eq("nama", namaHapus);
  } catch {}

  // Hapus dari kategori lokal
  const lokal = bacaKategoriLokal();
  const filtered = lokal.filter((k) => k !== namaHapus);
  simpanKategoriLokal(filtered);

  return true;
}

