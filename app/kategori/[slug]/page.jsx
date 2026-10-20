import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { getPengaturanToko } from "@/lib/pengaturan-toko";
import { cariKategoriDariSlug } from "@/lib/kategori-slug";
import { terapkanUrutanProduk } from "@/lib/urutan";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const toko = await getPengaturanToko();

  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("produk").select("kategori");
    const daftarKategori = Array.from(new Set((data || []).map((p) => p.kategori).filter(Boolean)));
    const namaKategori = cariKategoriDariSlug(slug, daftarKategori);

    if (!namaKategori) {
      return {
        title: `Kategori Tidak Ditemukan - ${toko.nama}`,
      };
    }

    return {
      title: `${namaKategori} - ${toko.nama}`,
      description: `Katalog produk kategori ${namaKategori} di ${toko.nama}. Siap dipesan lewat WhatsApp.`,
    };
  } catch {
    return {
      title: `Kategori Produk - ${toko.nama}`,
    };
  }
}

export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const toko = await getPengaturanToko();

  let namaKategori = null;
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = createServerClient();

    // 1. Ambil semua kategori untuk pencocokan slug (US-49)
    const { data: semuaData } = await supabase.from("produk").select("kategori");
    const daftarKategori = Array.from(new Set((semuaData || []).map((p) => p.kategori).filter(Boolean)));
    namaKategori = cariKategoriDariSlug(slug, daftarKategori);

    if (namaKategori) {
      // 2. Ambil produk aktif untuk kategori ini
      const { data: produkData, error: produkError } = await supabase
        .from("produk")
        .select("*")
        .eq("kategori", namaKategori)
        .not("deskripsi", "ilike", "%[nonaktif]%");

      if (produkError) {
        pesanError = produkError.message;
      } else {
        daftarProduk = terapkanUrutanProduk(produkData || []);
      }
    }
  } catch (err) {
    pesanError = err?.message || "Gagal memuat kategori.";
  }

  // Jika slug kategori tidak cocok dengan data apa pun (US-49)
  if (!namaKategori) {
    return (
      <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-latar border border-garis flex items-center justify-center text-teks-lembut">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-teks">Kategori tidak ditemukan</h1>
          <p className="text-sm text-teks-lembut max-w-sm">
            Kategori yang Anda tuju tidak tersedia atau belum memiliki produk yang terdaftar.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-flex items-center rounded-xl bg-utama px-5 py-2.5 text-sm font-bold text-white hover:bg-utama-gelap transition-colors"
        >
          &larr; Kembali ke Beranda Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 flex flex-col gap-8">
      {/* Breadcrumb kembali */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama transition-colors"
        >
          &larr; Lihat Semua Produk ({toko.nama})
        </Link>
      </div>

      {/* Header Kategori */}
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-utama/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-utama">
          Kategori Produk
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teks tracking-tight">
          {namaKategori}
        </h1>
        <p className="text-sm text-teks-lembut">
          Menampilkan {daftarProduk.length} produk pilihan dalam kategori ini.
        </p>
      </div>

      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-bahaya">{pesanError}</p>
        </div>
      )}

      {/* Grid Produk Kategori */}
      {daftarProduk.length === 0 && !pesanError ? (
        <div className="rounded-2xl border border-dashed border-garis bg-permukaan p-12 text-center text-teks-lembut">
          Belum ada produk aktif di kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {daftarProduk.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

