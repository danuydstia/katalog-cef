"use client";

import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk, toggleStatusProduk, geserUrutanAction } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk = [] }) {
  const handleHapus = (e, nama) => {
    if (!window.confirm(`Yakin ingin menghapus produk "${nama}"?`)) {
      e.preventDefault();
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-permukaan text-xs font-bold text-teks-lembut uppercase tracking-wider border-b border-garis">
          <tr>
            <th className="px-4 py-3.5">Produk</th>
            <th className="px-4 py-3.5">Kategori</th>
            <th className="px-4 py-3.5">Harga</th>
            <th className="px-4 py-3.5 text-center">Urutan</th>
            <th className="px-4 py-3.5 text-center">Status</th>
            <th className="px-4 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {daftarProduk.map((produk) => {
            const isNonaktif =
              produk.aktif === false ||
              (typeof produk.deskripsi === "string" && /\[nonaktif\]/i.test(produk.deskripsi));

            return (
              <tr key={produk.id} className="hover:bg-permukaan/40 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={produk.foto_url || "/produk/kopi.svg"}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover border border-garis bg-permukaan"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-teks">{produk.nama}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-teks-lembut">{produk.kategori || "-"}</td>
                <td className="px-4 py-3.5 font-medium text-teks">
                  {formatRupiah(produk.harga)}
                </td>
                {/* US-47: Tombol Naik / Turun Urutan */}
                <td className="px-4 py-3.5 text-center">
                  <div className="inline-flex items-center gap-1">
                    <form action={geserUrutanAction}>
                      <input type="hidden" name="id" value={produk.id} />
                      <input type="hidden" name="arah" value="naik" />
                      <button
                        type="submit"
                        title="Naikkan urutan"
                        className="rounded-md border border-garis bg-latar p-1 text-xs font-bold text-teks-lembut hover:border-utama hover:text-utama hover:bg-permukaan transition-colors"
                      >
                        ▲
                      </button>
                    </form>
                    <form action={geserUrutanAction}>
                      <input type="hidden" name="id" value={produk.id} />
                      <input type="hidden" name="arah" value="turun" />
                      <button
                        type="submit"
                        title="Turunkan urutan"
                        className="rounded-md border border-garis bg-latar p-1 text-xs font-bold text-teks-lembut hover:border-utama hover:text-utama hover:bg-permukaan transition-colors"
                      >
                        ▼
                      </button>
                    </form>
                  </div>
                </td>
                {/* US-32: Kolom Status Aktif/Nonaktif */}
                <td className="px-4 py-3.5 text-center">
                  {isNonaktif ? (
                    <span className="inline-flex items-center rounded-full bg-bahaya/10 px-2.5 py-0.5 text-xs font-bold text-bahaya">
                      ● Nonaktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-utama/10 px-2.5 py-0.5 text-xs font-bold text-utama">
                      ● Aktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* US-32: Tombol Ubah Status */}
                    <form action={toggleStatusProduk}>
                      <input type="hidden" name="id" value={produk.id} />
                      <button
                        type="submit"
                        className={`rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold transition-colors ${
                          isNonaktif
                            ? "text-utama hover:border-utama"
                            : "text-teks-lembut hover:text-bahaya hover:border-bahaya/40"
                        }`}
                        title={isNonaktif ? "Aktifkan produk ini" : "Sembunyikan dari katalog"}
                      >
                        {isNonaktif ? "Aktifkan" : "Nonaktifkan"}
                      </button>
                    </form>

                    <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis" className="py-1 px-2.5 text-xs">
                      Ubah
                    </Tombol>

                    <form
                      action={hapusProduk}
                      onSubmit={(e) => handleHapus(e, produk.nama)}
                    >
                      <input type="hidden" name="id" value={produk.id} />
                      <Tombol type="submit" varian="bahaya" className="py-1 px-2.5 text-xs">
                        Hapus
                      </Tombol>
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
