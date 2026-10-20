import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Bandingkan Produk - ${toko.nama}`,
  description: "Bandingkan dua produk UMKM secara berdampingan untuk memilih yang paling sesuai.",
};

export default async function HalamanBandingkan({ searchParams }) {
  const params = await searchParams;
  const id1 = params?.id1;
  const id2 = params?.id2;

  if (!id1 || !id2) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl font-extrabold text-teks">Bandingkan 2 Produk</h1>
        <p className="text-teks-lembut max-w-md">
          Silakan pilih 2 produk dari katalog dengan menekan tombol <strong>Bandingkan</strong> pada kartu produk untuk melihat perbandingannya di sini.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-utama px-5 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap transition-colors"
        >
          Lihat Katalog
        </Link>
      </div>
    );
  }

  let produk1 = null;
  let produk2 = null;

  try {
    const supabase = createServerClient();
    const [res1, res2] = await Promise.all([
      supabase.from("produk").select("*").eq("id", id1).maybeSingle(),
      supabase.from("produk").select("*").eq("id", id2).maybeSingle(),
    ]);

    if (!res1.error) produk1 = res1.data;
    if (!res2.error) produk2 = res2.data;
  } catch {}

  // US-37: Produk yang tidak ada ditangani dengan jelas
  if (!produk1 || !produk2) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-4">
        <div className="rounded-full bg-bahaya/10 p-3 text-bahaya">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-teks">Produk Tidak Ditemukan</h1>
        <p className="text-teks-lembut max-w-md">
          Salah satu atau kedua produk yang ingin Anda bandingkan tidak ditemukan di database. Produk mungkin telah dihapus.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-utama px-5 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap transition-colors"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const getFotoUtama = (p) => {
    return Array.isArray(p.foto_urls) && p.foto_urls.length > 0
      ? p.foto_urls[0]
      : typeof p.foto_url === "string" && p.foto_url.includes(",")
      ? p.foto_url.split(",")[0].trim()
      : p.foto_url || "/produk/kopi.svg";
  };

  const getHargaDiskon = (p) => {
    const diskonDeskripsi =
      typeof p.deskripsi === "string"
        ? p.deskripsi.match(/\[diskon:\s*(\d+)\]/i)?.[1]
        : null;
    return p.harga_diskon != null
      ? Number(p.harga_diskon)
      : diskonDeskripsi
      ? Number(diskonDeskripsi)
      : null;
  };

  const bersihkanDeskripsi = (deskripsi) => {
    if (typeof deskripsi !== "string") return "";
    return deskripsi.replace(/\[(diskon:\s*\d+|baru|terlaris|habis|nonaktif)\]/gi, "").trim();
  };

  const p1Diskon = getHargaDiskon(produk1);
  const p2Diskon = getHargaDiskon(produk2);

  return (
    <div className="py-8 sm:py-12 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama self-start"
        >
          &larr; Kembali ke katalog
        </Link>
        <h1 className="text-3xl font-extrabold text-teks">Perbandingan Produk</h1>
        <p className="text-sm text-teks-lembut">
          Membandingkan <strong>{produk1.nama}</strong> dan <strong>{produk2.nama}</strong> secara berdampingan.
        </p>
      </div>

      {/* Grid Perbandingan Berdampingan (US-37) */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {[produk1, produk2].map((prod, idx) => {
          const diskon = idx === 0 ? p1Diskon : p2Diskon;
          const hasDiskon = Boolean(diskon) && diskon < Number(prod.harga);
          const prodLengkap = hasDiskon ? { ...prod, harga_diskon: diskon } : prod;

          return (
            <div
              key={prod.id}
              className="flex flex-col rounded-2xl border border-garis bg-latar p-4 sm:p-6 gap-4"
            >
              {/* Foto Produk */}
              <div className="aspect-square w-full rounded-xl overflow-hidden border border-garis bg-permukaan">
                <img
                  src={getFotoUtama(prod)}
                  alt={prod.nama}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Kategori & Nama */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-teks-lembut uppercase tracking-wider">
                  {prod.kategori || "Tanpa Kategori"}
                </span>
                <Link
                  href={`/produk/${prod.id}`}
                  className="text-lg sm:text-xl font-bold text-teks hover:text-utama transition-colors line-clamp-2"
                >
                  {prod.nama}
                </Link>
              </div>

              {/* Harga */}
              <div className="flex flex-wrap items-baseline gap-2 pt-1 border-t border-garis">
                {hasDiskon ? (
                  <>
                    <span className="rounded-md bg-harga-latar px-2.5 py-1 text-base font-bold text-harga">
                      {formatRupiah(diskon)}
                    </span>
                    <span className="text-xs text-teks-lembut line-through">
                      {formatRupiah(prod.harga)}
                    </span>
                  </>
                ) : (
                  <span className="rounded-md bg-harga-latar px-2.5 py-1 text-base font-bold text-harga">
                    {formatRupiah(prod.harga)}
                  </span>
                )}
              </div>

              {/* Deskripsi */}
              <div className="flex flex-col gap-1 pt-2 border-t border-garis flex-1">
                <span className="text-xs font-bold text-teks-lembut uppercase">Deskripsi:</span>
                <p className="text-xs sm:text-sm text-teks-lembut leading-relaxed">
                  {bersihkanDeskripsi(prod.deskripsi) || "-"}
                </p>
              </div>

              {/* Tombol Pesan */}
              <div className="pt-2">
                <TombolWhatsApp produk={prodLengkap} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

