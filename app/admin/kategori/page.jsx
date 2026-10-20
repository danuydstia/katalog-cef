import NavAdmin from "@/components/NavAdmin";
import TabelKategori from "@/components/TabelKategori";
import Tombol from "@/components/Tombol";
import { getDaftarKategori } from "@/lib/kategori";
import { createServerClient } from "@/lib/supabase/server";
import { tambahKategori } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanKelolaKategori({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;
  const pesanError = params?.error;

  const semuaKategori = await getDaftarKategori();

  // Hitung jumlah produk untuk setiap kategori
  let jumlahPerKategori = {};
  try {
    const supabase = createServerClient();
    const { data: daftarProduk } = await supabase.from("produk").select("kategori");
    if (daftarProduk) {
      daftarProduk.forEach((p) => {
        if (p.kategori) {
          jumlahPerKategori[p.kategori] = (jumlahPerKategori[p.kategori] || 0) + 1;
        }
      });
    }
  } catch {}

  const daftarKategoriData = semuaKategori.map((nama) => ({
    nama,
    jumlahProduk: jumlahPerKategori[nama] || 0,
  }));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Kelola Kategori</h1>
        <p className="text-sm text-teks-lembut">
          Tambah, ubah nama, atau hapus kategori produk UMKM.
        </p>
      </div>

      {pesanSukses && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-utama">{pesanSukses}</p>
        </div>
      )}

      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-bahaya">{pesanError}</p>
        </div>
      )}

      {/* Form Tambah Kategori Baru */}
      <div className="rounded-2xl border border-garis bg-permukaan p-5">
        <h2 className="text-sm font-bold text-teks mb-3">Tambah Kategori Baru</h2>
        <form action={tambahKategori} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            name="nama"
            placeholder="Nama kategori baru..."
            required
            className="flex-1 min-w-[200px] rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <Tombol type="submit">Tambah Kategori</Tombol>
        </form>
      </div>

      {/* Tabel Kategori */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-teks">Daftar Kategori ({daftarKategoriData.length})</h2>
        <TabelKategori daftarKategori={daftarKategoriData} />
      </section>
    </div>
  );
}

