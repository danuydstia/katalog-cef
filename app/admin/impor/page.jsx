import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { imporProdukCsvAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanAdminImporCsv({ searchParams }) {
  const params = await searchParams;
  const pesanError = params?.error;
  const berhasilCount = params?.berhasil;
  const gagalCount = params?.gagal;
  let daftarGagal = [];

  if (params?.detailGagal) {
    try {
      daftarGagal = JSON.parse(params.detailGagal);
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Impor Produk dari CSV</h1>
        <p className="text-sm text-teks-lembut">
          Tambahkan banyak produk sekaligus menggunakan file spreadsheet CSV tanpa mengetik satu per satu.
        </p>
      </div>

      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-bahaya">{pesanError}</p>
        </div>
      )}

      {/* Ringkasan Hasil Impor (US-46) */}
      {berhasilCount !== undefined && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-garis bg-permukaan p-5 flex flex-col gap-3">
            <h2 className="text-base font-bold text-teks">Ringkasan Hasil Impor</h2>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col">
                <span className="text-xs font-semibold text-emerald-700">Berhasil Disimpan</span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1">{berhasilCount}</span>
                <span className="text-[11px] text-emerald-600/80">produk masuk katalog</span>
              </div>
              <div className="rounded-xl bg-bahaya/10 border border-bahaya/20 p-4 flex flex-col">
                <span className="text-xs font-semibold text-bahaya">Gagal / Ditolak</span>
                <span className="text-2xl font-extrabold text-bahaya mt-1">{gagalCount || 0}</span>
                <span className="text-[11px] text-bahaya/80">baris bermasalah</span>
              </div>
            </div>

            {daftarGagal.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-bahaya">
                  Daftar Baris yang Gagal:
                </span>
                <div className="overflow-x-auto rounded-xl border border-garis bg-latar p-3">
                  <ul className="flex flex-col gap-1.5 text-xs text-teks-lembut">
                    {daftarGagal.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-bahaya shrink-0">
                          Baris {item.baris}:
                        </span>
                        <span>{item.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Upload CSV */}
      <div className="max-w-2xl rounded-2xl border border-garis bg-permukaan p-6 sm:p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-teks">Pilih File CSV</h2>
          <p className="text-xs text-teks-lembut">
            Format file harus memuat baris judul kolom: <code className="rounded bg-latar px-1.5 py-0.5 font-mono text-teks">nama,harga,kategori,deskripsi</code>.
          </p>
        </div>

        <form action={imporProdukCsvAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="file-csv" className="text-xs font-bold uppercase tracking-wider text-teks">
              File CSV (.csv)
            </label>
            <input
              id="file-csv"
              type="file"
              name="file_csv"
              required
              accept=".csv,text/csv,text/plain"
              className="rounded-xl border border-garis bg-latar p-3 text-sm text-teks file:mr-4 file:rounded-lg file:border-0 file:bg-utama file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white file:hover:bg-utama-gelap"
            />
          </div>

          <div className="rounded-xl border border-garis/60 bg-latar p-4 text-xs text-teks-lembut flex flex-col gap-1.5 leading-relaxed">
            <span className="font-bold text-teks">Contoh isi file CSV yang valid:</span>
            <pre className="font-mono text-[11px] overflow-x-auto p-2 bg-permukaan rounded-lg border border-garis text-teks">
nama,harga,kategori,deskripsi{"\n"}
Kopi Robusta Batam,35000,Minuman,Kopi bubuk asli aroma mantap{"\n"}
Keripik Tempe Renyah,15000,Camilan,Keripik gurih renyah 200gr
            </pre>
            <span>* Kolom <strong>nama</strong> dan <strong>harga</strong> (angka positif) wajib diisi di setiap baris.</span>
          </div>

          <div className="pt-2">
            <Tombol type="submit" className="w-full sm:w-auto">
              Unggah & Impor Produk
            </Tombol>
          </div>
        </form>
      </div>
    </div>
  );
}

