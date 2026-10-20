export default function Loading() {
  return (
    <div className="py-10 sm:py-14 flex flex-col gap-8 animate-pulse">
      {/* Skeleton Header Toko */}
      <div className="flex flex-col gap-3">
        <div className="h-10 w-2/3 max-w-md rounded-xl bg-permukaan" />
        <div className="h-5 w-full max-w-lg rounded-lg bg-permukaan" />
        <div className="h-4 w-40 rounded-lg bg-permukaan" />
      </div>

      {/* Skeleton Filter & Pencarian */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-40 rounded-lg bg-permukaan" />
        <div className="flex gap-2">
          <div className="h-9 w-36 rounded-lg bg-permukaan" />
          <div className="h-9 w-32 rounded-lg bg-permukaan" />
        </div>
      </div>

      {/* Skeleton Grid Kartu Produk */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
          >
            <div className="aspect-square w-full bg-permukaan" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-16 rounded bg-permukaan" />
              <div className="h-4 w-3/4 rounded bg-permukaan" />
              <div className="mt-2 h-6 w-24 rounded-md bg-permukaan" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

