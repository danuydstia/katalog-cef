import Tombol from "@/components/Tombol";

export default function TidakDitemukan() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 sm:py-28 text-center">
      <span className="rounded-full bg-utama/10 px-4 py-1.5 text-sm font-extrabold text-utama">
        404
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-teks">
        Halaman Tidak Ditemukan
      </h1>
      <p className="max-w-md text-base text-teks-lembut">
        Maaf, halaman atau produk yang Anda cari tidak tersedia, sudah dihapus, atau tautan yang Anda tuju salah.
      </p>
      <div className="mt-2">
        <Tombol href="/">Kembali ke Katalog</Tombol>
      </div>
    </div>
  );
}
