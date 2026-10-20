"use client";

import { toggleStatusUlasan, hapusUlasan } from "@/app/admin/actions";

export default function TabelUlasanAdmin({ daftarUlasan = [] }) {
  const handleHapus = (e) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ulasan ini secara permanen?")) {
      e.preventDefault();
    }
  };

  if (daftarUlasan.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-garis bg-permukaan p-10 text-center text-sm text-teks-lembut">
        Belum ada ulasan yang masuk dari pembeli.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-permukaan text-xs font-bold text-teks-lembut uppercase tracking-wider border-b border-garis">
          <tr>
            <th className="px-4 py-3.5">Produk</th>
            <th className="px-4 py-3.5">Pengulas</th>
            <th className="px-4 py-3.5">Rating</th>
            <th className="px-4 py-3.5">Komentar</th>
            <th className="px-4 py-3.5 text-center">Status</th>
            <th className="px-4 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {daftarUlasan.map((u) => {
            const isDisembunyikan = u.status === "disembunyikan";

            return (
              <tr key={u.id} className="hover:bg-permukaan/40 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-teks">
                  {u.produk?.nama || `Produk #${u.produk_id}`}
                </td>
                <td className="px-4 py-3.5 font-medium text-teks">{u.nama}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center text-harga font-bold">
                    <span>★ {u.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-teks-lembut max-w-xs break-words">
                  {u.komentar}
                </td>
                {/* US-39: Status Ulasan */}
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  {isDisembunyikan ? (
                    <span className="inline-flex items-center rounded-full bg-bahaya/10 px-2.5 py-0.5 text-xs font-bold text-bahaya">
                      Disembunyikan
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-utama/10 px-2.5 py-0.5 text-xs font-bold text-utama">
                      Ditampilkan
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <form action={toggleStatusUlasan}>
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className={`rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold transition-colors ${
                          isDisembunyikan
                            ? "text-utama hover:border-utama"
                            : "text-teks-lembut hover:text-bahaya hover:border-bahaya/50"
                        }`}
                      >
                        {isDisembunyikan ? "Tampilkan" : "Sembunyikan"}
                      </button>
                    </form>

                    <form action={hapusUlasan} onSubmit={handleHapus}>
                      <input type="hidden" name="id" value={u.id} />
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

