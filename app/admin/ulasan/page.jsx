import NavAdmin from "@/components/NavAdmin";
import TabelUlasanAdmin from "@/components/TabelUlasanAdmin";
import { getSemuaUlasanAdmin } from "@/lib/ulasan";

export const dynamic = "force-dynamic";

export default async function HalamanModerasiUlasan({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;
  const pesanError = params?.error;

  const daftarUlasan = await getSemuaUlasanAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Moderasi Ulasan</h1>
        <p className="text-sm text-teks-lembut">
          Kelola ulasan pembeli: tampilkan, sembunyikan, atau hapus ulasan yang tidak pantas.
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

      <TabelUlasanAdmin daftarUlasan={daftarUlasan} />
    </div>
  );
}

