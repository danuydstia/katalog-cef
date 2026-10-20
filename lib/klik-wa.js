import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const KLIK_FILE = path.join(process.cwd(), "lib", "klik-data.json");

function bacaKlikLokal() {
  try {
    if (fs.existsSync(KLIK_FILE)) {
      const data = fs.readFileSync(KLIK_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanKlikLokal(daftar) {
  try {
    fs.writeFileSync(KLIK_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {}
}

/**
 * Mencatat klik pemesanan WhatsApp (US-40).
 * Tanpa menyimpan data pribadi pengunjung sama sekali (hanya ID produk dan waktu).
 */
export async function catatKlikWhatsAppInternal(produkId) {
  if (!produkId) return false;

  const idProduk = Number(produkId) || produkId;
  const waktu = new Date().toISOString();

  // 1. Coba catat ke Supabase jika tabel klik_pesan ada
  const supabase = createServerClient();
  try {
    await supabase.from("klik_pesan").insert({
      produk_id: idProduk,
      created_at: waktu,
    });
  } catch {}

  // 2. Simpan juga ke cache lokal
  try {
    const list = bacaKlikLokal();
    list.push({ produk_id: idProduk, created_at: waktu });
    // Pertahankan maksimal 10.000 log terakhir
    if (list.length > 10000) {
      list.shift();
    }
    simpanKlikLokal(list);
  } catch {}

  return true;
}

/**
 * Mengambil ringkasan jumlah klik per produk (US-41).
 */
export async function getStatistikKlik() {
  const supabase = createServerClient();
  let dataKlik = [];

  try {
    const { data, error } = await supabase.from("klik_pesan").select("produk_id");
    if (!error && Array.isArray(data)) {
      dataKlik = data;
    }
  } catch {}

  const lokal = bacaKlikLokal();
  const semua = [...dataKlik, ...lokal];

  const frekuensi = {};
  semua.forEach((item) => {
    const id = String(item.produk_id);
    frekuensi[id] = (frekuensi[id] || 0) + 1;
  });

  return frekuensi;
}

