"use client";

import { useEffect } from "react";

const STORAGE_KEY = "katalog_terakhir_dilihat";
const MAX_ITEMS = 6;

export default function CatatTerakhirDilihat({ produk }) {
  useEffect(() => {
    if (!produk || !produk.id) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(list)) list = [];

      // Ambil foto utama
      const fotoUtama =
        Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
          ? produk.foto_urls[0]
          : typeof produk.foto_url === "string" && produk.foto_url.includes(",")
          ? produk.foto_url.split(",")[0].trim()
          : produk.foto_url || "/produk/kopi.svg";

      const itemBaru = {
        id: produk.id,
        nama: produk.nama,
        harga: Number(produk.harga),
        harga_diskon: produk.harga_diskon ? Number(produk.harga_diskon) : null,
        kategori: produk.kategori || "",
        foto_url: fotoUtama,
        deskripsi: produk.deskripsi || "",
      };

      // Hapus jika sudah ada sebelumnya agar berpindah ke urutan paling depan
      list = list.filter((item) => String(item.id) !== String(produk.id));
      list.unshift(itemBaru);

      // Batasi maksimal 6 produk
      if (list.length > MAX_ITEMS) {
        list = list.slice(0, MAX_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Abaikan error kuota localStorage
    }
  }, [produk]);

  return null;
}

