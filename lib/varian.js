import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";

const VARIAN_FILE = path.join(process.cwd(), "lib", "varian-data.json");

function bacaVarianLokal() {
  try {
    if (fs.existsSync(VARIAN_FILE)) {
      const data = fs.readFileSync(VARIAN_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function simpanVarianLokal(daftar) {
  try {
    fs.writeFileSync(VARIAN_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {}
}

/**
 * Mengambil daftar varian untuk satu produk tertentu (US-48).
 */
export async function getVarianByProdukId(produkId) {
  if (!produkId) return [];

  const idTarget = Number(produkId) || produkId;
  let varianDb = [];

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("varian")
      .select("*")
      .eq("produk_id", idTarget)
      .order("harga", { ascending: true });

    if (!error && Array.isArray(data)) {
      varianDb = data;
    }
  } catch {}

  const lokal = bacaVarianLokal().filter(
    (v) => String(v.produk_id) === String(produkId)
  );

  const gabungan = [...varianDb, ...lokal.filter((l) => !varianDb.some((s) => s.id === l.id))];
  return gabungan.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
}

/**
 * Menambahkan varian baru untuk produk (US-48).
 */
export async function tambahVarianInternal({ produk_id, nama_varian, harga }) {
  const cleanProdukId = Number(produk_id) || produk_id;
  const cleanNama = (nama_varian || "").trim();
  const cleanHarga = parseInt(String(harga).replace(/[^0-9]/g, ""), 10);

  if (!cleanNama) {
    throw new Error("Nama varian/ukuran wajib diisi.");
  }
  if (isNaN(cleanHarga) || cleanHarga <= 0) {
    throw new Error("Harga varian harus berupa angka lebih dari 0.");
  }

  const id = `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const varianBaru = {
    id,
    produk_id: cleanProdukId,
    nama_varian: cleanNama,
    harga: cleanHarga,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("varian")
      .insert({
        produk_id: cleanProdukId,
        nama_varian: cleanNama,
        harga: cleanHarga,
      })
      .select()
      .maybeSingle();

    if (data?.id) {
      varianBaru.id = data.id;
    }
  } catch {}

  const lokal = bacaVarianLokal();
  lokal.push(varianBaru);
  simpanVarianLokal(lokal);

  return varianBaru;
}

/**
 * Menghapus varian berdasarkan ID (US-48).
 */
export async function hapusVarianInternal(varianId) {
  if (!varianId) return false;

  try {
    const supabase = createServerClient();
    await supabase.from("varian").delete().eq("id", varianId);
  } catch {}

  const lokal = bacaVarianLokal().filter((v) => String(v.id) !== String(varianId));
  simpanVarianLokal(lokal);

  return true;
}

