"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

const STORAGE_KEY = "katalog_terakhir_dilihat";

export default function TerakhirDilihat() {
  const [daftar, setDaftar] = useState([]);
  const [dimuat, setDimuat] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          setDaftar(list);
        }
      }
    } catch {
      // Abaikan error parsing
    }
    setDimuat(true);
  }, []);

  const handleKosongkan = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDaftar([]);
    } catch {}
  };

  // US-36: Tidak muncul bila masih kosong
  if (!dimuat || daftar.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="judul-terakhir-dilihat" className="mt-12 flex flex-col gap-4 border-t border-garis pt-8">
      <div className="flex items-center justify-between">
        <h2 id="judul-terakhir-dilihat" className="text-xl font-bold text-teks">
          Terakhir dilihat
        </h2>
        <button
          type="button"
          onClick={handleKosongkan}
          className="text-xs text-teks-lembut hover:text-bahaya transition-colors"
        >
          Hapus riwayat
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {daftar.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}

