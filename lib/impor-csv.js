import { createServerClient } from "@/lib/supabase/server";

/**
 * Parsing teks CSV menjadi baris-baris data produk dan memvalidasi setiap baris (US-46).
 */
export function parseDanValidasiCsv(csvText) {
  if (!csvText || typeof csvText !== "string") {
    return {
      barisValid: [],
      barisGagal: [{ baris: 0, error: "File CSV kosong atau tidak valid." }],
    };
  }

  // Pisahkan baris (CRLF atau LF)
  const barisList = csvText
    .split(/\r\n|\n|\r/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (barisList.length < 2) {
    return {
      barisValid: [],
      barisGagal: [
        {
          baris: 1,
          error: "File CSV harus memiliki baris header dan minimal satu baris data produk.",
        },
      ],
    };
  }

  // Deteksi pemisah (koma atau titik koma)
  const headerLine = barisList[0];
  const pemisah = headerLine.includes(";") && !headerLine.includes(",") ? ";" : ",";

  // Helper untuk parsing baris CSV dengan penanganan tanda kutip ganda
  const parseRow = (text) => {
    const hasil = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === pemisah && !inQuotes) {
        hasil.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    hasil.push(current.trim());
    return hasil;
  };

  const headers = parseRow(headerLine).map((h) =>
    h.toLowerCase().replace(/["\s_-]/g, "")
  );

  const idxNama = headers.findIndex((h) => h === "nama" || h === "namaproduk" || h === "title");
  const idxHarga = headers.findIndex((h) => h === "harga" || h === "price");
  const idxKategori = headers.findIndex((h) => h === "kategori" || h === "category");
  const idxDeskripsi = headers.findIndex((h) => h === "deskripsi" || h === "description");
  const idxFoto = headers.findIndex((h) => h === "foto" || h === "fotourl" || h === "image");

  if (idxNama === -1 || idxHarga === -1) {
    return {
      barisValid: [],
      barisGagal: [
        {
          baris: 1,
          error: `Header wajib memuat kolom 'nama' dan 'harga'. Kolom terdeteksi: ${headers.join(", ")}`,
        },
      ],
    };
  }

  const barisValid = [];
  const barisGagal = [];

  for (let i = 1; i < barisList.length; i++) {
    const nomorBaris = i + 1;
    const row = parseRow(barisList[i]);

    // Lewati baris kosong
    if (row.length === 0 || (row.length === 1 && !row[0])) {
      continue;
    }

    const nama = row[idxNama]?.replace(/^["']|["']$/g, "").trim() || "";
    const hargaRaw = row[idxHarga]?.replace(/^["']|["']$/g, "").trim() || "";
    const kategori = idxKategori !== -1 ? row[idxKategori]?.replace(/^["']|["']$/g, "").trim() || null : null;
    const deskripsi = idxDeskripsi !== -1 ? row[idxDeskripsi]?.replace(/^["']|["']$/g, "").trim() || null : null;
    const foto_url = idxFoto !== -1 && row[idxFoto] ? row[idxFoto].replace(/^["']|["']$/g, "").trim() : "/produk/kopi.svg";

    // Validasi Kolom Wajib Nama
    if (!nama) {
      barisGagal.push({
        baris: nomorBaris,
        error: "Kolom nama produk wajib diisi dan tidak boleh kosong.",
      });
      continue;
    }

    // Validasi Kolom Wajib Harga (Angka > 0)
    const hargaAngkaBersih = hargaRaw.replace(/[^0-9]/g, "");
    const harga = parseInt(hargaAngkaBersih, 10);

    if (isNaN(harga) || harga <= 0) {
      barisGagal.push({
        baris: nomorBaris,
        error: `Harga harus berupa angka lebih dari 0. Diterima: "${hargaRaw || "(kosong)"}"`,
      });
      continue;
    }

    barisValid.push({
      nama,
      harga,
      kategori,
      deskripsi,
      foto_url: foto_url || "/produk/kopi.svg",
    });
  }

  return { barisValid, barisGagal };
}

/**
 * Menyimpan batch baris produk yang valid ke Supabase (US-46).
 */
export async function simpanProdukImpor(barisValid) {
  if (!barisValid || barisValid.length === 0) {
    return { count: 0, error: null };
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("produk").insert(barisValid).select("id");

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: data?.length || barisValid.length, error: null };
  } catch (err) {
    return { count: 0, error: err?.message || "Gagal menghubungkan ke database." };
  }
}

