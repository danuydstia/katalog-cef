export default function robots() {
  const baseUrl = process.env.SITE_URL || "https://katalog-umkm.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

