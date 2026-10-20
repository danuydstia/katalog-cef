import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { createServerClient } from "@/lib/supabase/server";
import { getDaftarKategori } from "@/lib/kategori";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const sParams = await searchParams;
  const pesanError = sParams?.error;

  let produk = null;
  const daftarKategori = await getDaftarKategori();

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      produk = data;
    }
  } catch {
    // Jika koneksi gagal atau id tidak valid, produk tetap null
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>

      {pesanError && (
        <div className="max-w-xl rounded-lg border border-bahaya/30 bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      <FormProduk
        produk={produk}
        daftarKategori={daftarKategori}
        action={ubahProduk}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
