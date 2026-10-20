"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { useKeranjang } from "@/components/PenyediaAplikasi";

export default function HalamanKeranjang() {
  const {
    items,
    ubahJumlah,
    hapusItem,
    kosongkanKeranjang,
    totalItem,
    totalHarga,
    dimuat,
  } = useKeranjang();

  if (!dimuat) {
    return (
      <div className="py-12 text-center text-teks-lembut">
        <p>Memuat keranjang belanja...</p>
      </div>
    );
  }

  // Format pesan WhatsApp untuk memesan seluruh isi keranjang (US-21)
  const buatTautanWhatsApp = () => {
    const nomorWa = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";

    const daftarItemTeks = items
      .map((item, index) => {
        const hargaSatuan =
          item.harga_diskon && Number(item.harga_diskon) < Number(item.harga)
            ? Number(item.harga_diskon)
            : Number(item.harga);
        const subtotal = hargaSatuan * item.jumlah;
        return `${index + 1}. ${item.jumlah}x ${item.nama} - ${formatRupiah(subtotal)}`;
      })
      .join("\n");

    const pesan = `Halo ${toko.nama}, saya ingin memesan produk berikut:\n\n${daftarItemTeks}\n\nTotal Pembayaran: ${formatRupiah(
      totalHarga
    )}\n\nMohon konfirmasi ketersediaan dan ongkos kirim. Terima kasih!`;

    return `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;
  };

  const handleKosongkan = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh isi keranjang?")) {
      kosongkanKeranjang();
    }
  };

  return (
    <div className="py-8 sm:py-12">
      {/* Breadcrumb / Kembali */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama mb-6 transition-colors"
      >
        &larr; Kembali belanja ke katalog
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-teks">
          Keranjang Belanja
        </h1>
        <p className="text-sm text-teks-lembut">
          Periksa pesanan Anda sebelum menghubungi kami melalui WhatsApp.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-garis bg-permukaan p-10 text-center flex flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-latar border border-garis text-teks-lembut">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-teks">Keranjang Anda masih kosong</h2>
            <p className="text-sm text-teks-lembut">
              Belum ada produk yang ditambahkan ke keranjang belanja.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-utama px-6 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Daftar Produk di Keranjang */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-garis">
              <span className="text-sm font-semibold text-teks">
                Produk ({totalItem} item)
              </span>
              <button
                type="button"
                onClick={handleKosongkan}
                className="text-xs text-bahaya hover:underline font-medium"
              >
                Kosongkan keranjang
              </button>
            </div>

            <div className="flex flex-col divide-y divide-garis">
              {items.map((item) => {
                const hargaSatuan =
                  item.harga_diskon && Number(item.harga_diskon) < Number(item.harga)
                    ? Number(item.harga_diskon)
                    : Number(item.harga);
                const subtotal = hargaSatuan * item.jumlah;

                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.foto_url || "/produk/kopi.svg"}
                        alt={item.nama}
                        className="h-20 w-20 rounded-xl border border-garis bg-permukaan object-cover shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/produk/${item.id}`}
                          className="font-semibold text-teks hover:text-utama transition-colors line-clamp-2"
                        >
                          {item.nama}
                        </Link>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-harga">
                            {formatRupiah(hargaSatuan)}
                          </span>
                          {item.harga_diskon &&
                            Number(item.harga_diskon) < Number(item.harga) && (
                              <span className="text-xs text-teks-lembut line-through">
                                {formatRupiah(item.harga)}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      {/* Pengubah Jumlah (US-21) */}
                      <div className="flex items-center rounded-lg border border-garis bg-latar">
                        <button
                          type="button"
                          onClick={() => ubahJumlah(item.id, item.jumlah - 1)}
                          className="px-2.5 py-1 text-sm font-bold text-teks hover:bg-permukaan focus:outline-none transition-colors"
                          aria-label={`Kurangi jumlah ${item.nama}`}
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-teks">
                          {item.jumlah}
                        </span>
                        <button
                          type="button"
                          onClick={() => ubahJumlah(item.id, item.jumlah + 1)}
                          className="px-2.5 py-1 text-sm font-bold text-teks hover:bg-permukaan focus:outline-none transition-colors"
                          aria-label={`Tambah jumlah ${item.nama}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-24">
                        <p className="text-sm font-bold text-teks">
                          {formatRupiah(subtotal)}
                        </p>
                      </div>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => hapusItem(item.id)}
                        className="p-1.5 text-teks-lembut hover:text-bahaya transition-colors"
                        title="Hapus produk ini"
                        aria-label={`Hapus ${item.nama} dari keranjang`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Belanja & Tombol WhatsApp (US-21) */}
          <div className="rounded-2xl border border-garis bg-permukaan p-6 flex flex-col gap-5 h-fit lg:sticky lg:top-20">
            <h2 className="text-lg font-bold text-teks border-b border-garis pb-3">
              Ringkasan Pesanan
            </h2>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-teks-lembut">
                <span>Total Item</span>
                <span className="font-semibold text-teks">{totalItem} produk</span>
              </div>
              <div className="flex justify-between text-base font-bold text-teks pt-2 border-t border-garis">
                <span>Total Belanja</span>
                <span className="text-xl text-harga font-extrabold">
                  {formatRupiah(totalHarga)}
                </span>
              </div>
            </div>

            {/* Tombol Pesan Semua via WhatsApp (US-21) */}
            <a
              href={buatTautanWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-utama px-6 py-3.5 font-bold text-white shadow-sm hover:bg-utama-gelap transition-colors text-center"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Pesan Semua via WhatsApp</span>
            </a>

            <p className="text-xs text-teks-lembut text-center">
              Pesanan akan dirangkum dan dikirim ke WhatsApp resmi {toko.nama}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

