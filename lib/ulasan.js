import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const ULASAN_FILE = path.join(process.cwd(), "lib", "ulasan-data.json");

function bacaUlasanLokal() {
  try {
    if (fs.existsSync(ULASAN_FILE)) {
      const data = fs.readFileSync(ULASAN_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanUlasanLokal(daftar) {
  try {
    fs.writeFileSync(ULASAN_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {}
}

/**
 * Mengambil ulasan publik untuk sebuah produk (US-38).
 * Hanya mengambil ulasan yang berstatus 'ditampilkan'.
 */
export async function getUlasanProduk(produkId) {
  const supabase = createServerClient();
  let list = [];

  // 1. Coba baca dari Supabase
  try {
    const { data, error } = await supabase
      .from("ulasan")
      .select("*")
      .eq("produk_id", produkId)
      .eq("status", "ditampilkan")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      list = data;
    }
  } catch {}

  // 2. Gabungkan dengan data lokal jika ada
  const lokal = bacaUlasanLokal().filter(
    (u) => String(u.produk_id) === String(produkId) && u.status !== "disembunyikan"
  );

  const gabungan = [...list, ...lokal.filter((l) => !list.some((s) => s.id === l.id))];

  // Hitung rata-rata rating
  const totalUlasan = gabungan.length;
  const totalSkor = gabungan.reduce((acc, u) => acc + (Number(u.rating) || 0), 0);
  const rataRata = totalUlasan > 0 ? (totalSkor / totalUlasan).toFixed(1) : 0;

  return {
    daftar: gabungan,
    totalUlasan,
    rataRata: Number(rataRata),
  };
}

/**
 * Mengambil semua ulasan untuk moderasi admin (US-39).
 */
export async function getSemuaUlasanAdmin() {
  const supabase = createServerClient();
  let list = [];

  try {
    const { data, error } = await supabase
      .from("ulasan")
      .select("*, produk:produk_id(nama)")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      list = data;
    }
  } catch {}

  const lokal = bacaUlasanLokal();
  const gabungan = [...list, ...lokal.filter((l) => !list.some((s) => s.id === l.id))];
  return gabungan;
}

/**
 * Simpan ulasan baru dari pengunjung (US-38).
 */
export async function tambahUlasanInternal({ produk_id, nama, rating, komentar }) {
  const idUnik = `ul_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const created_at = new Date().toISOString();
  const status = "ditampilkan";

  const dataUlasan = {
    id: idUnik,
    produk_id: Number(produk_id) || produk_id,
    nama: nama.trim(),
    rating: Number(rating),
    komentar: komentar.trim(),
    status,
    created_at,
  };

  // Coba simpan ke Supabase jika tabel ulasan ada
  const supabase = createServerClient();
  try {
    await supabase.from("ulasan").insert({
      produk_id: dataUlasan.produk_id,
      nama: dataUlasan.nama,
      rating: dataUlasan.rating,
      komentar: dataUlasan.komentar,
      status: dataUlasan.status,
    });
  } catch {}

  // Simpan juga ke cache lokal
  const lokal = bacaUlasanLokal();
  lokal.unshift(dataUlasan);
  simpanUlasanLokal(lokal);

  return dataUlasan;
}

/**
 * Moderasi ulasan: ubah status tampil / sembunyikan (US-39).
 */
export async function toggleStatusUlasanInternal(id) {
  const supabase = createServerClient();
  const lokal = bacaUlasanLokal();
  const itemLokal = lokal.find((u) => String(u.id) === String(id));

  let statusSekarang = itemLokal?.status || "ditampilkan";
  const statusBaru = statusSekarang === "ditampilkan" ? "disembunyikan" : "ditampilkan";

  try {
    await supabase.from("ulasan").update({ status: statusBaru }).eq("id", id);
  } catch {}

  if (itemLokal) {
    itemLokal.status = statusBaru;
    simpanUlasanLokal(lokal);
  }

  return statusBaru;
}

/**
 * Hapus ulasan oleh admin (US-39).
 */
export async function hapusUlasanInternal(id) {
  const supabase = createServerClient();
  try {
    await supabase.from("ulasan").delete().eq("id", id);
  } catch {}

  const lokal = bacaUlasanLokal().filter((u) => String(u.id) !== String(id));
  simpanUlasanLokal(lokal);
  return true;
}

