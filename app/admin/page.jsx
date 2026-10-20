import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerClient } from "@/lib/supabase/server";
import { createSessionClient } from "@/lib/supabase/session";
import { getTopProdukKlik } from "@/lib/klik-wa";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;
  const q = params?.q?.toString().trim() || "";
  const page = Math.max(1, parseInt(params?.page || "1", 10));
  const LIMIT = 10; // US-33: 10 produk per halaman di tabel admin

  let daftarProduk = [];
  let pesanError = null;
  let totalSemuaProduk = 0;
  let totalFiltered = 0;
  let daftarKategoriRingkasan = [];
  let totalKategori = 0;
  let topProdukList = [];

  try {
    topProdukList = await getTopProdukKlik(5);
  } catch {}

  try {
    let supabase;
    try {
      const sessionClient = await createSessionClient();
      const {
        data: { user },
      } = await sessionClient.auth.getUser();
      supabase = user ? sessionClient : createServerClient();
    } catch {
      supabase = createServerClient();
    }

    // 1. Ambil data ringkasan semua produk untuk metrik dashboard (US-30)
    const { data: semuaData, count: countSemua } = await supabase
      .from("produk")
      .select("kategori", { count: "exact" });

    totalSemuaProduk = countSemua || 0;

    const hitungPerKategori = {};
    (semuaData || []).forEach((p) => {
      const kat = (p.kategori || "Tanpa Kategori").trim();
      hitungPerKategori[kat] = (hitungPerKategori[kat] || 0) + 1;
    });

    daftarKategoriRingkasan = Object.entries(hitungPerKategori).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    totalKategori = daftarKategoriRingkasan.length;

    // 2. Query pencarian dan paginasi daftar produk admin (US-33)
    let listQuery = supabase.from("produk").select("*", { count: "exact" });

    if (q) {
      listQuery = listQuery.ilike("nama", `%${q}%`);
    }

    const from = (page - 1) * LIMIT;
    const to = from + LIMIT - 1;
    listQuery = listQuery.order("id", { ascending: true }).range(from, to);

    const { data: listData, count: countFiltered, error: listError } = await listQuery;

    if (listError) {
      pesanError = `Gagal memuat produk: ${listError.message}`;
    } else {
      daftarProduk = listData || [];
      totalFiltered = countFiltered || 0;
    }
  } catch (err) {
    pesanError =
      err?.message || "Gagal memuat data dashboard. Silakan coba beberapa saat lagi.";
  }

  const errorTampil = params?.error || pesanError;
  const totalHalaman = Math.max(1, Math.ceil(totalFiltered / LIMIT));

  // Helper pembuat link paginasi yang mempertahankan kata kunci pencarian (US-33)
  const buatUrlPaginasi = (targetPage) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("page", targetPage.toString());
    return `/admin?${sp.toString()}`;
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />

      {/* Pesan Feedback Sukses / Error */}
      {pesanSukses && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-utama">{pesanSukses}</p>
        </div>
      )}

      {errorTampil && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-6 text-center">
          <p className="text-sm font-medium text-bahaya">{errorTampil}</p>
        </div>
      )}

      {/* US-30: Dashboard Ringkasan Admin */}
      <section aria-labelledby="judul-dashboard" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 id="judul-dashboard" className="text-2xl font-extrabold text-teks">
            Dashboard Ringkasan
          </h1>
          <p className="text-sm text-teks-lembut">
            Ringkasan status katalog dan jumlah produk langsung dari database.
          </p>
        </div>

        {/* Kartu Metrik Utama */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Produk */}
          <div className="rounded-2xl border border-garis bg-permukaan p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-teks-lembut uppercase tracking-wider">
                Total Produk
              </span>
              <span className="text-3xl font-extrabold text-teks mt-1">
                {totalSemuaProduk}
              </span>
              <span className="text-xs text-teks-lembut mt-0.5">
                Produk tersimpan di database
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-utama/10 text-utama">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          {/* Total Kategori */}
          <div className="rounded-2xl border border-garis bg-permukaan p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-teks-lembut uppercase tracking-wider">
                Total Kategori
              </span>
              <span className="text-3xl font-extrabold text-teks mt-1">
                {totalKategori}
              </span>
              <span className="text-xs text-teks-lembut mt-0.5">
                Kategori produk terdaftar
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-utama/10 text-utama">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Distribusi Produk per Kategori */}
        {daftarKategoriRingkasan.length > 0 && (
          <div className="rounded-2xl border border-garis bg-permukaan p-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-teks">
              Jumlah Produk per Kategori
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {daftarKategoriRingkasan.map(([kategori, jumlah]) => (
                <div
                  key={kategori}
                  className="flex flex-col rounded-xl border border-garis bg-latar p-3 transition-colors"
                >
                  <span className="text-xs font-medium text-teks-lembut truncate" title={kategori}>
                    {kategori}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-extrabold text-utama">
                      {jumlah}
                    </span>
                    <span className="text-xs text-teks-lembut">produk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* US-41: 5 Produk Paling Sering Dipesan (WhatsApp) */}
        <div className="rounded-2xl border border-garis bg-permukaan p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-teks">
                5 Produk Paling Sering Dipesan (WhatsApp)
              </h2>
              <p className="text-xs text-teks-lembut">
                Diurutkan berdasarkan jumlah klik tombol pesan WhatsApp oleh pengunjung.
              </p>
            </div>
            <span className="rounded-full bg-utama/10 px-2.5 py-1 text-xs font-bold text-utama">
              US-41
            </span>
          </div>

          {topProdukList.length === 0 ? (
            <p className="py-4 text-center text-xs text-teks-lembut">
              Belum ada data pemesanan WhatsApp yang tercatat.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {topProdukList.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="relative flex flex-col justify-between rounded-xl border border-garis bg-latar p-3.5 transition hover:border-utama/40"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-utama text-[11px] font-extrabold text-white">
                        #{idx + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z"/>
                        </svg>
                        {prod.jumlahKlik} klik
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-teks line-clamp-2 mt-1" title={prod.nama}>
                      {prod.nama}
                    </h3>
                    <span className="text-xs text-teks-lembut">
                      {prod.kategori || "Umum"}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-garis/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-utama">
                      {formatRupiah(prod.harga)}
                    </span>
                    <a
                      href={`/produk/${prod.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-teks-lembut hover:text-utama"
                    >
                      Lihat &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bagian Pengelolaan Produk, Pencarian & Paginasi (US-33), Ekspor CSV (US-35) */}
      <section aria-labelledby="judul-kelola" className="flex flex-col gap-4 border-t border-garis pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <h2 id="judul-kelola" className="text-xl font-bold text-teks">
              Daftar Produk
            </h2>
            <span className="text-sm text-teks-lembut">
              ({totalFiltered} produk)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* US-35: Tombol Ekspor CSV */}
            <a
              href="/api/admin/ekspor-csv"
              className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold text-teks hover:border-utama hover:text-utama transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Ekspor CSV</span>
            </a>

            <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
          </div>
        </div>

        {/* US-33: Form Pencarian di Admin */}
        <form method="GET" action="/admin" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama produk di admin..."
            className="flex-1 max-w-sm rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <Tombol type="submit" className="py-2 px-3 text-xs">
            Cari
          </Tombol>
          {q && (
            <a
              href="/admin"
              className="text-xs text-teks-lembut hover:text-utama underline underline-offset-4"
            >
              Reset
            </a>
          )}
        </form>

        {daftarProduk.length === 0 && !errorTampil ? (
          <p className="py-12 text-center text-teks-lembut">
            {q ? "Tidak ada produk yang cocok dengan pencarian." : "Belum ada produk"}
          </p>
        ) : (
          <>
            <TabelProduk daftarProduk={daftarProduk} />

            {/* US-33: Navigasi Paginasi Admin */}
            {totalHalaman > 1 && (
              <nav
                aria-label="Paginasi produk admin"
                className="flex items-center justify-center gap-3 pt-4"
              >
                {page > 1 ? (
                  <a
                    href={buatUrlPaginasi(page - 1)}
                    className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition-colors"
                  >
                    &larr; Sebelumnya
                  </a>
                ) : (
                  <span className="rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-xs font-semibold text-teks-lembut opacity-40 cursor-not-allowed">
                    &larr; Sebelumnya
                  </span>
                )}

                <span className="text-xs text-teks-lembut">
                  Halaman <strong className="text-teks">{page}</strong> dari{" "}
                  <strong className="text-teks">{totalHalaman}</strong>
                </span>

                {page < totalHalaman ? (
                  <a
                    href={buatUrlPaginasi(page + 1)}
                    className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition-colors"
                  >
                    Selanjutnya &rarr;
                  </a>
                ) : (
                  <span className="rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-xs font-semibold text-teks-lembut opacity-40 cursor-not-allowed">
                    Selanjutnya &rarr;
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
