import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { getPengaturanToko } from "@/lib/pengaturan-toko";
import { simpanPengaturanAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanAdminPengaturan({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;
  const pesanError = params?.error;

  const toko = await getPengaturanToko();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Pengaturan Toko</h1>
        <p className="text-sm text-teks-lembut">
          Atur identitas profil toko, nomor WhatsApp pemesanan, dan jam operasional.
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

      <div className="max-w-2xl rounded-2xl border border-garis bg-permukaan p-6 sm:p-8">
        <form action={simpanPengaturanAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-nama" className="text-xs font-bold uppercase tracking-wider text-teks">
              Nama Toko <span className="text-bahaya">*</span>
            </label>
            <input
              id="input-nama"
              name="nama"
              type="text"
              required
              defaultValue={toko.nama}
              placeholder="Contoh: Toko Berkah UMKM"
              className="rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-tagline" className="text-xs font-bold uppercase tracking-wider text-teks">
              Slogan / Tagline Toko
            </label>
            <input
              id="input-tagline"
              name="tagline"
              type="text"
              defaultValue={toko.tagline || ""}
              placeholder="Contoh: Produk rumahan khas Batam kualitas premium"
              className="rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-wa" className="text-xs font-bold uppercase tracking-wider text-teks">
              Nomor WhatsApp Pesanan <span className="text-bahaya">*</span>
            </label>
            <input
              id="input-wa"
              name="nomorWhatsApp"
              type="tel"
              required
              defaultValue={toko.nomorWhatsApp}
              placeholder="Contoh: 628123456789 atau 08123456789"
              className="rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            />
            <span className="text-xs text-teks-lembut">
              Nomor ini akan digunakan sebagai tujuan utama tombol pesan WhatsApp pada setiap produk.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-jam" className="text-xs font-bold uppercase tracking-wider text-teks">
              Jam Operasional
            </label>
            <input
              id="input-jam"
              name="jamBuka"
              type="text"
              defaultValue={toko.jamBuka || ""}
              placeholder="Contoh: Setiap hari, 08.00–20.00 WIB"
              className="rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-alamat" className="text-xs font-bold uppercase tracking-wider text-teks">
              Alamat Toko / Lokasi
            </label>
            <textarea
              id="input-alamat"
              name="alamat"
              rows={3}
              defaultValue={toko.alamat || ""}
              placeholder="Contoh: Jl. Ahmad Yani No. 12, Batam Center, Batam"
              className="rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <Tombol type="submit" className="w-full sm:w-auto">
              Simpan Pengaturan
            </Tombol>
          </div>
        </form>
      </div>
    </div>
  );
}

