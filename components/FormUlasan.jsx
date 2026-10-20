"use client";

import { useState } from "react";
import Tombol from "@/components/Tombol";
import { tambahUlasan } from "@/app/admin/actions";

export default function FormUlasan({ produkId }) {
  const [rating, setRating] = useState(5);
  const [bintangHover, setBintangHover] = useState(0);
  const [sukses, setSukses] = useState(false);
  const [pesanError, setPesanError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPesanError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("rating", rating.toString());
    formData.set("produk_id", produkId.toString());

    const res = await tambahUlasan(formData);
    setLoading(false);

    if (res?.error) {
      setPesanError(res.error);
    } else {
      setSukses(true);
      e.target.reset();
      setRating(5);
      setTimeout(() => setSukses(false), 4000);
    }
  };

  return (
    <div className="rounded-2xl border border-garis bg-permukaan p-5 sm:p-6 flex flex-col gap-4">
      <h3 className="text-lg font-bold text-teks">Tulis Ulasan Anda</h3>

      {sukses && (
        <div className="rounded-xl border border-utama/30 bg-latar p-3.5 text-center text-sm font-semibold text-utama">
          ✓ Terima kasih! Ulasan Anda berhasil dikirim.
        </div>
      )}

      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-latar p-3.5 text-center text-sm font-semibold text-bahaya">
          {pesanError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* US-38: Perlindungan spam honeypot (tersembunyi dari manusia) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website-trap">Jangan isi bagian ini:</label>
          <input
            id="website-trap"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Pilihan Bintang (1 - 5) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-teks uppercase tracking-wider">
            Rating Produk
          </label>
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating produk dari 1 sampai 5">
            {[1, 2, 3, 4, 5].map((star) => {
              const aktif = (bintangHover || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setBintangHover(star)}
                  onMouseLeave={() => setBintangHover(0)}
                  aria-label={`${star} bintang`}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                >
                  <svg
                    className={`h-7 w-7 transition-colors ${
                      aktif ? "fill-harga text-harga" : "fill-none text-teks-lembut"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              );
            })}
            <span className="ml-2 text-sm font-bold text-teks">{rating} / 5</span>
          </div>
        </div>

        {/* Nama Pengulas */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="input-nama-ulasan" className="text-xs font-bold text-teks uppercase tracking-wider">
            Nama Anda
          </label>
          <input
            id="input-nama-ulasan"
            type="text"
            name="nama"
            maxLength={50}
            required
            placeholder="Contoh: Rina M."
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>

        {/* Komentar Ulasan */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="input-komentar-ulasan" className="text-xs font-bold text-teks uppercase tracking-wider">
            Ulasan / Komentar (Maks. 500 karakter)
          </label>
          <textarea
            id="input-komentar-ulasan"
            name="komentar"
            rows={3}
            maxLength={500}
            required
            placeholder="Ceritakan pengalaman Anda memakai produk ini..."
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>

        <Tombol type="submit" disabled={loading} className="self-start">
          {loading ? "Mengirim..." : "Kirim Ulasan"}
        </Tombol>
      </form>
    </div>
  );
}

