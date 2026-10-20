export default function DetailLoading() {
  return (
    <div className="grid gap-8 py-8 md:grid-cols-2 md:py-12 animate-pulse">
      {/* Skeleton Gambar Galeri */}
      <div className="flex flex-col gap-3">
        <div className="aspect-square w-full rounded-2xl bg-permukaan border border-garis" />
        <div className="flex gap-2">
          <div className="h-16 w-16 rounded-lg bg-permukaan border border-garis" />
          <div className="h-16 w-16 rounded-lg bg-permukaan border border-garis" />
          <div className="h-16 w-16 rounded-lg bg-permukaan border border-garis" />
        </div>
      </div>

      {/* Skeleton Info Produk */}
      <div className="flex flex-col gap-4">
        <div className="h-4 w-28 rounded bg-permukaan" />
        <div className="h-4 w-20 rounded bg-permukaan" />
        <div className="h-8 w-3/4 rounded-lg bg-permukaan" />
        <div className="h-7 w-32 rounded-md bg-permukaan" />
        <div className="flex flex-col gap-2 pt-2">
          <div className="h-4 w-full rounded bg-permukaan" />
          <div className="h-4 w-5/6 rounded bg-permukaan" />
          <div className="h-4 w-2/3 rounded bg-permukaan" />
        </div>
        <div className="h-12 w-48 rounded-lg bg-permukaan mt-4" />
      </div>
    </div>
  );
}

