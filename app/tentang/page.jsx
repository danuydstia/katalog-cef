import Link from "next/link";
import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang Kami - ${toko.nama}`,
  description: `Profil dan informasi kontak ${toko.nama}. ${toko.tagline}`,
};

export default function HalamanTentang() {
  const nomorWaBersih = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";
  const waUrl = `https://wa.me/${nomorWaBersih}?text=${encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya mengenai produk Anda.`
  )}`;

  return (
    <div className="py-10 sm:py-14">
      {/* Navigasi kembali */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama mb-6"
      >
        &larr; Kembali ke katalog
      </Link>

      {/* Header Profil Toko */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-teks">
          Tentang {toko.nama}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-teks-lembut">
          {toko.tagline}
        </p>
      </div>

      {/* Kartu Informasi & Kontak */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {/* Profil Toko */}
        <div className="rounded-2xl border border-garis bg-permukaan p-6 sm:p-8 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-utama/10 text-utama">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-teks">Profil Usaha</h2>
          </div>
          <p className="text-sm leading-relaxed text-teks-lembut">
            Kami menghadirkan produk-produk berkualitas terbaik pilihan yang diolah dan diproduksi dengan dedikasi tinggi. Komitmen kami adalah memberikan kepuasan dan kemudahan belanja langsung ke pelanggan melalui pemesanan WhatsApp yang cepat dan terpercaya.
          </p>
        </div>

        {/* Jam Operasional */}
        <div className="rounded-2xl border border-garis bg-permukaan p-6 sm:p-8 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-utama/10 text-utama">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-teks">Jam Operasional</h2>
          </div>
          <p className="text-base font-semibold text-teks">{toko.jamBuka}</p>
          <p className="text-sm text-teks-lembut">
            Pemesanan di luar jam buka tetap diterima melalui WhatsApp dan akan segera kami proses saat jam operasional dimulai.
          </p>
        </div>

        {/* Alamat Toko */}
        <div className="rounded-2xl border border-garis bg-permukaan p-6 sm:p-8 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-utama/10 text-utama">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-teks">Lokasi & Alamat</h2>
          </div>
          <p className="text-base font-medium text-teks">{toko.alamat}</p>
          <p className="text-sm text-teks-lembut">
            Silakan berkunjung langsung ke tempat kami atau hubungi nomor kontak kami untuk informasi pengiriman.
          </p>
        </div>

        {/* Kontak & WhatsApp */}
        <div className="rounded-2xl border border-garis bg-permukaan p-6 sm:p-8 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-utama/10 text-utama">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <h2 className="text-xl font-bold text-teks">Kontak & Pemesanan</h2>
            </div>
            <p className="text-sm text-teks-lembut">
              WhatsApp Resmi: <strong className="text-teks">{toko.nomorWhatsApp}</strong>
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap transition-colors self-start"
          >
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

