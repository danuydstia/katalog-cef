import { createSessionClient } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  const supabase = await createSessionClient();

  // US-35: Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Akses ditolak. Anda harus login sebagai admin." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Ambil seluruh produk dari database
  const { data: daftarProduk, error: dbError } = await supabase
    .from("produk")
    .select("*")
    .order("id", { ascending: true });

  if (dbError) {
    return new Response("Gagal mengambil data produk dari database.", {
      status: 500,
    });
  }

  // Buat isi CSV dengan escaping karakter khusus yang aman (koma, tanda kutip, enter)
  const headers = [
    "ID",
    "Nama Produk",
    "Harga (Rp)",
    "Harga Diskon (Rp)",
    "Kategori",
    "Status",
    "Link Foto",
    "Deskripsi",
    "Tanggal Dibuat",
  ];

  const baris = (daftarProduk || []).map((p) => {
    const isNonaktif =
      p.aktif === false ||
      (typeof p.deskripsi === "string" && /\[nonaktif\]/i.test(p.deskripsi));

    const status = isNonaktif ? "Nonaktif" : "Aktif";

    // Bersihkan tag teknis dari deskripsi untuk ekspor yang rapi
    const deskripsiBersih = typeof p.deskripsi === "string"
      ? p.deskripsi.replace(/\[(nonaktif|habis|baru|terlaris|diskon:[^\]]+)\]/gi, "").trim()
      : "";

    return [
      escapeCsvField(p.id),
      escapeCsvField(p.nama),
      escapeCsvField(p.harga),
      escapeCsvField(p.harga_diskon || ""),
      escapeCsvField(p.kategori || ""),
      escapeCsvField(status),
      escapeCsvField(p.foto_url || ""),
      escapeCsvField(deskripsiBersih),
      escapeCsvField(p.created_at || ""),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...baris].join("\r\n");

  const tanggalStr = new Date().toISOString().slice(0, 10);
  const namaFile = `katalog-produk-${tanggalStr}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
      "Cache-Control": "no-store",
    },
  });
}

