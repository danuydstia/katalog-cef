"use client";

import { useState } from "react";

export default function GaleriProduk({ fotoList = [], nama = "" }) {
  const [indeksAktif, setIndeksAktif] = useState(0);

  const fotoUtama = fotoList[indeksAktif] || fotoList[0] || "/produk/kopi.svg";

  return (
    <div className="flex flex-col gap-3">
      {/* Foto Utama */}
      <img
        src={fotoUtama}
        alt={nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />

      {/* Gambar kecil thumbnail (hanya jika ada lebih dari 1 foto - US-18) */}
      {fotoList.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {fotoList.map((foto, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndeksAktif(idx)}
              className={`overflow-hidden rounded-lg border-2 transition-all ${
                indeksAktif === idx
                  ? "border-utama ring-2 ring-utama/20"
                  : "border-garis opacity-70 hover:opacity-100"
              }`}
              aria-label={`Lihat foto ${idx + 1}`}
            >
              <img
                src={foto}
                alt=""
                className="h-16 w-16 object-cover bg-permukaan"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

