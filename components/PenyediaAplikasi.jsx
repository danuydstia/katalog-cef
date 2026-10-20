"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ==========================================
// 1. TEMA (DARK MODE - US-25)
// ==========================================
const TemaContext = createContext({
  tema: "light",
  toggleTema: () => {},
});

export function useTema() {
  return useContext(TemaContext);
}

// ==========================================
// 2. KERANJANG BELANJA (CART - US-21)
// ==========================================
const KeranjangContext = createContext({
  items: [],
  tambahItem: () => {},
  ubahJumlah: () => {},
  hapusItem: () => {},
  kosongkanKeranjang: () => {},
  totalItem: 0,
  totalHarga: 0,
  dimuat: false,
});

export function useKeranjang() {
  return useContext(KeranjangContext);
}

// ==========================================
// 3. FAVORIT (WISHLIST - US-24)
// ==========================================
const FavoritContext = createContext({
  daftarFavorit: [],
  isFavorit: () => false,
  toggleFavorit: () => {},
  hapusFavorit: () => {},
  totalFavorit: 0,
  dimuat: false,
});

export function useFavorit() {
  return useContext(FavoritContext);
}

// ==========================================
// PENYEDIA UTAMA
// ==========================================
const STORAGE_KERANJANG = "katalog_keranjang";
const STORAGE_FAVORIT = "katalog_favorit";
const STORAGE_TEMA = "tema";

