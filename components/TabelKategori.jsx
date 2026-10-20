"use client";

import { useState } from "react";
import Tombol from "@/components/Tombol";
import { ubahKategori, hapusKategori } from "@/app/admin/actions";

export default function TabelKategori({ daftarKategori = [] }) {
  const [editKategori, setEditKategori] = useState(null);
  const [namaBaru, setNamaBaru] = useState("");

  const handleMulaiEdit = (kat) => {
    setEditKategori(kat.nama);
    setNamaBaru(kat.nama);
  };

  const handleBatalEdit = () => {
    setEditKategori(null);
    setNamaBaru("");
  };

  const handleKonfirmasiHapus = (e, nama, jumlah) => {
    if (jumlah > 0) {
      e.preventDefault();
      alert(
        `Kategori "${nama}" masih digunakan oleh ${jumlah} produk. Pindahkan atau hapus produk terlebih dahulu.`
      );
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"?`)) {
      e.preventDefault();
    }
  };

  if (daftarKategori.length === 0) {
    return <p className="py-8 text-center text-teks-lembut">Belum ada kategori.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-garis bg-latar">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-garis bg-permukaan text-xs font-bold text-teks-lembut uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3.5">Nama Kategori</th>
            <th className="px-4 py-3.5 text-center">Jumlah Produk</th>
            <th className="px-4 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {daftarKategori.map((kat) => (
            <tr key={kat.nama} className="hover:bg-permukaan/50 transition-colors">
              <td className="px-4 py-3.5 font-medium text-teks">
                {editKategori === kat.nama ? (
                  <form action={ubahKategori} className="flex items-center gap-2">
                    <input type="hidden" name="namaLama" value={kat.nama} />
                    <input
                      type="text"
                      name="namaBaru"
                      value={namaBaru}
                      onChange={(e) => setNamaBaru(e.target.value)}
                      required
                      className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-sm text-teks focus:border-utama focus:outline-none"
                    />
                    <Tombol type="submit" className="py-1 px-3 text-xs">
                      Simpan
                    </Tombol>
                    <button
                      type="button"
                      onClick={handleBatalEdit}
                      className="text-xs text-teks-lembut hover:text-teks"
                    >
                      Batal
                    </button>
                  </form>
                ) : (
                  <span>{kat.nama}</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className="rounded-full bg-permukaan border border-garis px-2.5 py-0.5 text-xs font-semibold text-teks">
                  {kat.jumlahProduk} produk
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                {editKategori !== kat.nama && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleMulaiEdit(kat)}
                      className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition-colors"
                    >
                      Ubah
                    </button>
                    <form
                      action={hapusKategori}
                      onSubmit={(e) => handleKonfirmasiHapus(e, kat.nama, kat.jumlahProduk)}
                    >
                      <input type="hidden" name="nama" value={kat.nama} />
                      <button
                        type="submit"
                        className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-bahaya hover:border-bahaya transition-colors"
                      >
                        Hapus
                      </button>
                    </form>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

