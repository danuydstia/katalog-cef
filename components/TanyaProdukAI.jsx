"use client";

import { useState } from "react";

export default function TanyaProdukAI({ produkId, namaProduk }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [jawaban, setJawaban] = useState(null);
  const [pesanError, setPesanError] = useState(null);

  const MAX_KARAKTER = 200;

  const handleKirim = async (e) => {
    if (e) e.preventDefault();
    const teks = pertanyaan.trim();
    if (!teks || memuat) return;

    setMemuat(true);
    setPesanError(null);
    setJawaban(null);

    try {
      const res = await fetch("/api/tanya-produk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produkId,
          pertanyaan: teks,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setPesanError(data.error || "Gagal mendapatkan jawaban dari asisten AI.");
      } else {
        setJawaban(data.jawaban);
      }
    } catch {
      setPesanError(
        "Koneksi terputus atau waktu habis. Silakan periksa jaringan dan coba lagi."
      );
    } finally {
      setMemuat(false);
    }
  };

  const pilihPertanyaanCepat = (teks) => {
    setPertanyaan(teks);
  };

  return (
    <div className="rounded-2xl border border-utama/30 bg-gradient-to-b from-utama/5 to-permukaan p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-utama/15 text-utama text-base">
            ✨
          </span>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-teks">
              Tanya Asisten AI tentang Produk Ini
            </h3>
            <p className="text-[11px] text-teks-lembut">
              Dapatkan jawaban instan seputar {namaProduk}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-utama px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
          Asisten AI
        </span>
      </div>

      {/* Rekomendasi Pertanyaan Cepat */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-teks-lembut">Contoh tanya:</span>
        <button
          type="button"
          onClick={() => pilihPertanyaanCepat("Berapa harga dan ada varian apa saja?")}
          className="rounded-full border border-garis bg-latar px-2.5 py-1 text-[11px] font-medium text-teks-lembut hover:border-utama hover:text-utama transition-colors"
        >
          Harga & Varian?
        </button>
        <button
          type="button"
          onClick={() => pilihPertanyaanCepat("Ceritakan deskripsi dan keunggulan produk ini")}
          className="rounded-full border border-garis bg-latar px-2.5 py-1 text-[11px] font-medium text-teks-lembut hover:border-utama hover:text-utama transition-colors"
        >
          Keunggulan produk?
        </button>
        <button
          type="button"
          onClick={() => pilihPertanyaanCepat("Apakah produk ini siap dipesan sekarang?")}
          className="rounded-full border border-garis bg-latar px-2.5 py-1 text-[11px] font-medium text-teks-lembut hover:border-utama hover:text-utama transition-colors"
        >
          Kesiapan pesanan?
        </button>
      </div>

      {/* Form Input Pertanyaan */}
      <form onSubmit={handleKirim} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value.slice(0, MAX_KARAKTER))}
            placeholder={`Tanyakan apa saja tentang ${namaProduk}...`}
            disabled={memuat}
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none pr-16 disabled:opacity-60"
          />
          <span className="absolute right-3 top-3 text-[10px] text-teks-lembut">
            {pertanyaan.length}/{MAX_KARAKTER}
          </span>
        </div>

        <button
          type="submit"
          disabled={memuat || !pertanyaan.trim()}
          className="self-end rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {memuat ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Memikirkan jawaban...</span>
            </>
          ) : (
            <span>Kirim Pertanyaan &rarr;</span>
          )}
        </button>
      </form>

      {/* Kotak Pesan Error */}
      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/5 p-3 text-xs text-bahaya leading-relaxed">
          {pesanError}
        </div>
      )}

      {/* Kotak Jawaban AI */}
      {jawaban && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-utama">
            <span>✨ Jawaban Asisten Toko:</span>
          </div>
          <p className="text-xs leading-relaxed text-teks whitespace-pre-line">
            {jawaban}
          </p>
        </div>
      )}
    </div>
  );
}

