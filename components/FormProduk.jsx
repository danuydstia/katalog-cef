"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);
  const [namaFileFoto, setNamaFileFoto] = useState("");
  const [previewFoto, setPreviewFoto] = useState("");

  const handleBuatDeskripsiAI = async () => {
    if (!nama.trim()) {
      setPesanAI({
        tipe: "error",
        teks: "Isi nama produk terlebih dahulu sebelum membuat deskripsi AI.",
      });
      return;
    }

    setLoadingAI(true);
    setPesanAI(null);

    const hasil = await buatDeskripsiAI(nama, kategori);

    setLoadingAI(false);

    if (hasil?.error) {
      setPesanAI({ tipe: "error", teks: hasil.error });
    } else if (hasil?.deskripsi) {
      setDeskripsi(hasil.deskripsi);
      setPesanAI({
        tipe: "sukses",
        teks: "Deskripsi berhasil dibuat dengan AI!",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNamaFileFoto(file.name);
      setPreviewFoto(URL.createObjectURL(file));
    } else {
      setNamaFileFoto("");
      setPreviewFoto("");
    }
  };

  return (
    <form action={action} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />

      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />

      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
      />

      {/* US-29: Input file foto untuk upload ke Supabase Storage */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="input-foto-file" className="text-sm font-semibold text-teks">
          Upload foto dari perangkat (Supabase Storage)
        </label>
        <input
          id="input-foto-file"
          type="file"
          name="foto_file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1 file:text-xs file:font-semibold file:text-teks hover:file:bg-garis cursor-pointer"
        />
        <p className="text-xs text-teks-lembut">
          Format: JPG, PNG, WebP (maksimal 2 MB).
        </p>

        {previewFoto && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-garis bg-permukaan p-2">
            <img
              src={previewFoto}
              alt="Preview foto produk"
              className="h-16 w-16 rounded-md object-cover border border-garis"
            />
            <span className="text-xs text-teks-lembut truncate">{namaFileFoto}</span>
          </div>
        )}
      </div>

      <Input
        label="Atau masukkan Link foto manual (URL)"
        name="foto_url"
        placeholder="/produk/kopi.svg atau https://..."
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="input-deskripsi" className="text-sm font-semibold">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleBuatDeskripsiAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1 text-xs font-semibold text-utama hover:text-utama-gelap disabled:opacity-50"
          >
            {loadingAI ? "⏳ Menulis deskripsi..." : "✨ Buat deskripsi dengan AI"}
          </button>
        </div>

        {pesanAI && (
          <p
            className={`text-xs ${
              pesanAI.tipe === "error" ? "text-bahaya" : "text-utama font-medium"
            }`}
          >
            {pesanAI.teks}
          </p>
        )}

        <textarea
          id="input-deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
