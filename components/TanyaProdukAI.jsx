"use client";

import { useState } from "react";

export default function TanyaProdukAI({
  produkId,
  namaProduk,
  produk,
  nomorWhatsApp,
  varianList = [],
}) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [jawaban, setJawaban] = useState(null);
  const [pesanError, setPesanError] = useState(null);

  const MAX_KARAKTER = 200;
  const namaTarget = produk?.nama || namaProduk || "Produk";
  const idTarget = produk?.id || produkId;

  const kirimPertanyaan = async (teksManual) => {
    const teks = (teksManual || pertanyaan).trim();
    if (!teks || memuat) return;

    setMemuat(true);
    setPesanError(null);
    setJawaban(null);

    try {
      const res = await fetch("/api/tanya-produk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produkId: idTarget,
          pertanyaan: teks,
          produkData: produk
            ? {
                nama: produk.nama,
                harga: produk.harga,
                kategori: produk.kategori,
                deskripsi: produk.deskripsi,
                stok: produk.stok,
              }
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setPesanError(
          data.error || "Gagal mendapatkan respon dari asisten AI. Silakan coba kembali."
        );
      } else {
        setJawaban(data.jawaban);
      }
    } catch {
      setPesanError(
        "Koneksi terputus atau waktu habis. Anda dapat mencoba lagi atau bertanya langsung ke penjual via WhatsApp."
      );
    } finally {
      setMemuat(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    kirimPertanyaan(pertanyaan);
  };

  const pilihPertanyaanCepat = (teks) => {
    setPertanyaan(teks);
    kirimPertanyaan(teks);
  };

  const nomorWaBersih = nomorWhatsApp ? nomorWhatsApp.replace(/\D/g, "") : "";
  const waUrl = nomorWaBersih
    ? `https://wa.me/${nomorWaBersih}?text=${encodeURIComponent(
        `Halo, saya ingin bertanya tentang ${namaTarget}: ${pertanyaan || "Berapa harganya dan apakah stok tersedia?"}`
      )}`
    : null;

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
              Jawaban instan dan otomatis seputar {namaTarget}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-utama px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
          Asisten AI
        </span>
      </div>

      {/* Rekomendasi Pertanyaan Cepat (Satu Klik Langsung Bertanya) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-teks-lembut">Contoh tanya cepat:</span>
        <button
          type="button"
          disabled={memuat}
          onClick={() => pilihPertanyaanCepat("Berapa harga dan ada pilihan varian apa saja?")}
          className="rounded-full border border-garis bg-latar px-2.5 py-1 text-[11px] font-medium text-teks-lembut hover:border-utama hover:text-utama disabled:opacity-60 transition-colors"
        >
          Harga & Varian?
        </button>
        <button
          type="button"
          disabled={memuat}
          onClick={() => pilihPertanyaanCepat("Ceritakan deskripsi dan keunggulan produk ini")}
          className="rounded-full border border-garis bg-latar px-2.5 py-1 text-[11px] font-medium text-teks-lembut hover:border-utama hover:text-utama disabled:opacity-60 transition-colors"
        >
          Keunggulan produk?
        </button>
        <button
          type="button"
          disabled={memuat}
          onClick={() => pilihPertanyaanCepat("Apakah produk ini siap dipesan sekarang?")}
          className="rounded-full border border-garis bg-latar px-2.5 py-1 text-[11px] font-medium text-teks-lembut hover:border-utama hover:text-utama disabled:opacity-60 transition-colors"
        >
          Kesiapan stok?
        </button>
      </div>

      {/* Form Input Pertanyaan (US-50: panjang pertanyaan dibatasi max 200) */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={pertanyaan}
            maxLength={MAX_KARAKTER}
            onChange={(e) => setPertanyaan(e.target.value.slice(0, MAX_KARAKTER))}
            placeholder={`Tanyakan apa saja tentang ${namaTarget}...`}
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
          className="self-end rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
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

      {/* Kotak Pesan Error & Solusi Pemulihan */}
      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/5 p-3.5 flex flex-col gap-2">
          <p className="text-xs text-bahaya leading-relaxed font-medium">
            {pesanError}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => kirimPertanyaan(pertanyaan)}
              className="rounded-lg border border-bahaya/40 bg-latar px-3 py-1 text-xs font-semibold text-bahaya hover:bg-bahaya/10 transition-colors cursor-pointer"
            >
              🔄 Coba Lagi
            </button>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
              >
                <span>💬 Tanya via WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Kotak Jawaban AI */}
      {jawaban && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-utama">
              ✨ Jawaban Asisten Toko:
            </span>
            <button
              type="button"
              onClick={() => {
                setJawaban(null);
                setPertanyaan("");
              }}
              className="text-[11px] text-teks-lembut hover:text-utama"
            >
              Tutup / Tanya lagi
            </button>
          </div>
          <p className="text-xs leading-relaxed text-teks whitespace-pre-line font-medium">
            {jawaban}
          </p>
        </div>
      )}
    </div>
  );
}
