import KartuProduk from "@/components/KartuProduk";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import BannerPromo from "@/components/BannerPromo";
import { getPengaturanToko } from "@/lib/pengaturan-toko";
import { getBannerAktif } from "@/lib/banner";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.toString().trim() || "";
  const kategoriDipilih = params?.kategori?.toString().trim() || "";
  const urutan = params?.urutan?.toString().trim() || "";
  const LIMIT = 12; // US-16: 12 produk per halaman (cocok untuk 2 kolom HP dan 3 kolom desktop)
  const page = Math.max(1, parseInt(params?.page || "1", 10));

  const toko = await getPengaturanToko();
  const banner = await getBannerAktif();

  let daftarProduk = [];
  let pesanError = null;
  let daftarKategori = [];
  let totalProduk = 0;

  try {
    const supabase = createServerClient();

    // Ambil daftar kategori unik langsung dari database
    const { data: semuaKategori } = await supabase
      .from("produk")
      .select("kategori");

    if (semuaKategori) {
      daftarKategori = Array.from(
        new Set(semuaKategori.map((p) => p.kategori).filter(Boolean))
      ).sort();
    }

    // US-11, US-15, US-16, US-32: Bangun query dengan count, filter, urutan, dan range paginasi
    let query = supabase.from("produk").select("*", { count: "exact" });

    // US-32: Saring hanya produk aktif di katalog publik
    query = query.not("deskripsi", "ilike", "%[nonaktif]%");

    // Filter pencarian nama produk (US-11)
    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    // Filter kategori (US-11)
    if (kategoriDipilih && kategoriDipilih !== "semua") {
      query = query.eq("kategori", kategoriDipilih);
    }

    // Urutan produk di database (US-15)
    if (urutan === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal") {
      query = query.order("harga", { ascending: false });
    } else if (urutan === "terbaru") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("id", { ascending: true });
    }

    // Paginasi di database query (US-16)
    const from = (page - 1) * LIMIT;
    const to = from + LIMIT - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
      totalProduk = count || 0;
    }
  } catch (err) {
    pesanError =
      err?.message || "Gagal memuat daftar produk. Silakan coba beberapa saat lagi.";
  }

  const isFiltering = Boolean(q || (kategoriDipilih && kategoriDipilih !== "semua"));
  const totalHalaman = Math.max(1, Math.ceil(totalProduk / LIMIT));

  // Fungsi pembuat link paginasi yang mempertahankan filter, pencarian, dan urutan
  const buatUrlHalaman = (halamanBaru) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (kategoriDipilih) sp.set("kategori", kategoriDipilih);
    if (urutan) sp.set("urutan", urutan);
    sp.set("page", halamanBaru.toString());
    return `/?${sp.toString()}`;
  };

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      {/* US-42: Banner Promo Beranda */}
      <BannerPromo banner={banner} />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
            {totalProduk > 0 && (
              <span className="ml-2 text-sm font-normal text-teks-lembut">
                ({totalProduk} produk)
              </span>
            )}
          </h2>

          {/* Form Pencarian, Filter Kategori (US-11), dan Urutan (US-15) */}
          <form method="GET" action="/" className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari produk..."
              className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />

            <select
              name="kategori"
              defaultValue={kategoriDipilih}
              className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks focus:border-utama focus:outline-none"
            >
              <option value="">Semua kategori</option>
              {daftarKategori.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>

            <select
              name="urutan"
              defaultValue={urutan}
              className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks focus:border-utama focus:outline-none"
            >
              <option value="">Urutkan: Bawaan</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
              <option value="terbaru">Terbaru</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-utama px-4 py-1.5 text-sm font-semibold text-white hover:bg-utama-gelap"
            >
              Terapkan
            </button>

            {(q || kategoriDipilih || urutan || page > 1) && (
              <a
                href="/"
                className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks-lembut hover:text-utama"
              >
                Reset
              </a>
            )}
          </form>
        </div>

        {pesanError ? (
          <div className="rounded-xl border border-bahaya/30 bg-permukaan p-6 text-center">
            <p className="text-sm font-medium text-bahaya">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="rounded-xl border border-dashed border-garis bg-permukaan p-10 text-center">
            <p className="text-teks-lembut">
              {isFiltering
                ? "Tidak ada produk yang sesuai dengan pencarian atau filter."
                : "Belum ada produk"}
            </p>
            {isFiltering && (
              <a
                href="/"
                className="mt-3 inline-block text-sm font-semibold text-utama underline underline-offset-4"
              >
                Lihat semua produk
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            {/* Navigasi Paginasi (US-16) */}
            {totalHalaman > 1 && (
              <nav aria-label="Paginasi produk" className="flex items-center justify-center gap-3 pt-6 pb-4">
                {page > 1 ? (
                  <a
                    href={buatUrlHalaman(page - 1)}
                    className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
                  >
                    &larr; Sebelumnya
                  </a>
                ) : (
                  <span className="rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-sm font-semibold text-teks-lembut opacity-40 cursor-not-allowed">
                    &larr; Sebelumnya
                  </span>
                )}

                <span className="text-sm text-teks-lembut">
                  Halaman <strong className="text-teks">{page}</strong> dari{" "}
                  <strong className="text-teks">{totalHalaman}</strong>
                </span>

                {page < totalHalaman ? (
                  <a
                    href={buatUrlHalaman(page + 1)}
                    className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
                  >
                    Selanjutnya &rarr;
                  </a>
                ) : (
                  <span className="rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-sm font-semibold text-teks-lembut opacity-40 cursor-not-allowed">
                    Selanjutnya &rarr;
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>

      {/* US-36: Riwayat Terakhir Dilihat */}
      <TerakhirDilihat />
    </>
  );
}
