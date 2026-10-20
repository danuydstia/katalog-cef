import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerClient } from "@/lib/supabase/server";
import { createSessionClient } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.sukses;

  let daftarProduk = [];
  let pesanError = null;

  try {
    let supabase;
    try {
      const sessionClient = await createSessionClient();
      const {
        data: { user },
      } = await sessionClient.auth.getUser();
      supabase = user ? sessionClient : createServerClient();
    } catch {
      supabase = createServerClient();
    }

    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError =
      err?.message || "Gagal memuat daftar produk. Silakan coba beberapa saat lagi.";
  }

  const errorTampil = params?.error || pesanError;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanSukses && (
        <div className="rounded-xl border border-utama/30 bg-permukaan p-4 text-center">
          <p className="text-sm font-medium text-utama">{pesanSukses}</p>
        </div>
      )}

      {errorTampil && (
        <div className="rounded-xl border border-bahaya/30 bg-permukaan p-6 text-center">
          <p className="text-sm font-medium text-bahaya">{errorTampil}</p>
        </div>
      )}

      {daftarProduk.length === 0 && !errorTampil ? (
        <p className="py-12 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
