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

export async function POST(request) {
  try {
    // Ambil IP pengunjung untuk rate limiting
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

    const { produkId, pertanyaan } = body;
    const teksPertanyaan = (pertanyaan || "").trim();

    if (!produkId) {
      return NextResponse.json(
        { error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    // Validasi panjang pertanyaan (US-50: batasi panjang pertanyaan)
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

    // Ambil data produk langsung dari server
    let produk = null;
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("produk")
        .select("*")
        .eq("id", produkId)
        .maybeSingle();

      if (!error && data) {
        produk = data;
      }
    } catch {}

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

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Asisten AI belum diaktifkan oleh admin (kunci API belum diatur). Silakan pesan langsung via WhatsApp.",
        },
        { status: 503 }
      );
    }

    // Susun prompt yang ketat: HANYA berdasarkan data produk terkait (US-50)
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

    const modelNames = [
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-1.5-flash",
    ];

    let hasilJawaban = null;
    let lastError = null;

    // Panggil model Gemini dengan timeout 10 detik (US-50)
    for (const model of modelNames) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData?.error?.message || res.statusText;
          if (res.status === 404 || lastError?.includes("not found")) {
            continue;
          }
          break;
        }
      } catch (err) {
        if (err.name === "AbortError") {
          lastError = "Koneksi ke asisten AI terputus (waktu habis / timeout). Silakan coba lagi.";
          break;
        }
        lastError = err.message;
      }
    }

    if (!hasilJawaban) {
      return NextResponse.json(
        {
          error:
            lastError ||
            "Maaf, asisten AI sedang tidak dapat menjawab saat ini. Silakan hubungi toko lewat WhatsApp.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ jawaban: hasilJawaban });
  } catch (err) {
    console.error("[tanya-produk]", err?.message || "Internal server error");
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server asisten AI. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

