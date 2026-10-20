import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { getSemuaBannerAdmin } from "@/lib/banner";
import { simpanBannerAction, toggleBannerAction, hapusBannerAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanAdminBanner({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;
  const pesanError = params?.error;

  const daftarBanner = await getSemuaBannerAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Banner Promo Beranda</h1>
        <p className="text-sm text-teks-lembut">
          Pasang dan atur banner promosi menarik yang tampil di halaman beranda toko.
        </p>
      </div>

      {pesanSukses && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-utama">{pesanSukses}</p>
        </div>
      )}

      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-6 text-center">
          <p className="text-sm font-medium text-bahaya">{pesanError}</p>
        </div>
      )}

      {/* Form Tambah Banner Baru */}
      <div className="rounded-2xl border border-garis bg-permukaan p-5 sm:p-6 flex flex-col gap-4 max-w-xl">
        <h2 className="text-base font-bold text-teks">Tambah Banner Promosi Baru</h2>
        <form action={simpanBannerAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="input-judul" className="text-xs font-bold text-teks uppercase">
              Judul Banner Promo
            </label>
            <input
              id="input-judul"
              type="text"
              name="judul"
              required
              placeholder="Contoh: Diskon Kemerdekaan 20%!"
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="input-teks" className="text-xs font-bold text-teks uppercase">
              Teks Keterangan
            </label>
            <textarea
              id="input-teks"
              name="teks"
              rows={2}
              placeholder="Gunakan kode promo untuk belanja hemat akhir pekan ini."
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="input-tautan" className="text-xs font-bold text-teks uppercase">
              Tautan Tombol (Opsional)
            </label>
            <input
              id="input-tautan"
              type="text"
              name="tautan"
              placeholder="/ atau /produk/1"
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="aktif"
              defaultChecked
              className="h-4 w-4 rounded border-garis text-utama focus:ring-utama"
            />
            <span className="text-sm font-medium text-teks">Langsung aktifkan banner ini</span>
          </label>

          <Tombol type="submit" className="self-start mt-2">
            Simpan Banner
          </Tombol>
        </form>
      </div>

      {/* Daftar Banner */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-teks">Daftar Banner Promo</h2>
        {daftarBanner.length === 0 ? (
          <p className="py-6 text-sm text-teks-lembut">Belum ada banner promosi yang dibuat.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-permukaan text-xs font-bold text-teks-lembut uppercase tracking-wider border-b border-garis">
                <tr>
                  <th className="px-4 py-3.5">Judul & Keterangan</th>
                  <th className="px-4 py-3.5">Tautan</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {daftarBanner.map((b) => (
                  <tr key={b.id} className="hover:bg-permukaan/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-teks">{b.judul}</span>
                        {b.teks && <span className="text-xs text-teks-lembut line-clamp-1">{b.teks}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-teks-lembut">{b.tautan || "-"}</td>
                    <td className="px-4 py-3.5 text-center">
                      {b.aktif ? (
                        <span className="inline-flex items-center rounded-full bg-utama/10 px-2.5 py-0.5 text-xs font-bold text-utama">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-bahaya/10 px-2.5 py-0.5 text-xs font-bold text-bahaya">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleBannerAction}>
                          <input type="hidden" name="id" value={b.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold hover:border-utama hover:text-utama transition-colors"
                          >
                            {b.aktif ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                        <form action={hapusBannerAction}>
                          <input type="hidden" name="id" value={b.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-bahaya hover:border-bahaya transition-colors"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

