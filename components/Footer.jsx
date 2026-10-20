import Link from "next/link";
import { toko } from "@/lib/toko";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-garis bg-permukaan transition-colors">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-teks-lembut sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-teks">{toko.nama}</p>
          <p>{toko.alamat}</p>
          <p>{toko.jamBuka}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          {/* US-22: Tautan ke Halaman Tentang */}
          <Link
            href="/tentang"
            className="underline underline-offset-4 hover:text-utama transition-colors"
          >
            Tentang Toko & Kontak
          </Link>
          <Link
            href="/admin"
            className="underline underline-offset-4 hover:text-utama transition-colors"
          >
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
