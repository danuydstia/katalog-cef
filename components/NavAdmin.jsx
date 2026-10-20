import Link from "next/link";
import { keluar } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-garis pb-4 text-sm">
      <Link href="/admin" className="font-semibold hover:text-utama transition-colors">
        Dashboard & Produk
      </Link>
      {/* US-31: Navigasi ke Kelola Kategori */}
      <Link href="/admin/kategori" className="font-semibold hover:text-utama transition-colors">
        Kategori
      </Link>
      <Link href="/admin/password" className="font-semibold hover:text-utama transition-colors">
        Ganti password
      </Link>
      <form action={keluar} className="ml-auto">
        <button type="submit" className="text-teks-lembut hover:text-bahaya transition-colors cursor-pointer">
          Keluar
        </button>
      </form>
    </nav>
  );
}
