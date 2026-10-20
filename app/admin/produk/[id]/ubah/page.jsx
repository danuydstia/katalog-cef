import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import Tombol from "@/components/Tombol";
import { ubahProduk, tambahVarianAction, hapusVarianAction } from "@/app/admin/actions";
import { createServerClient } from "@/lib/supabase/server";
import { getDaftarKategori } from "@/lib/kategori";
import { getVarianByProdukId } from "@/lib/varian";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const sParams = await searchParams;
  const pesanError = sParams?.error;
  const pesanSukses = sParams?.sukses;

  let produk = null;
  const daftarKategori = await getDaftarKategori();
  const daftarVarian = await getVarianByProdukId(id);

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      produk = data;
    }
  } catch {
    // Jika koneksi gagal atau id tidak valid, produk tetap null
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Ubah produk: {produk.nama}</h1>
        <p className="text-sm text-teks-lembut">
          Perbarui informasi utama produk atau kelola varian harga per ukuran.
        </p>
      </div>

      {pesanSukses && (
        <div className="max-w-xl rounded-xl border border-utama/30 bg-permukaan p-3 text-sm font-medium text-utama">
          {pesanSukses}
        </div>
      )}

      {pesanError && (
        <div className="max-w-xl rounded-xl border border-bahaya/30 bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      <FormProduk
        produk={produk}
        daftarKategori={daftarKategori}
        action={ubahProduk}
        labelTombol="Simpan perubahan"
      />

      {/* US-48: Manajemen Varian Harga / Ukuran Produk */}
      <section className="max-w-xl rounded-2xl border border-garis bg-permukaan p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-teks">Varian Harga & Ukuran</h2>
            <span className="rounded-full bg-utama/10 px-2.5 py-0.5 text-xs font-bold text-utama">
              US-48
            </span>
          </div>
          <p className="text-xs text-teks-lembut">
            Tambahkan opsi ukuran atau varian (contoh: 250gr, 500gr, 1 Liter) dengan harga khusus.
          </p>
        </div>

        {/* Form Tambah Varian */}
        <form action={tambahVarianAction} className="flex flex-col sm:flex-row items-end gap-2.5 pt-2 border-t border-garis">
          <input type="hidden" name="produk_id" value={produk.id} />
          <div className="flex-1 w-full flex flex-col gap-1">
            <label htmlFor="input-varian-nama" className="text-xs font-semibold text-teks">
              Nama Varian / Ukuran
            </label>
            <input
              id="input-varian-nama"
              name="nama_varian"
              type="text"
              required
              placeholder="Contoh: 500gr / Jumbo"
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-36 flex flex-col gap-1">
            <label htmlFor="input-varian-harga" className="text-xs font-semibold text-teks">
              Harga (Rp)
            </label>
            <input
              id="input-varian-harga"
              name="harga"
              type="number"
              required
              min={1}
              placeholder="45000"
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <Tombol type="submit" className="w-full sm:w-auto py-2 px-3 text-xs shrink-0">
            + Tambah
          </Tombol>
        </form>

        {/* Tabel Daftar Varian */}
        <div className="mt-2 overflow-x-auto rounded-xl border border-garis bg-latar">
          {daftarVarian.length === 0 ? (
            <p className="p-4 text-center text-xs text-teks-lembut">
              Belum ada varian ukuran untuk produk ini. Harga produk menggunakan harga standar ({formatRupiah(produk.harga)}).
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-garis bg-permukaan text-teks-lembut uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Nama Varian</th>
                  <th className="px-3 py-2 font-semibold">Harga</th>
                  <th className="px-3 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {daftarVarian.map((v) => (
                  <tr key={v.id} className="hover:bg-permukaan/40 transition-colors">
                    <td className="px-3 py-2 font-medium text-teks">{v.nama_varian}</td>
                    <td className="px-3 py-2 font-semibold text-utama">{formatRupiah(v.harga)}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={hapusVarianAction} className="inline-block">
                        <input type="hidden" name="varian_id" value={v.id} />
                        <input type="hidden" name="produk_id" value={produk.id} />
                        <button
                          type="submit"
                          className="rounded px-2 py-0.5 text-[11px] font-semibold text-bahaya hover:bg-bahaya/10 transition-colors"
                        >
                          Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
