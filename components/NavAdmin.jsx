import Link from "next/link";
import { keluar } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis pb-4 text-sm">
      <Link href="/admin" className="font-semibold hover:text-utama transition-colors">
        Dashboard
      </Link>
      <Link href="/admin/kategori" className="font-semibold hover:text-utama transition-colors">
        Kategori
      </Link>
      <Link href="/admin/banner" className="font-semibold hover:text-utama transition-colors">
        Banner Promo
      </Link>
      <Link href="/admin/ulasan" className="font-semibold hover:text-utama transition-colors">
        Ulasan
      </Link>
      <Link href="/admin/pengaturan" className="font-semibold hover:text-utama transition-colors">
        Pengaturan Toko
      </Link>
      <Link href="/admin/pengguna" className="font-semibold hover:text-utama transition-colors">
        Kelola Admin
      </Link>
      <Link href="/admin/log" className="font-semibold hover:text-utama transition-colors">
        Log Aktivitas
      </Link>
      <Link href="/admin/impor" className="font-semibold hover:text-utama transition-colors">
        Impor CSV
      </Link>
      <Link href="/admin/password" className="font-semibold hover:text-utama transition-colors">
        Password
      </Link>
      <form action={keluar} className="ml-auto">
        <button type="submit" className="text-teks-lembut hover:text-bahaya transition-colors cursor-pointer">
          Keluar
        </button>
      </form>
    </nav>
  );
}
