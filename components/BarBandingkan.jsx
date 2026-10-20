"use client";

import Link from "next/link";
import { useBandingkan } from "@/components/PenyediaAplikasi";

export default function BarBandingkan() {
  const { daftarBandingkan, hapusBandingkan, kosongkanBandingkan } = useBandingkan();

  if (!daftarBandingkan || daftarBandingkan.length === 0) {
    return null;
  }

  const siapBandingkan = daftarBandingkan.length === 2;
  const linkBandingkan = siapBandingkan
    ? `/bandingkan?id1=${daftarBandingkan[0].id}&id2=${daftarBandingkan[1].id}`
    : "#";

  return (
    <aside aria-label="Menu perbandingan produk" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-lg rounded-2xl border border-garis bg-latar/95 backdrop-blur-md p-3.5 shadow-xl transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {daftarBandingkan.map((prod) => (
            <div
              key={prod.id}
              className="flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-xs font-semibold text-teks"
            >
              <span className="truncate max-w-[100px]">{prod.nama}</span>
              <button
                type="button"
                onClick={() => hapusBandingkan(prod.id)}
                className="text-teks-lembut hover:text-bahaya text-sm font-bold ml-1"
                title="Hapus pilihan"
                aria-label={`Hapus ${prod.nama} dari perbandingan`}
              >
                &times;
              </button>
            </div>
          ))}

          {daftarBandingkan.length === 1 && (
            <span className="text-xs text-teks-lembut italic whitespace-nowrap">
              + Pilih 1 produk lagi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {siapBandingkan ? (
            <Link
              href={linkBandingkan}
              className="rounded-lg bg-utama px-3.5 py-1.5 text-xs font-bold text-white hover:bg-utama-gelap transition-colors"
            >
              Bandingkan (2)
            </Link>
          ) : (
            <span className="rounded-lg bg-permukaan border border-garis px-3 py-1.5 text-xs font-semibold text-teks-lembut opacity-60 cursor-not-allowed">
              Pilih 2 produk
            </span>
          )}

          <button
            type="button"
            onClick={kosongkanBandingkan}
            className="text-xs text-teks-lembut hover:text-bahaya p-1"
            title="Batalkan perbandingan"
          >
            Batal
          </button>
        </div>
      </div>
    </aside>
  );
}

