"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  if (!produk) return null;

  const nomor = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";
  const totalHarga = produk.harga * jumlah;
  const totalHargaTeks = formatRupiah(totalHarga);

  // Format pesan otomatis: jika jumlah > 1 cantumkan "2x NamaProduk" (US-12)
  const namaPesan = jumlah > 1 ? `${jumlah}x ${produk.nama}` : produk.nama;
  const pesan = `Halo, saya ingin memesan ${namaPesan} seharga ${totalHargaTeks}.`;
  const tautan = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

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
            className="rounded-l-lg px-3 py-1.5 text-base font-bold text-teks hover:bg-permukaan focus:outline-none"
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
            className="w-14 text-center text-sm font-semibold text-teks focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setJumlah((prev) => prev + 1)}
            className="rounded-r-lg px-3 py-1.5 text-base font-bold text-teks hover:bg-permukaan focus:outline-none"
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

      <a
        href={tautan}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
