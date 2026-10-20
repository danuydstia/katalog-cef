/**
 * Helper untuk mengubah nama kategori menjadi URL slug yang ramah SEO (US-49).
 */
export function kategoriKeSlug(kategori) {
  if (!kategori) return "";
  return kategori
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Mencari nama asli kategori berdasarkan URL slug (US-49).
 */
export function cariKategoriDariSlug(slug, daftarKategori) {
  if (!slug || !Array.isArray(daftarKategori)) return null;

  const slugBersih = decodeURIComponent(slug).toLowerCase().trim();

  // 1. Cocokkan dengan hasil kategoriKeSlug
  const matched = daftarKategori.find(
    (kat) => kategoriKeSlug(kat) === slugBersih
  );
  if (matched) return matched;

  // 2. Cocokkan langsung jika slug sama dengan nama lowercase
  const directMatch = daftarKategori.find(
    (kat) => kat.toLowerCase().trim() === slugBersih
  );
  if (directMatch) return directMatch;

  return null;
}

