"use client";

import { useState } from "react";

export default function TombolBagikan({ produk }) {
  const [feedback, setFeedback] = useState(null);

  const handleBagikan = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: produk?.nama || "Produk",
      text: produk?.deskripsi ? `${produk.nama}: ${produk.deskripsi}` : produk?.nama,
      url: url,
    };

    // US-23: Pakai Web Share API jika didukung oleh peramban
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setFeedback("Berhasil dibagikan!");
        setTimeout(() => setFeedback(null), 2500);
        return;
      } catch (err) {
        // Jika pengguna membatalkan dialog share, tidak perlu fallback
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: Salin ke clipboard
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setFeedback("Link tersalin!");
      setTimeout(() => setFeedback(null), 2500);
    } catch {
      setFeedback("Gagal menyalin tautan");
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleBagikan}
        className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition-colors"
        aria-label="Bagikan atau salin link produk"
        title="Bagikan produk ini"
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
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span>Bagikan</span>
      </button>

      {/* Umpan balik setelah ditekan (US-23) */}
      {feedback && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-teks px-2.5 py-1 text-xs font-medium text-latar shadow-md transition-opacity animate-in fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}

