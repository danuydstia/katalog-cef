import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerClient } from "@/lib/supabase/server";
import { createSessionClient } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;

  let daftarProduk = [];
  let pesanError = null;

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

    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError =
      err?.message || "Gagal memuat data dashboard. Silakan coba beberapa saat lagi.";
  }

  const errorTampil = params?.error || pesanError;

  // US-30: Ringkasan statistik jumlah produk dan jumlah per kategori
  const totalProduk = daftarProduk.length;

  const hitungPerKategori = {};
  daftarProduk.forEach((produk) => {
    const kat = (produk.kategori || "Tanpa Kategori").trim();
    hitungPerKategori[kat] = (hitungPerKategori[kat] || 0) + 1;
  });

  const daftarKategoriRingkasan = Object.entries(hitungPerKategori).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  const totalKategori = daftarKategoriRingkasan.length;

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />

      {/* Pesan Feedback */}
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
                {totalProduk}
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
                Kategori produk berbeda
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
      </section>

      {/* Bagian Pengelolaan Produk */}
      <section aria-labelledby="judul-kelola" className="flex flex-col gap-4 border-t border-garis pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="judul-kelola" className="text-xl font-bold text-teks">
            Daftar Produk
          </h2>
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>

        {daftarProduk.length === 0 && !errorTampil ? (
          <p className="py-12 text-center text-teks-lembut">Belum ada produk</p>
        ) : (
          <TabelProduk daftarProduk={daftarProduk} />
        )}
      </section>
    </div>
  );
}
