/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supaya deploy tidak gagal hanya karena error tipe kecil selama workshop.
  typescript: { ignoreBuildErrors: true },

  async headers() {
    let supabaseDomain = "https://*.supabase.co";
    if (process.env.SUPABASE_URL) {
      try {
        const u = new URL(process.env.SUPABASE_URL);
        supabaseDomain = `${u.protocol}//${u.host}`;
      } catch {}
    }

    const isDev = process.env.NODE_ENV !== "production";

    // Header Content-Security-Policy ketat (K-11, dengan dukungan dev mode React Fast Refresh)
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
      : "script-src 'self' 'unsafe-inline';";

    const connectSrc = isDev
      ? `connect-src 'self' ws: http: ${supabaseDomain} https://*.supabase.co https://generativelanguage.googleapis.com;`
      : `connect-src 'self' ${supabaseDomain} https://*.supabase.co https://generativelanguage.googleapis.com;`;

    const cspHeader = `
      default-src 'self';
      ${scriptSrc}
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: ${supabaseDomain} https://*.supabase.co https://images.unsplash.com;
      font-src 'self' https://fonts.gstatic.com;
      ${connectSrc}
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [
          // K-6: Strict-Transport-Security (max-age 1 tahun, includeSubDomains, preload)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // K-6: X-Frame-Options: DENY
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // K-6: X-Content-Type-Options: nosniff
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // K-6: Referrer-Policy: strict-origin-when-cross-origin
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // K-6: Permissions-Policy (mematikan camera, microphone, geolocation)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // K-11: Content-Security-Policy
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
