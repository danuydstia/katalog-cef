"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { useKeranjang } from "@/components/PenyediaAplikasi";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [suksesKeranjang, setSuksesKeranjang] = useState(false);
  const { tambahItem } = useKeranjang();

  if (!produk) return null;

  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    (typeof produk.deskripsi === "string" && /\[habis\]/i.test(produk.deskripsi));

  // Jika stok habis, nonaktifkan tombol WhatsApp dan keranjang (US-19)
  if (isHabis) {
    return (
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-bahaya/10 px-2.5 py-1 text-xs font-bold text-bahaya">
          ● Stok Habis
        </span>
        <button
          type="button"
          disabled
          className="inline-flex w-full items-center justify-center rounded-lg bg-garis px-5 py-3 font-semibold text-teks-lembut cursor-not-allowed sm:w-auto"
        >
          Produk Habis
        </button>
      </div>
    );
  }

  const hargaSatuan =
    produk.harga_diskon && Number(produk.harga_diskon) < Number(produk.harga)
      ? Number(produk.harga_diskon)
      : Number(produk.harga);

  const nomor = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";
  const totalHarga = hargaSatuan * jumlah;
  const totalHargaTeks = formatRupiah(totalHarga);

  // Format pesan otomatis: jika jumlah > 1 cantumkan "2x NamaProduk" (US-12)
  const namaPesan = jumlah > 1 ? `${jumlah}x ${produk.nama}` : produk.nama;
  const pesan = `Halo, saya ingin memesan ${namaPesan} seharga ${totalHargaTeks}.`;
  const tautan = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  const handleTambahKeranjang = () => {
    tambahItem(produk, jumlah);
    setSuksesKeranjang(true);
    setTimeout(() => setSuksesKeranjang(false), 2200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pilihan jumlah produk (US-12) */}
      <div className="flex items-center gap-3">
        <label htmlFor="input-jumlah" className="text-sm font-semibold text-teks">
          Jumlah:
        </label>
        <div className="flex items-center rounded-lg border border-garis bg-latar">
          <button
            type="button"
            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
            className="rounded-l-lg px-3 py-1.5 text-base font-bold text-teks hover:bg-permukaan focus:outline-none transition-colors"
            aria-label="Kurangi jumlah"
          >
            -
          </button>
          <input
            id="input-jumlah"
            type="number"
            min={1}
            value={jumlah}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setJumlah(isNaN(val) || val < 1 ? 1 : val);
            }}
            className="w-14 text-center text-sm font-semibold text-teks focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setJumlah((prev) => prev + 1)}
            className="rounded-r-lg px-3 py-1.5 text-base font-bold text-teks hover:bg-permukaan focus:outline-none transition-colors"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
        {jumlah > 1 && (
          <span className="text-sm text-teks-lembut">
            (Total: <strong className="text-teks">{totalHargaTeks}</strong>)
          </span>
        )}
      </div>

      {/* Aksi Pemesanan & Keranjang (US-03, US-12, US-21) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={tautan}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto transition-colors"
        >
          Pesan via WhatsApp
        </a>

        {/* US-21: Tambah ke Keranjang */}
        <button
          type="button"
          onClick={handleTambahKeranjang}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-garis bg-latar px-5 py-3 font-semibold text-teks hover:border-utama hover:text-utama sm:w-auto transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span>{suksesKeranjang ? "✓ Berhasil Ditambahkan" : "Tambah ke Keranjang"}</span>
        </button>
      </div>
    </div>
  );
}
