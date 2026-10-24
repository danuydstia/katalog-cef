import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getVarianByProdukId } from "@/lib/varian";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

// In-memory rate limiting: batas 5 pertanyaan per menit per IP (US-50)
const rateLimitMap = new Map();

function periksaRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 menit
  const maxRequests = 5;

  const record = rateLimitMap.get(ip) || [];
  const recentRequests = record.filter((timestamp) => now - timestamp < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  // Bersihkan record lama jika map terlalu besar
  if (rateLimitMap.size > 2000) {
    rateLimitMap.clear();
  }

  return true;
}

/**
 * Fallback cerdas berbasis data faktual produk (US-50: jawabannya hanya berdasarkan data produk).
 * Digunakan jika koneksi Google Gemini eksternal mengalami timeout atau gangguan jaringan.
 */
function jawabDariDataProduk(pertanyaan, produk, infoVarian) {
  const tanya = (pertanyaan || "").toLowerCase();
  const nama = produk?.nama || "Produk";
  const hargaTeks = formatRupiah(produk?.harga || 0);
  const deskripsi = produk?.deskripsi || "Produk berkualitas pilihan dari UMKM lokal kami.";
  const isHabis = produk?.stok === 0 || /\[habis\]/i.test(produk?.deskripsi || "");

  // Pertanyaan seputar pemesanan / pembelian / cara beli / whatsapp
  if (
    tanya.includes("pesan") ||
    tanya.includes("beli") ||
    tanya.includes("order") ||
    tanya.includes("cara") ||
    tanya.includes("checkout") ||
    tanya.includes("wa") ||
    tanya.includes("hubungi") ||
    tanya.includes("kirim") ||
    tanya.includes("ongkir")
  ) {
    return `Untuk memesan ${nama}, cukup klik tombol "Pesan via WhatsApp" di halaman ini. Anda akan langsung terhubung dengan admin toko untuk konfirmasi pesanan dan alamat pengiriman.`;
  }

  // Pertanyaan seputar harga / promo / diskon
  if (
    tanya.includes("harga") ||
    tanya.includes("biaya") ||
    tanya.includes("berapa") ||
    tanya.includes("diskon") ||
    tanya.includes("promo") ||
    tanya.includes("murah")
  ) {
    let teks = `Harga ${nama} adalah ${hargaTeks}.`;
    if (infoVarian && !infoVarian.includes("Standar")) {
      teks += ` Tersedia varian: ${infoVarian}.`;
    }
    return `${teks} Anda bisa langsung memesan via tombol WhatsApp di bawah!`;
  }

  // Pertanyaan seputar varian / ukuran
  if (
    tanya.includes("varian") ||
    tanya.includes("ukuran") ||
    tanya.includes("gram") ||
    tanya.includes("liter") ||
    tanya.includes("size") ||
    tanya.includes("pilihan") ||
    tanya.includes("warna")
  ) {
    if (infoVarian && !infoVarian.includes("Standar")) {
      return `Untuk ${nama}, pilihan varian/ukuran yang tersedia: ${infoVarian}. Anda dapat memilih varian yang diinginkan saat memesan.`;
    }
    return `Saat ini ${nama} tersedia dalam pilihan standar seharga ${hargaTeks}.`;
  }

  // Pertanyaan ketersediaan / stok
  if (
    tanya.includes("stok") ||
    tanya.includes("ready") ||
    tanya.includes("habis") ||
    tanya.includes("tersedia") ||
    tanya.includes("ada?") ||
    tanya.includes("masih")
  ) {
    if (isHabis) {
      return `Maaf, stok ${nama} saat ini sedang habis dan akan segera kami sediakan kembali.`;
    }
    return `Ya, ${nama} siap dipesan sekarang dengan harga ${hargaTeks}! Silakan klik "Pesan via WhatsApp".`;
  }

  // Pertanyaan seputar rasa / bahan / masa simpan / expired / halal
  if (
    tanya.includes("halal") ||
    tanya.includes("bpom") ||
    tanya.includes("bahan") ||
    tanya.includes("komposisi") ||
    tanya.includes("awet") ||
    tanya.includes("tahan") ||
    tanya.includes("expired") ||
    tanya.includes("kadaluarsa") ||
    tanya.includes("simpan")
  ) {
    const bersih = deskripsi.replace(/\[(diskon:\s*\d+|baru|terlaris|habis)\]/gi, "").trim();
    return `${nama} dibuat dengan bahan berkualitas UMKM. ${bersih ? `Keterangan produk: "${bersih}".` : ""} Untuk detail masa simpan atau sertifikasi khusus, silakan tanyakan langsung ke admin kami melalui WhatsApp.`;
  }

  // Pertanyaan seputar deskripsi / keunggulan
  if (
    tanya.includes("deskripsi") ||
    tanya.includes("apa itu") ||
    tanya.includes("tentang") ||
    tanya.includes("keunggulan") ||
    tanya.includes("rasa") ||
    tanya.includes("manfaat")
  ) {
    const bersih = deskripsi.replace(/\[(diskon:\s*\d+|baru|terlaris|habis)\]/gi, "").trim();
    return `${nama}: ${bersih}. Harga mulai ${hargaTeks}.`;
  }

  // Jawaban umum berbasis data produk
  return `${nama} (${produk?.kategori || "Produk UMKM"}) tersedia seharga ${hargaTeks}${
    infoVarian && !infoVarian.includes("Standar") ? ` dengan varian ${infoVarian}` : ""
  }. Anda dapat langsung berkonsultasi atau memesan melalui tombol WhatsApp di bawah.`;
}

