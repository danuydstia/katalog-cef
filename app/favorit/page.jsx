"use client";

import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { useFavorit } from "@/components/PenyediaAplikasi";

export default function HalamanFavorit() {
  const { daftarFavorit, totalFavorit, dimuat } = useFavorit();

  if (!dimuat) {
    return (
      <div className="py-12 text-center text-teks-lembut">
        <p>Memuat produk favorit...</p>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      {/* Navigasi kembali */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama mb-6 transition-colors"
      >
        &larr; Kembali ke katalog
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-teks">
          Produk Favorit
        </h1>
        <p className="text-sm text-teks-lembut">
          Koleksi produk yang telah Anda tandai sebagai favorit tersimpan rapi di sini.
        </p>
      </div>

      {daftarFavorit.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-garis bg-permukaan p-10 text-center flex flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-latar border border-garis text-teks-lembut">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-teks">Belum ada produk favorit</h2>
            <p className="text-sm text-teks-lembut">
              Ketuk ikon hati pada produk di katalog untuk menyimpannya di daftar favorit ini.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-utama px-6 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap transition-colors"
          >
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-teks">
              Menampilkan {totalFavorit} produk favorit
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarFavorit.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

