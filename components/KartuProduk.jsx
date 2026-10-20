import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { kategoriKeSlug } from "@/lib/kategori-slug";
import TombolFavorit from "@/components/TombolFavorit";
import TombolTambahKeranjang from "@/components/TombolTambahKeranjang";
import TombolBandingkan from "@/components/TombolBandingkan";

export default function KartuProduk({ produk }) {
  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    (typeof produk.deskripsi === "string" && /\[habis\]/i.test(produk.deskripsi));

  // Dukungan harga diskon: baik dari kolom harga_diskon maupun tag [diskon: 35000] di deskripsi (US-20)
  const diskonDeskripsi =
    typeof produk.deskripsi === "string"
      ? produk.deskripsi.match(/\[diskon:\s*(\d+)\]/i)?.[1]
      : null;

  const hargaDiskon =
    produk.harga_diskon != null
      ? Number(produk.harga_diskon)
      : diskonDeskripsi
      ? Number(diskonDeskripsi)
      : null;

  const hasDiskon =
    Boolean(hargaDiskon) &&
    hargaDiskon < Number(produk.harga);

  const badge =
    produk.badge ||
    (typeof produk.deskripsi === "string" && /\[baru\]/i.test(produk.deskripsi)
      ? "Baru"
      : typeof produk.deskripsi === "string" && /\[terlaris\]/i.test(produk.deskripsi)
      ? "Terlaris"
      : null);

  // Ambil foto pertama jika foto berupa koma-separated (US-18)
  const fotoUtama =
    Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
      ? produk.foto_urls[0]
      : typeof produk.foto_url === "string" && produk.foto_url.includes(",")
      ? produk.foto_url.split(",")[0].trim()
      : produk.foto_url || "/produk/kopi.svg";

  const produkDiskon = hasDiskon
    ? { ...produk, harga_diskon: hargaDiskon }
    : produk;

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar transition-colors"
    >
      <div className="relative aspect-square w-full bg-permukaan overflow-hidden">
        <img
          src={fotoUtama}
          alt={produk.nama}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Tombol Simpan Favorit (US-24) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <TombolFavorit produk={produkDiskon} varian="ikon" />
        </div>

        {/* Badge "Habis" jika stok habis (US-19) */}
        {isHabis ? (
          <span className="absolute top-2.5 left-2.5 rounded-md bg-bahaya px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            Habis
          </span>
        ) : badge ? (
          /* Badge "Baru" atau "Terlaris" (US-20) */
          <span className="absolute top-2.5 left-2.5 rounded-md bg-utama px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* US-49: Tautan Kategori di Kartu Produk */}
        {produk.kategori && (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/kategori/${kategoriKeSlug(produk.kategori)}`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/kategori/${kategoriKeSlug(produk.kategori)}`;
              }
            }}
            className="text-xs text-teks-lembut hover:text-utama hover:underline cursor-pointer z-10 self-start transition-colors"
          >
            {produk.kategori}
          </span>
        )}
        <h3 className="font-semibold leading-snug group-hover:text-utama line-clamp-2 transition-colors">
          {produk.nama}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-baseline gap-1.5">
            {/* Harga coret jika ada diskon (US-20) */}
            {hasDiskon ? (
              <>
                <p className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                  {formatRupiah(hargaDiskon)}
                </p>
                <span className="text-xs text-teks-lembut line-through">
                  {formatRupiah(produk.harga)}
                </span>
              </>
            ) : (
              <p className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                {formatRupiah(produk.harga)}
              </p>
            )}
          </div>

          {/* Tombol Bandingkan (US-37) & Tambah Keranjang (US-21) */}
          <div className="flex items-center gap-1 shrink-0">
            <TombolBandingkan produk={produkDiskon} varian="ikon" />
            {!isHabis && <TombolTambahKeranjang produk={produkDiskon} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
