import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const BANNER_FILE = path.join(process.cwd(), "lib", "banner-data.json");

function bacaBannerLokal() {
  try {
    if (fs.existsSync(BANNER_FILE)) {
      const data = fs.readFileSync(BANNER_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanBannerLokal(daftar) {
  try {
    fs.writeFileSync(BANNER_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {}
}

/**
 * Mengambil banner promosi yang sedang aktif (US-42).
 */
export async function getBannerAktif() {
  // 1. Coba baca dari Supabase
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .eq("aktif", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch {}

  // 2. Fallback lokal
  const lokal = bacaBannerLokal();
  const aktif = lokal.find((b) => b.aktif === true);
  return aktif || null;
}

/**
 * Mengambil semua banner untuk dikelola admin (US-42).
 */
export async function getSemuaBannerAdmin() {
  let list = [];

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      list = data;
    }
  } catch {}

  const lokal = bacaBannerLokal();
  const gabungan = [...list, ...lokal.filter((l) => !list.some((s) => s.id === l.id))];
  return gabungan;
}

/**
 * Simpan / Buat banner baru (US-42).
 */
export async function simpanBannerInternal({ judul, teks, gambar_url, tautan, aktif = true }) {
  const id = `bnr_${Date.now()}`;
  const bannerBaru = {
    id,
    judul: judul.trim(),
    teks: (teks || "").trim(),
    gambar_url: (gambar_url || "").trim(),
    tautan: (tautan || "").trim(),
    aktif: Boolean(aktif),
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = createServerClient();
    await supabase.from("banner").insert({
      judul: bannerBaru.judul,
      teks: bannerBaru.teks,
      gambar_url: bannerBaru.gambar_url,
      tautan: bannerBaru.tautan,
      aktif: bannerBaru.aktif,
    });
  } catch {}

  const lokal = bacaBannerLokal();
  lokal.unshift(bannerBaru);
  simpanBannerLokal(lokal);

  return bannerBaru;
}

/**
 * Ubah status aktif / nonaktif banner (US-42).
 */
export async function toggleBannerInternal(id) {
  const lokal = bacaBannerLokal();
  const item = lokal.find((b) => String(b.id) === String(id));
  const newStatus = item ? !item.aktif : false;

  try {
    const supabase = createServerClient();
    await supabase.from("banner").update({ aktif: newStatus }).eq("id", id);
  } catch {}

  if (item) {
    item.aktif = newStatus;
    simpanBannerLokal(lokal);
  }

  return newStatus;
}

/**
 * Hapus banner.
 */
export async function hapusBannerInternal(id) {
  try {
    const supabase = createServerClient();
    await supabase.from("banner").delete().eq("id", id);
  } catch {}

  const lokal = bacaBannerLokal().filter((b) => String(b.id) !== String(id));
  simpanBannerLokal(lokal);
  return true;
}
