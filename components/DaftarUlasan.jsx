export default function DaftarUlasan({ ulasanData = { daftar: [], totalUlasan: 0, rataRata: 0 } }) {
  const { daftar = [], totalUlasan = 0, rataRata = 0 } = ulasanData;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Rata-rata Rating */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-garis bg-permukaan p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-teks">{rataRata > 0 ? rataRata : "0.0"}</span>
          <span className="text-sm text-teks-lembut">/ 5.0</span>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(rataRata)
                  ? "fill-harga text-harga"
                  : "fill-none text-teks-lembut/40"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          ))}
        </div>

        <span className="text-sm font-semibold text-teks-lembut">
          ({totalUlasan} ulasan pembeli)
        </span>
      </div>

      {/* Daftar Komentar Ulasan */}
      {daftar.length === 0 ? (
        <div className="rounded-xl border border-dashed border-garis p-8 text-center text-sm text-teks-lembut">
          Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-garis rounded-2xl border border-garis bg-latar">
          {daftar.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teks">{item.nama}</span>
                <span className="text-xs text-teks-lembut">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : ""}
                </span>
              </div>

              {/* Bintang */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${
                      star <= item.rating
                        ? "fill-harga text-harga"
                        : "fill-none text-teks-lembut/30"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-teks leading-relaxed">
                {item.komentar}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

