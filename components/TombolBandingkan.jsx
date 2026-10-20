"use client";

import { useBandingkan } from "@/components/PenyediaAplikasi";

export default function TombolBandingkan({ produk, varian = "default", className = "" }) {
  const { isBandingkan, toggleBandingkan } = useBandingkan();
  const aktif = produk ? isBandingkan(produk.id) : false;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (produk) {
      toggleBandingkan(produk);
    }
  };

  if (varian === "ikon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={aktif ? "Batal bandingkan" : "Bandingkan produk ini"}
        title={aktif ? "Batal bandingkan" : "Bandingkan produk"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
          aktif
            ? "border-utama bg-utama/10 text-utama"
            : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
        } ${className}`}
      >
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={aktif ? "Batal bandingkan" : "Bandingkan produk ini"}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
        aktif
          ? "border-utama bg-utama/10 text-utama"
          : "border-garis bg-latar text-teks hover:border-utama hover:text-utama"
      } ${className}`}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span>{aktif ? "Dipilih" : "Bandingkan"}</span>
    </button>
  );
}

