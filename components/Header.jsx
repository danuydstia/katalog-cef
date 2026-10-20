"use client";

import Link from "next/link";
import { toko } from "@/lib/toko";
import { useTema, useKeranjang, useFavorit } from "@/components/PenyediaAplikasi";

export default function Header() {
  const { tema, toggleTema } = useTema();
  const { totalItem, dimuat: keranjangDimuat } = useKeranjang();
  const { totalFavorit, dimuat: favoritDimuat } = useFavorit();

  return (
    <header className="sticky top-0 z-40 border-b border-garis bg-latar/95 backdrop-blur-sm transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-utama hover:text-utama-gelap transition-colors"
        >
          {toko.nama}
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1 sm:gap-2">
          {/* Link Tentang Toko (US-22) */}
          <Link
            href="/tentang"
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-teks-lembut hover:bg-permukaan hover:text-teks transition-colors"
          >
            Tentang
          </Link>

          {/* Link Favorit (US-24) */}
          <Link
            href="/favorit"
            aria-label="Produk Favorit"
            className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-teks-lembut hover:bg-permukaan hover:text-teks transition-colors"
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="hidden sm:inline">Favorit</span>
            {favoritDimuat && totalFavorit > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-utama px-1.5 text-xs font-bold text-white">
                {totalFavorit}
              </span>
            )}
          </Link>

          {/* Link Keranjang Belanja (US-21) */}
          <Link
            href="/keranjang"
            aria-label="Keranjang Belanja"
            className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-teks-lembut hover:bg-permukaan hover:text-teks transition-colors"
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
            <span className="hidden sm:inline">Keranjang</span>
            {keranjangDimuat && totalItem > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-utama px-1.5 text-xs font-bold text-white">
                {totalItem}
              </span>
            )}
          </Link>

          {/* Tombol Ganti Mode Gelap / Terang (US-25) */}
          <button
            type="button"
            onClick={toggleTema}
            aria-label={tema === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
            title={tema === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
            className="rounded-lg p-2 text-teks-lembut hover:bg-permukaan hover:text-teks focus:outline-none transition-colors"
          >
            {tema === "dark" ? (
              // Icon Matahari (untuk beralih ke terang)
              <svg
                className="h-5 w-5 text-harga"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              // Icon Bulan (untuk beralih ke gelap)
              <svg
                className="h-5 w-5 text-teks-lembut"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
