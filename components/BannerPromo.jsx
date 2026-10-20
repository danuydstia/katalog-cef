import Link from "next/link";

export default function BannerPromo({ banner }) {
  if (!banner || banner.aktif === false) {
    return null;
  }

  return (
    <aside aria-label="Banner promosi" className="relative my-4 overflow-hidden rounded-2xl border border-utama/30 bg-gradient-to-r from-utama/15 via-utama/5 to-permukaan p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-utama px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
            ★ Promo Spesial
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-teks tracking-tight">
            {banner.judul}
          </h2>
          {banner.teks && (
            <p className="text-sm leading-relaxed text-teks-lembut">
              {banner.teks}
            </p>
          )}
        </div>

        {banner.tautan && (
          <Link
            href={banner.tautan}
            className="self-start sm:self-center shrink-0 rounded-xl bg-utama px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-utama-gelap transition-colors"
          >
            Lihat Penawaran &rarr;
          </Link>
        )}
      </div>
    </aside>
  );
}