export default function PenyediaAplikasi({ children }) {
  // State Tema
  const [tema, setTema] = useState("light");

  // State Keranjang
  const [keranjang, setKeranjang] = useState([]);
  const [keranjangDimuat, setKeranjangDimuat] = useState(false);

  // State Favorit
  const [favorit, setFavorit] = useState([]);
  const [favoritDimuat, setFavoritDimuat] = useState(false);

  // Inisialisasi dari localStorage setelah mount di browser
  useEffect(() => {
    // 1. Inisialisasi Tema
    try {
      const temaDisimpan = localStorage.getItem(STORAGE_TEMA);
      if (
        temaDisimpan === "dark" ||
        (!temaDisimpan && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        setTema("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTema("light");
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Fallback aman jika localStorage diblokir
    }

    // 2. Inisialisasi Keranjang
    try {
      const keranjangDisimpan = localStorage.getItem(STORAGE_KERANJANG);
      if (keranjangDisimpan) {
        setKeranjang(JSON.parse(keranjangDisimpan));
      }
    } catch {
      // Abaikan jika parsing gagal
    }
    setKeranjangDimuat(true);

    // 3. Inisialisasi Favorit
    try {
      const favoritDisimpan = localStorage.getItem(STORAGE_FAVORIT);
      if (favoritDisimpan) {
        setFavorit(JSON.parse(favoritDisimpan));
      }
    } catch {
      // Abaikan jika parsing gagal
    }
    setFavoritDimuat(true);
  }, []);

  // Handler Tema
  const toggleTema = () => {
    const temaBaru = tema === "light" ? "dark" : "light";
    setTema(temaBaru);
    try {
      localStorage.setItem(STORAGE_TEMA, temaBaru);
      if (temaBaru === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Abaikan error penyimpanan
    }
  };

  // Handler Keranjang
  const simpanKeranjang = (itemsBaru) => {
    setKeranjang(itemsBaru);
    try {
      localStorage.setItem(STORAGE_KERANJANG, JSON.stringify(itemsBaru));
    } catch {
      // Abaikan error penyimpanan
    }
  };

  const tambahItem = (produk, qty = 1) => {
    if (!produk || qty < 1) return;

    // Tentukan foto utama
    const foto =
      Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
        ? produk.foto_urls[0]
        : typeof produk.foto_url === "string" && produk.foto_url.includes(",")
        ? produk.foto_url.split(",")[0].trim()
        : produk.foto_url || "/produk/kopi.svg";

    // Hitung diskon dari kolom database atau tag [diskon: 35000]
    const diskonDeskripsi =
      typeof produk.deskripsi === "string"
        ? produk.deskripsi.match(/\[diskon:\s*(\d+)\]/i)?.[1]
        : null;

    const hargaDiskon =
      produk.harga_diskon != null
        ? Number(produk.harga_diskon)
        : diskonDeskripsi
        ? Number(diskonDeskripsi)
        : null;

    const hasDiskon = Boolean(hargaDiskon) && hargaDiskon < Number(produk.harga);

    const index = keranjang.findIndex((item) => String(item.id) === String(produk.id));
    let itemsBaru;

    if (index >= 0) {
      itemsBaru = [...keranjang];
      itemsBaru[index] = {
        ...itemsBaru[index],
        jumlah: itemsBaru[index].jumlah + qty,
      };
    } else {
      itemsBaru = [
        ...keranjang,
        {
          id: produk.id,
          nama: produk.nama,
          harga: Number(produk.harga),
          harga_diskon: hasDiskon ? hargaDiskon : null,
          kategori: produk.kategori || "",
          foto_url: foto,
          jumlah: qty,
        },
      ];
    }
    simpanKeranjang(itemsBaru);
  };

  const ubahJumlah = (id, jumlahBaru) => {
    if (jumlahBaru <= 0) {
      hapusItem(id);
      return;
    }
    const itemsBaru = keranjang.map((item) =>
      String(item.id) === String(id) ? { ...item, jumlah: jumlahBaru } : item
    );
    simpanKeranjang(itemsBaru);
  };

  const hapusItem = (id) => {
    const itemsBaru = keranjang.filter((item) => String(item.id) !== String(id));
    simpanKeranjang(itemsBaru);
  };

  const kosongkanKeranjang = () => {
    simpanKeranjang([]);
  };

  const totalItem = keranjang.reduce((acc, item) => acc + (item.jumlah || 0), 0);

  const totalHarga = keranjang.reduce((acc, item) => {
    const hargaSatuan =
      item.harga_diskon && Number(item.harga_diskon) < Number(item.harga)
        ? Number(item.harga_diskon)
        : Number(item.harga);
    return acc + hargaSatuan * (item.jumlah || 1);
  }, 0);

  // Handler Favorit
  const simpanFavorit = (itemsBaru) => {
    setFavorit(itemsBaru);
    try {
      localStorage.setItem(STORAGE_FAVORIT, JSON.stringify(itemsBaru));
    } catch {
      // Abaikan error penyimpanan
    }
  };

  const isFavorit = (id) => {
    return favorit.some((item) => String(item.id) === String(id));
  };

  const toggleFavorit = (produk) => {
    if (!produk) return;

    const ada = favorit.some((item) => String(item.id) === String(produk.id));
    let itemsBaru;

    if (ada) {
      itemsBaru = favorit.filter((item) => String(item.id) !== String(produk.id));
    } else {
      const foto =
        Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
          ? produk.foto_urls[0]
          : typeof produk.foto_url === "string" && produk.foto_url.includes(",")
          ? produk.foto_url.split(",")[0].trim()
          : produk.foto_url || "/produk/kopi.svg";

      const diskonDeskripsi =
        typeof produk.deskripsi === "string"
          ? produk.deskripsi.match(/\[diskon:\s*(\d+)\]/i)?.[1]
          : null;

      const hargaDiskon =
        produk.harga_diskon != null
          ? Number(produk.harga_diskon)
          : diskonDeskripsi
          ? Number(diskonDeskripsi)
          : null;

      const hasDiskon = Boolean(hargaDiskon) && hargaDiskon < Number(produk.harga);

      itemsBaru = [
        ...favorit,
        {
          id: produk.id,
          nama: produk.nama,
          harga: Number(produk.harga),
          harga_diskon: hasDiskon ? hargaDiskon : null,
          kategori: produk.kategori || "",
          foto_url: foto,
          stok: produk.stok,
          status_stok: produk.status_stok,
          deskripsi: produk.deskripsi || "",
          badge: produk.badge || null,
        },
      ];
    }
    simpanFavorit(itemsBaru);
  };

  const hapusFavorit = (id) => {
    const itemsBaru = favorit.filter((item) => String(item.id) !== String(id));
    simpanFavorit(itemsBaru);
  };

  return (
    <TemaContext.Provider value={{ tema, toggleTema }}>
      <KeranjangContext.Provider
        value={{
          items: keranjang,
          tambahItem,
          ubahJumlah,
          hapusItem,
          kosongkanKeranjang,
          totalItem,
          totalHarga,
          dimuat: keranjangDimuat,
        }}
      >
        <FavoritContext.Provider
          value={{
            daftarFavorit: favorit,
            isFavorit,
            toggleFavorit,
            hapusFavorit,
            totalFavorit: favorit.length,
            dimuat: favoritDimuat,
          }}
        >
          {children}
        </FavoritContext.Provider>
      </KeranjangContext.Provider>
    </TemaContext.Provider>
  );
}
