"use client";

import { useFavorit } from "@/components/PenyediaAplikasi";

export default function TombolFavorit({ produk, varian = "default", className = "" }) {
  const { isFavorit, toggleFavorit } = useFavorit();
  const aktif = produk ? isFavorit(produk.id) : false;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (produk) {
      toggleFavorit(produk);
    }
  };

  if (varian === "ikon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={aktif ? "Hapus dari favorit" : "Tambah ke favorit"}
        title={aktif ? "Hapus dari favorit" : "Tambah ke favorit"}
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-latar/80 backdrop-blur-sm border border-garis/60 shadow-sm transition-transform hover:scale-110 active:scale-95 ${className}`}
      >
        <svg
          className={`h-4.5 w-4.5 transition-colors ${
            aktif ? "fill-bahaya text-bahaya" : "fill-none text-teks-lembut hover:text-bahaya"
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={aktif ? 1 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={aktif ? "Hapus dari favorit" : "Tambah ke favorit"}
      title={aktif ? "Hapus dari favorit" : "Tambah ke favorit"}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold transition-colors hover:border-bahaya/50 ${
        aktif ? "text-bahaya" : "text-teks hover:text-bahaya"
      } ${className}`}
    >
      <svg
        className={`h-4 w-4 transition-colors ${
          aktif ? "fill-bahaya text-bahaya" : "fill-none text-teks-lembut"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={aktif ? 1 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{aktif ? "Favorit" : "Simpan"}</span>
    </button>
  );
}