export async function POST(request) {
  try {
    // 1. Ambil IP pengunjung untuk rate limiting (US-50)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!periksaRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Anda sudah bertanya beberapa kali. Mohon tunggu 1 menit sebelum mengajukan pertanyaan baru.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Data permintaan tidak valid." },
        { status: 400 }
      );
    }

    const { produkId, pertanyaan, produkData } = body;
    const teksPertanyaan = (pertanyaan || "").trim();

    if (!produkId) {
      return NextResponse.json(
        { error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    // 2. Validasi panjang pertanyaan (US-50: batasi panjang pertanyaan)
    if (!teksPertanyaan || teksPertanyaan.length < 3) {
      return NextResponse.json(
        { error: "Pertanyaan terlalu pendek. Tuliskan minimal 3 karakter." },
        { status: 400 }
      );
    }

    if (teksPertanyaan.length > 200) {
      return NextResponse.json(
        { error: "Pertanyaan terlalu panjang. Maksimal 200 karakter." },
        { status: 400 }
      );
    }

    // 3. Ambil data produk di sisi server
    let produk = null;
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("produk")
        .select("*")
        .eq("id", Number(produkId) || produkId)
        .maybeSingle();

      if (data) {
        produk = data;
      }
    } catch {}

    if (!produk && produkData && produkData.nama) {
      produk = produkData;
    }

    if (!produk) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // Ambil data varian jika ada (US-48)
    const varianList = await getVarianByProdukId(produkId);
    const infoVarian =
      varianList.length > 0
        ? varianList.map((v) => `${v.nama_varian}: ${formatRupiah(v.harga)}`).join(", ")
        : "Standar (tanpa varian tambahan)";

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      ""
    ).trim();

    // 4. Susun prompt: HANYA berdasarkan data produk terkait (US-50)
    const promptSystem = `Anda adalah asisten toko ramah dan membantu untuk UMKM. Tugas Anda HANYA menjawab pertanyaan pengunjung mengenai SATU produk di bawah ini berdasarkan informasi yang diberikan.
JANGAN MENGARANG informasi di luar data yang tercantum. Jika jawaban tidak tercantum di data produk, katakan dengan sopan bahwa informasi tersebut belum tercantum dan sarankan untuk bertanya langsung melalui tombol WhatsApp kepada pemilik toko.
Gunakan bahasa Indonesia yang santun, ramah, dan ringkas (1-3 kalimat).

DATA PRODUK:
- Nama Produk: ${produk.nama}
- Kategori: ${produk.kategori || "Umum"}
- Harga Dasar: ${formatRupiah(produk.harga)}
- Varian & Ukuran: ${infoVarian}
- Deskripsi: ${produk.deskripsi || "Tidak ada keterangan khusus"}
- Status: ${produk.stok === 0 ? "Stok habis" : "Tersedia"}

PERTANYAAN PENGUNJUNG:
"${teksPertanyaan}"`;

    let hasilJawaban = null;

    // Jika apiKey tersedia, panggil Gemini API dengan batas waktu respons cepat (maksimal 3.5 detik per panggilan)
    if (apiKey) {
      const modelNames = [
        "gemini-flash-lite-latest",
        "gemini-3.5-flash-lite",
      ];

      for (const model of modelNames) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 detik per model agar UX responsif

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptSystem }] }],
              }),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            hasilJawaban = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (hasilJawaban) break;
          }
        } catch {
          // Timeout atau error koneksi pada model ini -> coba model cadangan atau langsung fallback
          continue;
        }
      }
    }

    // 5. Fallback cerdas: Jika Gemini tidak aktif, kuota habis, atau koneksi timeout
    if (!hasilJawaban) {
      hasilJawaban = jawabDariDataProduk(teksPertanyaan, produk, infoVarian);
    }

    return NextResponse.json({ jawaban: hasilJawaban });
  } catch (err) {
    console.error("[tanya-produk]", err?.message || "Internal server error");
    return NextResponse.json({
      jawaban:
        "Mohon maaf, sistem sedang memproses antrean. Untuk mendapatkan informasi lengkap mengenai produk ini, silakan klik tombol 'Pesan via WhatsApp' untuk terhubung langsung dengan penjual.",
    });
  }
}
