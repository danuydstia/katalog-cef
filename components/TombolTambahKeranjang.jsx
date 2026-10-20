"use client";

import { useState } from "react";
import { useKeranjang } from "@/components/PenyediaAplikasi";

export default function TombolTambahKeranjang({
  produk,
  jumlah = 1,
  lengkap = false,
  className = "",
}) {
  const { tambahItem } = useKeranjang();
  const [sukses, setSukses] = useState(false);

  if (!produk) return null;

  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    (typeof produk.deskripsi === "string" && /\[habis\]/i.test(produk.deskripsi));

  if (isHabis) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    tambahItem(produk, jumlah);
    setSukses(true);
    setTimeout(() => setSukses(false), 2000);
  };

  if (lengkap) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-garis bg-latar px-5 py-3 font-semibold text-teks hover:border-utama hover:text-utama transition-colors ${className}`}
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
        <span>{sukses ? "✓ Dimasukkan ke Keranjang" : "Tambah ke Keranjang"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Tambah ${produk.nama} ke keranjang`}
      title="Tambah ke keranjang"
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-latar text-teks hover:border-utama hover:text-utama transition-colors ${className}`}
    >
      {sukses ? (
        <span className="text-xs font-bold text-utama">✓</span>
      ) : (
        <svg
          className="h-4 w-4"
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
      )}
    </button>
  );
}

