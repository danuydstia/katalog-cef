import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TombolBagikan from "@/components/TombolBagikan";
import TombolFavorit from "@/components/TombolFavorit";
import KartuProduk from "@/components/KartuProduk";
import GaleriProduk from "@/components/GaleriProduk";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-26: Metadata SEO dan Open Graph dinamis sesuai data produk
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const supabase = createServerClient();
    const { data: produk } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!produk) {
      return {
        title: `Produk Tidak Ditemukan - ${toko.nama}`,
        description: toko.tagline,
      };
    }

    const deskripsiBersih =
      typeof produk.deskripsi === "string"
        ? produk.deskripsi
            .replace(/\[(diskon:\s*\d+|baru|terlaris|habis)\]/gi, "")
            .trim()
        : "";

    const fotoUtama =
      Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
        ? produk.foto_urls[0]
        : typeof produk.foto_url === "string" && produk.foto_url.includes(",")
        ? produk.foto_url.split(",")[0].trim()
        : produk.foto_url || "/produk/kopi.svg";

    const judul = `${produk.nama} - ${toko.nama}`;
    const deskripsi =
      deskripsiBersih || `${produk.nama} tersedia di ${toko.nama}. ${toko.tagline}`;

    return {
      title: judul,
      description: deskripsi,
      openGraph: {
        title: judul,
        description: deskripsi,
        images: [
          {
            url: fotoUtama,
            alt: produk.nama,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: judul,
        description: deskripsi,
        images: [fotoUtama],
      },
    };
  } catch {
    return {
      title: `Detail Produk - ${toko.nama}`,
      description: toko.tagline,
    };
  }
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  let produk = null;
  let produkTerkait = [];

  try {
    const supabase = createServerClient();

    // Ambil data produk utama berdasarkan ID
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      produk = data;

      // US-17: Ambil produk terkait dari kategori yang sama (kecuali produk ini)
      if (produk.kategori) {
        const { data: terkait } = await supabase
          .from("produk")
          .select("*")
          .eq("kategori", produk.kategori)
          .neq("id", id)
          .limit(4);

        produkTerkait = terkait || [];
      }
    }
  } catch {
    // Jika koneksi bermasalah atau id tidak valid, produk tetap null
  }

  if (!produk) {
    notFound();
  }

  // US-18: Dukungan beberapa foto produk (array atau comma-separated)
  const fotoList =
    Array.isArray(produk.foto_urls) && produk.foto_urls.length > 0
      ? produk.foto_urls
      : typeof produk.foto_urls === "string"
      ? produk.foto_urls.split(",").map((s) => s.trim()).filter(Boolean)
      : typeof produk.foto_url === "string" && produk.foto_url.includes(",")
      ? produk.foto_url.split(",").map((s) => s.trim()).filter(Boolean)
      : [produk.foto_url || "/produk/kopi.svg"];

  // US-19: Status stok
  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    (typeof produk.deskripsi === "string" && /\[habis\]/i.test(produk.deskripsi));

  // US-20: Harga diskon dan badge (bisa dari kolom harga_diskon maupun tag [diskon: 35000] di deskripsi)
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

  // Bersihkan tag teknis ([diskon: ...], [baru], [terlaris], [habis]) dari teks deskripsi publik
  const deskripsiBersih =
    typeof produk.deskripsi === "string"
      ? produk.deskripsi
          .replace(/\[(diskon:\s*\d+|baru|terlaris|habis)\]/gi, "")
          .trim()
      : "";

  const produkLengkap = hasDiskon
    ? { ...produk, harga_diskon: hargaDiskon }
    : produk;

  return (
    <>
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        {/* US-18: Galeri foto produk */}
        <GaleriProduk fotoList={fotoList} nama={produk.nama} />

        <div className="flex flex-col gap-4">
          {/* Baris Navigasi & Aksi: Kembali, Favorit (US-24), Bagikan (US-23) */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama transition-colors"
            >
              &larr; Kembali ke katalog
            </Link>

            <div className="flex items-center gap-2">
              <TombolFavorit produk={produkLengkap} />
              <TombolBagikan produk={produkLengkap} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-teks-lembut">{produk.kategori}</span>

            {/* US-19: Penanda Habis */}
            {isHabis && (
              <span className="rounded-md bg-bahaya px-2 py-0.5 text-xs font-bold text-white">
                Habis
              </span>
            )}

            {/* US-20: Badge Baru / Terlaris */}
            {badge && !isHabis && (
              <span className="rounded-md bg-utama px-2 py-0.5 text-xs font-bold text-white">
                {badge}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-teks">
            {produk.nama}
          </h1>

          {/* US-20: Harga diskon dan harga coret */}
          <div className="flex flex-wrap items-baseline gap-2">
            {hasDiskon ? (
              <>
                <p className="rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
                  {formatRupiah(hargaDiskon)}
                </p>
                <p className="text-sm text-teks-lembut line-through">
                  {formatRupiah(produk.harga)}
                </p>
              </>
            ) : (
              <p className="rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
                {formatRupiah(produk.harga)}
              </p>
            )}
          </div>

          {deskripsiBersih && (
            <p className="max-w-prose leading-relaxed text-teks-lembut">
              {deskripsiBersih}
            </p>
          )}

          {/* Tombol pemesanan WhatsApp, stepper jumlah (US-12), & tambah keranjang (US-21) */}
          <TombolWhatsApp produk={produkLengkap} />
        </div>
      </article>

      {/* US-17: Bagian Produk Terkait */}
      {produkTerkait.length > 0 && (
        <section
          aria-labelledby="judul-terkait"
          className="border-t border-garis pt-10 mt-8 mb-12 flex flex-col gap-5"
        >
          <div className="flex items-center justify-between">
            <h2 id="judul-terkait" className="text-xl font-bold text-teks">
              Produk terkait
            </h2>
            <span className="text-sm text-teks-lembut">
              Kategori {produk.kategori}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
