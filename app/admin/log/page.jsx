import NavAdmin from "@/components/NavAdmin";
import { getLogAktivitas } from "@/lib/log-aktivitas";

export const dynamic = "force-dynamic";

function formatWaktu(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function lencanaAksi(aksi) {
  switch (aksi) {
    case "TAMBAH_PRODUK":
      return <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Tambah Produk</span>;
    case "UBAH_PRODUK":
      return <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-700">Ubah Produk</span>;
    case "HAPUS_PRODUK":
      return <span className="rounded-full bg-bahaya/15 px-2.5 py-0.5 text-xs font-bold text-bahaya">Hapus Produk</span>;
    case "SIMPAN_BANNER":
      return <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-bold text-purple-700">Banner Promo</span>;
    case "UBAH_PENGATURAN":
      return <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700">Pengaturan Toko</span>;
    case "TAMBAH_ADMIN":
      return <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-bold text-teal-700">Tambah Admin</span>;
    case "HAPUS_ADMIN":
      return <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-700">Hapus Admin</span>;
    default:
      return <span className="rounded-full bg-gray-500/15 px-2.5 py-0.5 text-xs font-bold text-gray-700">{aksi}</span>;
  }
}

export default async function HalamanAdminLog() {
  const daftarLog = await getLogAktivitas(50);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Log Aktivitas Admin</h1>
        <p className="text-sm text-teks-lembut">
          Riwayat 50 perubahan terakhir yang dilakukan oleh pengelola toko.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis bg-permukaan shadow-sm">
        {daftarLog.length === 0 ? (
          <div className="p-8 text-center text-sm text-teks-lembut">
            Belum ada catatan aktivitas admin.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-garis bg-latar text-xs uppercase text-teks-lembut">
              <tr>
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Admin</th>
                <th className="px-4 py-3 font-semibold">Jenis Aksi</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {daftarLog.map((item) => (
                <tr key={item.id} className="hover:bg-latar/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-teks-lembut whitespace-nowrap">
                    {formatWaktu(item.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-teks whitespace-nowrap">
                    {item.user_email || "Admin"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {lencanaAksi(item.aksi)}
                  </td>
                  <td className="px-4 py-3 text-xs text-teks leading-relaxed">
                    {item.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

