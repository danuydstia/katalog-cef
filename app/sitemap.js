import { createServerClient } from "@/lib/supabase/server";

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || "https://katalog-umkm.vercel.app";

  const ruteStatis = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/favorit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/keranjang`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  let ruteProduk = [];
  try {
    const supabase = createServerClient();
    const { data: daftarProduk } = await supabase
      .from("produk")
      .select("id, created_at");

    if (daftarProduk && daftarProduk.length > 0) {
      ruteProduk = daftarProduk.map((p) => ({
        url: `${baseUrl}/produk/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    }
  } catch {
    // Abaikan jika query database gagal saat build
  }

  return [...ruteStatis, ...ruteProduk];
}

