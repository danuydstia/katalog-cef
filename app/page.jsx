import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.toString().trim() || "";
  const kategoriDipilih = params?.kategori?.toString().trim() || "";
  const urutan = params?.urutan?.toString().trim() || "";

  let daftarProduk = [];
  let pesanError = null;
  let daftarKategori = [];

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

    // US-11 & US-15: Bangun query dengan pencarian, filter, dan pengurutan di database
    let query = supabase.from("produk").select("*");

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

    const { data, error } = await query;

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError =
      err?.message || "Gagal memuat daftar produk. Silakan coba beberapa saat lagi.";
  }

  const isFiltering = Boolean(q || (kategoriDipilih && kategoriDipilih !== "semua"));

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
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

            {(q || kategoriDipilih || urutan) && (
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
