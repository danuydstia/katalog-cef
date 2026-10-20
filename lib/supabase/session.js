import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Koneksi sesi admin menggunakan SUPABASE_PUBLISHABLE_KEY dan cookie login.
 * Dipakai untuk login, keluar, ganti password, dan aksi kelola produk.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();

  let supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  // Bersihkan format URL jika ada /rest/v1 atau garis miring di akhir
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Diabaikan jika dipanggil saat render Server Component
        }
      },
    },
  });
}

export const createAdminSessionClient = createSessionClient;
export default createSessionClient;

